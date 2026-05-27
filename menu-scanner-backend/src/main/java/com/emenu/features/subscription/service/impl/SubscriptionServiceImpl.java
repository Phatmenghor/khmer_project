package com.emenu.features.subscription.service.impl;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.enums.sub_scription.SubscriptionPaymentType;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.repository.BusinessRepository;
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
import java.util.ArrayList;
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
    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final PaginationMapper paginationMapper;

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
        List<SubscriptionPayment> pendingPayments = subscriptionPaymentRepository
                .findBySubscriptionIdAndStatusAndIsDeletedFalse(subscription.getId(), SubscriptionPaymentStatus.PENDING);
        pendingPayments.forEach(payment -> {
            payment.setStatus(SubscriptionPaymentStatus.CANCELLED);
            payment.setNotes("Cancelled due to subscription cancellation");
            subscriptionPaymentRepository.save(payment);
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
        if (subscription.getPlan() != null) {
            SubscriptionPlan plan = subscription.getPlan();
            response.setPlanId(plan.getId());
            response.setPlanName(plan.getName());
            response.setPlanPrice(plan.getPrice());
            response.setPlanDurationType(plan.getDurationType());
        }

        List<SubscriptionPayment> payments = subscriptionPaymentRepository
                .findBySubscriptionIdAndIsDeletedFalse(subscription.getId());
        List<SubscriptionHistoryResponse.PaymentItem> paymentItems = new ArrayList<>();
        for (SubscriptionPayment payment : payments) {
            SubscriptionHistoryResponse.PaymentItem item = new SubscriptionHistoryResponse.PaymentItem();
            item.setPaymentId(payment.getId());
            item.setAmount(payment.getAmount());
            item.setPaymentMethod(payment.getPaymentMethod());
            item.setPaymentType(payment.getPaymentType());
            item.setStatus(payment.getStatus());
            item.setReferenceNumber(payment.getReferenceNumber());
            item.setNotes(payment.getNotes());
            item.setImageUrl(payment.getImageUrl());
            item.setPaidAt(payment.getCreatedAt());
            paymentItems.add(item);
        }
        response.setPayments(paymentItems);
        response.setTotalPaid(subscription.getPaymentAmount());
        response.setPaymentStatus(subscription.getPaymentStatus());
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
        payment.setNotes(request.getPaymentNotes());
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
        refund.setNotes("Refund: " + request.getRefundNotes());
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
