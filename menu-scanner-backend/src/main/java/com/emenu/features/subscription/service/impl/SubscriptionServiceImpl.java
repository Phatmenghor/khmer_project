package com.emenu.features.subscription.service.impl;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.enums.sub_scription.SubscriptionPaymentType;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.repository.BusinessSettingRepository;
import com.emenu.features.subscription.dto.filter.SubscriptionHistoryFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCancelRequest;
import com.emenu.features.subscription.dto.request.SubscriptionRenewRequest;
import com.emenu.features.auth.models.User;
import com.emenu.features.subscription.dto.response.MySubscriptionSummaryResponse;
import com.emenu.features.subscription.dto.response.SubscriptionHistoryResponse;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.models.SubscriptionPayment;
import com.emenu.features.subscription.models.SubscriptionPlan;
import com.emenu.features.subscription.repository.SubscriptionPaymentRepository;
import com.emenu.features.subscription.repository.SubscriptionPlanRepository;
import com.emenu.features.subscription.repository.SubscriptionRepository;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.features.subscription.mapper.SubscriptionHistoryMapper;
import com.emenu.features.subscription.service.SubscriptionService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final BusinessRepository businessRepository;
    private final BusinessSettingRepository businessSettingRepository;
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final PaginationMapper paginationMapper;
    private final SubscriptionHistoryMapper subscriptionHistoryMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional(readOnly = true)
    public MySubscriptionSummaryResponse getMySubscriptionSummary() {
        User currentUser = securityUtils.getCurrentUser();
        UUID businessId = currentUser.getBusinessId();

        List<SubscriptionHistoryResponse> history = businessId != null
                ? getAllByBusinessId(businessId)
                : List.of();

        Optional<Subscription> latestOpt = businessId != null
                ? subscriptionRepository.findLatestByBusinessId(businessId)
                : Optional.empty();

        if (latestOpt.isPresent()) {
            Subscription sub = latestOpt.get();
            String pName = sub.getPlan() != null ? sub.getPlan().getName() : "Free Trial";
            LocalDate start = sub.getStartDate() != null ? sub.getStartDate().toLocalDate() : currentUser.getCreatedAt().toLocalDate();
            LocalDate end = sub.getEndDate() != null ? sub.getEndDate().toLocalDate() : start.plusDays(7);
            Long remaining = sub.getDaysRemaining();

            String cycle = "7-Day Trial";
            int totalDays = 7;
            if (sub.getPlan() != null && sub.getPlan().getDurationType() != null) {
                switch (sub.getPlan().getDurationType()) {
                    case FREE_TRIAL -> { cycle = "7-Day Trial"; totalDays = 7; }
                    case MONTHLY -> { cycle = "Monthly"; totalDays = 30; }
                    case SIX_MONTHS -> { cycle = "6 Months"; totalDays = 180; }
                    case YEARLY -> { cycle = "Yearly"; totalDays = 365; }
                }
            }

            String remainingText = (remaining != null && remaining > 0) ? (remaining + " Days") : "Expired";
            int progressPct = (remaining != null) ? (int) Math.max(0, Math.min(100, Math.round((double) remaining / totalDays * 100))) : 0;

            return MySubscriptionSummaryResponse.builder()
                    .currentSubscriptionId(sub.getId())
                    .planName(pName)
                    .billingCycle(cycle)
                    .subscriptionStartDate(start)
                    .subscriptionEndDate(end)
                    .daysRemaining(remaining)
                    .daysRemainingText(remainingText)
                    .progressPercent(progressPct)
                    .isSubscriptionActive(sub.isActive())
                    .subscriptionStatus(sub.isCancelled() ? "CANCELLED" : (sub.isExpired() ? "EXPIRED" : "ACTIVE"))
                    .history(history)
                    .build();
        }

        LocalDate start = currentUser.getCreatedAt() != null ? currentUser.getCreatedAt().toLocalDate() : LocalDate.now();
        LocalDate end = start.plusDays(7);
        LocalDate today = LocalDate.now();
        long remaining = today.isAfter(end) ? 0L : ChronoUnit.DAYS.between(today, end);
        String remainingText = remaining > 0 ? (remaining + " Days") : "Expired";
        int progressPct = (int) Math.max(0, Math.min(100, Math.round((double) remaining / 7.0 * 100)));

        SubscriptionHistoryResponse defaultHistoryItem = new SubscriptionHistoryResponse();
        defaultHistoryItem.setPlanName("Free Trial");
        defaultHistoryItem.setStartDate(start);
        defaultHistoryItem.setEndDate(end);
        defaultHistoryItem.setStatus("ACTIVE");
        defaultHistoryItem.setPaymentStatus("FREE / INCLUDED");
        defaultHistoryItem.setDaysRemaining(remaining);

        List<SubscriptionHistoryResponse> defaultHistory = history.isEmpty() ? List.of(defaultHistoryItem) : history;

        return MySubscriptionSummaryResponse.builder()
                .planName("Free Trial")
                .billingCycle("7-Day Trial")
                .subscriptionStartDate(start)
                .subscriptionEndDate(end)
                .daysRemaining(remaining)
                .daysRemainingText(remainingText)
                .progressPercent(progressPct)
                .isSubscriptionActive(true)
                .subscriptionStatus("ACTIVE")
                .history(defaultHistory)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionHistoryResponse getSubscriptionById(UUID subscriptionId) {
        log.info("Getting subscription by ID: {}", subscriptionId);
        Subscription subscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new NotFoundException("Subscription not found: " + subscriptionId));
        subscription = subscriptionRepository.findByIdWithRelationships(subscription.getId()).orElse(subscription);
        return toHistoryResponse(subscription);
    }

    @Override
    public SubscriptionHistoryResponse renewSubscription(UUID subscriptionId, SubscriptionRenewRequest request) {
        log.info("Renewing subscription: {}", subscriptionId);
        Subscription oldSubscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new NotFoundException("Subscription not found: " + subscriptionId));

        UUID newPlanId = request.getNewPlanId() != null ? request.getNewPlanId() : oldSubscription.getPlanId();
        SubscriptionPlan plan = planRepository.findByIdAndIsDeletedFalse(newPlanId)
                .orElseThrow(() -> new NotFoundException("Subscription plan not found: " + newPlanId));

        // Old subscription stays untouched as history
        LocalDateTime newStartDate = oldSubscription.isExpired() ? LocalDateTime.now() : oldSubscription.getEndDate();
        Subscription newSubscription = new Subscription();
        newSubscription.setBusinessId(oldSubscription.getBusinessId());
        newSubscription.setPlanId(plan.getId());
        newSubscription.setStartDate(newStartDate);
        newSubscription.setEndDate(plan.calculateEndDate(newStartDate));
        newSubscription.setAutoRenew(oldSubscription.getAutoRenew());
        Subscription savedNew = subscriptionRepository.save(newSubscription);

        createRenewalPayment(savedNew, request, plan);
        updateBusinessSubscriptionStatus(savedNew.getBusinessId());
        savedNew = subscriptionRepository.findByIdWithRelationships(savedNew.getId()).orElse(savedNew);
        log.info("Subscription renewed: new subscription {} created, old {} kept as history - new end date: {}",
                savedNew.getId(), subscriptionId, savedNew.getEndDate());
        return toHistoryResponse(savedNew);
    }

    @Override
    public SubscriptionHistoryResponse cancelSubscription(UUID subscriptionId, SubscriptionCancelRequest request) {
        log.info("Cancelling subscription: {} with refund amount: {}", subscriptionId, request.getRefundAmount());
        Subscription subscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new NotFoundException("Subscription not found: " + subscriptionId));
        subscription.cancel();
        subscription.setCancellationReason(request.getReason());
        subscriptionPaymentRepository
                .findBySubscriptionIdAndStatusAndIsDeletedFalse(subscription.getId(), SubscriptionPaymentStatus.PENDING)
                .ifPresent(p -> {
                    p.setStatus(SubscriptionPaymentStatus.CANCELLED);
                    subscriptionPaymentRepository.save(p);
                });
        Subscription cancelledSubscription = subscriptionRepository.save(subscription);
        if (request.hasRefundAmount()) {
            createRefundPayment(cancelledSubscription, request);
        }
        updateBusinessSubscriptionStatus(cancelledSubscription.getBusinessId());
        cancelledSubscription = subscriptionRepository.findByIdWithRelationships(cancelledSubscription.getId()).orElse(cancelledSubscription);
        log.info("Subscription cancelled successfully: {}", subscriptionId);
        return toHistoryResponse(cancelledSubscription);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<SubscriptionHistoryResponse> getSubscriptionHistory(SubscriptionHistoryFilterRequest filter) {
        log.info("Getting subscription history - businessId: {}, from: {}, to: {}",
                filter.getBusinessId(), filter.getFromDate(), filter.getToDate());
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());
        LocalDateTime now = LocalDateTime.now();
        Page<Subscription> page = subscriptionRepository.findHistoryWithFilters(
                filter.getBusinessId(), filter.getPlanId(),
                filter.getFromDate(), filter.getToDate(),
                filter.getStatus(), now, pageable);
        List<SubscriptionHistoryResponse> historyList = page.getContent().stream()
                .map(this::toHistoryResponse)
                .toList();
        return paginationMapper.toPaginationResponse(page, historyList);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionHistoryResponse> getAllByBusinessId(UUID businessId) {
        log.info("Getting all subscriptions for business: {}", businessId);
        return subscriptionRepository.findByBusinessIdAndIsDeletedFalse(businessId)
                .stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionHistoryResponse getCurrentSubscriptionByBusinessId(UUID businessId) {
        log.info("Getting current subscription for business: {}", businessId);
        Subscription subscription = subscriptionRepository.findCurrentActiveByBusinessId(businessId, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("No active subscription found for business: " + businessId));
        subscription = subscriptionRepository.findByIdWithRelationships(subscription.getId()).orElse(subscription);
        return toHistoryResponse(subscription);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private SubscriptionHistoryResponse toHistoryResponse(Subscription subscription) {
        SubscriptionHistoryResponse response = subscriptionHistoryMapper.toResponse(subscription);
        if (response != null && subscription != null && subscription.getBusinessId() != null) {
            businessSettingRepository.findByBusinessIdAndIsDeletedFalse(subscription.getBusinessId())
                    .ifPresent(s -> response.setLogoBusinessUrl(s.getLogoBusiness() != null ? s.getLogoBusiness().getSm() : null));
        }
        return response;
    }

    private void createRenewalPayment(Subscription subscription, SubscriptionRenewRequest request, SubscriptionPlan plan) {
        SubscriptionPayment payment = new SubscriptionPayment();
        payment.setBusinessId(subscription.getBusinessId());
        payment.setSubscriptionId(subscription.getId());
        payment.setPlanId(subscription.getPlanId());
        payment.setAmount(request.getPaymentAmount() != null ? request.getPaymentAmount() : plan.getPrice());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH);
        payment.setPaymentType(SubscriptionPaymentType.RENEWAL);
        payment.setStatus(SubscriptionPaymentStatus.COMPLETED);
        payment.setReferenceNumber(request.getPaymentReferenceNumber());
        payment.setImageUrl(request.getPaymentImageUrl());
        subscriptionPaymentRepository.save(payment);
        log.info("Renewal payment created for subscription: {} - Amount: {}", subscription.getId(), payment.getAmount());
    }

    private void createRefundPayment(Subscription subscription, SubscriptionCancelRequest request) {
        SubscriptionPayment refund = new SubscriptionPayment();
        refund.setBusinessId(subscription.getBusinessId());
        refund.setSubscriptionId(subscription.getId());
        refund.setPlanId(subscription.getPlanId());
        refund.setAmount(request.getRefundAmount().negate());
        refund.setPaymentMethod(PaymentMethod.CASH);
        refund.setPaymentType(SubscriptionPaymentType.REFUND);
        refund.setStatus(SubscriptionPaymentStatus.COMPLETED);
        subscriptionPaymentRepository.save(refund);
        log.info("Refund created for subscription: {} - Amount: {}", subscription.getId(), refund.getAmount());
    }

    private void updateBusinessSubscriptionStatus(UUID businessId) {
        Business business = businessRepository.findById(businessId).orElse(null);
        if (business == null) return;
        Optional<Subscription> activeSubscription =
                subscriptionRepository.findCurrentActiveByBusinessId(businessId, LocalDateTime.now());
        if (activeSubscription.isPresent()) {
            business.activateSubscription();
        } else {
            business.deactivateSubscription();
        }
        businessRepository.save(business);
        log.info("Updated business subscription status: {} - Active: {}", businessId, activeSubscription.isPresent());
    }
}
