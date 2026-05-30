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
import com.emenu.features.subscription.dto.response.SubscriptionHistoryResponse;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.models.SubscriptionPayment;
import com.emenu.features.subscription.models.SubscriptionPlan;
import com.emenu.features.subscription.repository.SubscriptionPaymentRepository;
import com.emenu.features.subscription.repository.SubscriptionPlanRepository;
import com.emenu.features.subscription.repository.SubscriptionRepository;
import com.emenu.features.subscription.service.SubscriptionService;
<<<<<<< HEAD
=======
import com.emenu.features.subscription.specification.SubscriptionSpecification;
import com.emenu.security.SecurityUtils;
>>>>>>> ed51c6b (Convert notification, setting, and subscription services to JPA Specifications)
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
import java.time.LocalDateTime;
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

    @Override
    @Transactional(readOnly = true)
<<<<<<< HEAD
    public SubscriptionHistoryResponse getSubscriptionById(UUID subscriptionId) {
        log.info("Getting subscription detail: {}", subscriptionId);
=======
    public PaginationResponse<SubscriptionResponse> getSubscriptions(SubscriptionFilterRequest filter) {
        log.info("Getting subscriptions - Status: {}, BusinessId: {}", filter.getStatus(), filter.getBusinessId());

        Pageable pageable = PaginationUtils.createPageable(filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryThreshold = "EXPIRING_SOON".equals(filter.getStatus())
                ? now.plusDays(filter.getExpiringSoonDays())
                : null;

        var spec = SubscriptionSpecification.findWithFilters(
                filter.getBusinessId(),
                filter.getPlanId(),
                filter.getAutoRenew(),
                filter.getStartDate(),
                filter.getToDate(),
                filter.getStatus(),
                now,
                expiryThreshold,
                filter.getSearch()
        );
        Page<Subscription> subscriptionPage = subscriptionRepository.findAll(spec, pageable);

        return subscriptionMapper.toPaginationResponse(subscriptionPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<SubscriptionResponse> getCurrentUserBusinessSubscriptions(SubscriptionFilterRequest filter) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        log.debug("Getting subscriptions for current user: {}", currentUserId);
        Business business = businessRepository.findByOwnerIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> new RuntimeException("No business found for current user"));
        filter.setBusinessId(business.getId());
        return getSubscriptions(filter);
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getSubscriptionById(UUID subscriptionId) {
        log.debug("Getting subscription by ID: {}", subscriptionId);
>>>>>>> ed51c6b (Convert notification, setting, and subscription services to JPA Specifications)
        Subscription subscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));
        subscription = subscriptionRepository.findByIdWithRelationships(subscription.getId()).orElse(subscription);
        return toHistoryResponse(subscription);
    }

    @Override
    public SubscriptionHistoryResponse renewSubscription(UUID subscriptionId, SubscriptionRenewRequest request) {
        log.info("Renewing subscription: {}", subscriptionId);
        Subscription oldSubscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));

        UUID newPlanId = request.getNewPlanId() != null ? request.getNewPlanId() : oldSubscription.getPlanId();
        SubscriptionPlan plan = planRepository.findByIdAndIsDeletedFalse(newPlanId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found: " + newPlanId));

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
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));
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
        SubscriptionHistoryResponse response = new SubscriptionHistoryResponse();
        response.setSubscriptionId(subscription.getId());
        response.setBusinessId(subscription.getBusinessId());
        response.setStartDate(subscription.getStartDate().toLocalDate());
        response.setEndDate(subscription.getEndDate().toLocalDate());
        response.setAutoRenew(subscription.getAutoRenew());
        response.setStatus(subscription.getStatus());
        response.setDaysRemaining(subscription.getDaysRemaining());

        if (subscription.getBusiness() != null) {
            response.setBusinessName(subscription.getBusiness().getName());
        }
        businessSettingRepository.findByBusinessIdAndIsDeletedFalse(subscription.getBusinessId())
                .ifPresent(s -> response.setLogoBusinessUrl(s.getLogoBusinessUrl()));
        if (subscription.getPlan() != null) {
            SubscriptionPlan plan = subscription.getPlan();
            response.setPlanId(plan.getId());
            response.setPlanName(plan.getName());
            response.setPlanPrice(plan.getPrice());
            response.setPlanDurationType(plan.getDurationType());
        }

        SubscriptionPayment payment = subscription.getPayment();
        Optional<SubscriptionPayment> paymentOpt = Optional.ofNullable(payment);

        paymentOpt.ifPresent(p -> {
            SubscriptionHistoryResponse.PaymentItem item = new SubscriptionHistoryResponse.PaymentItem();
            item.setPaymentId(p.getId());
            item.setAmount(p.getAmount());
            item.setPaymentMethod(p.getPaymentMethod());
            item.setPaymentType(p.getPaymentType());
            item.setStatus(p.getStatus());
            item.setReferenceNumber(p.getReferenceNumber());
            item.setImageUrl(p.getImageUrl());
            item.setPaidAt(p.getCreatedAt());
            response.setPayment(item);
        });

        BigDecimal totalPaid = paymentOpt
                .filter(p -> p.getStatus().isCompleted())
                .map(SubscriptionPayment::getAmount)
                .orElse(BigDecimal.ZERO);
        response.setTotalPaid(totalPaid);

        String paymentStatus = "UNPAID";
        if (paymentOpt.isPresent()) {
            SubscriptionPayment p = paymentOpt.get();
            if (p.getStatus().isPending()) {
                paymentStatus = "PENDING";
            } else if (p.getStatus().isCompleted()) {
                BigDecimal planPrice = subscription.getPlan() != null ? subscription.getPlan().getPrice() : BigDecimal.ZERO;
                if (totalPaid.compareTo(planPrice) >= 0) paymentStatus = "PAID";
                else if (totalPaid.compareTo(BigDecimal.ZERO) > 0) paymentStatus = "PARTIALLY_PAID";
            }
        }
        response.setPaymentStatus(paymentStatus);
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
