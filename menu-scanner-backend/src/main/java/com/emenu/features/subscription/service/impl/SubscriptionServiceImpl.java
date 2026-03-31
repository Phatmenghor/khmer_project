package com.emenu.features.subscription.service.impl;

import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.order.mapper.PaymentMapper;
import com.emenu.features.order.models.Payment;
import com.emenu.features.order.repository.PaymentRepository;
import com.emenu.features.subscription.dto.filter.SubscriptionFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCancelRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCreateRequest;
import com.emenu.features.subscription.dto.request.SubscriptionRenewRequest;
import com.emenu.features.subscription.dto.response.SubscriptionResponse;
import com.emenu.features.subscription.dto.update.SubscriptionUpdateRequest;
import com.emenu.features.subscription.mapper.SubscriptionMapper;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.models.SubscriptionPlan;
import com.emenu.features.subscription.repository.SubscriptionPlanRepository;
import com.emenu.features.subscription.repository.SubscriptionRepository;
import com.emenu.features.subscription.service.SubscriptionService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final BusinessRepository businessRepository;
    private final PaymentRepository paymentRepository;
    private final SubscriptionMapper subscriptionMapper;
    private final PaymentMapper paymentMapper;
    private final SecurityUtils securityUtils;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public SubscriptionResponse createSubscription(SubscriptionCreateRequest request) {
        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found: " + request.getBusinessId()));
        SubscriptionPlan plan = planRepository.findByIdAndIsDeletedFalse(request.getPlanId())
                .orElseThrow(() -> new RuntimeException("Subscription plan not found: " + request.getPlanId()));
        Optional<Subscription> existingActive = subscriptionRepository
                .findCurrentActiveByBusinessId(request.getBusinessId(), LocalDateTime.now());
        if (existingActive.isPresent()) {
            throw new RuntimeException("Business already has an active subscription");
        }
        Subscription subscription = subscriptionMapper.toEntity(request);
        subscription.setBusinessId(request.getBusinessId());
        subscription.setPlanId(request.getPlanId());
        LocalDateTime startDate = LocalDateTime.now();
        subscription.setStartDate(startDate);
        subscription.setEndDate(startDate.plusDays(plan.getDurationDays()));
        Subscription savedSubscription = subscriptionRepository.save(subscription);
        business.activateSubscription();
        businessRepository.save(business);
        savedSubscription = subscriptionRepository.findByIdWithRelationships(savedSubscription.getId()).orElse(savedSubscription);
        return subscriptionMapper.toResponse(savedSubscription);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<SubscriptionResponse> getSubscriptions(SubscriptionFilterRequest filter) {
        
        Pageable pageable = PaginationUtils.createPageable(filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryThreshold = "EXPIRING_SOON".equals(filter.getStatus())
                ? now.plusDays(filter.getExpiringSoonDays()) 
                : null;
        
        // ONE QUERY CALL - handles all cases!
        Page<Subscription> subscriptionPage = subscriptionRepository.findWithFilters(
                filter.getBusinessId(),
                filter.getPlanId(),
                filter.getAutoRenew(),
                filter.getStartDate(),
                filter.getToDate(),
                filter.getStatus(),
                now,
                expiryThreshold,
                filter.getSearch(),
                pageable
        );

        return subscriptionMapper.toPaginationResponse(subscriptionPage, paginationMapper);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<SubscriptionResponse> getCurrentUserBusinessSubscriptions(SubscriptionFilterRequest filter) {
        UUID currentUserId = securityUtils.getCurrentUserId();
        Business business = businessRepository.findByOwnerIdAndIsDeletedFalse(currentUserId)
                .orElseThrow(() -> new RuntimeException("No business found for current user"));
        filter.setBusinessId(business.getId());
        return getSubscriptions(filter);
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getSubscriptionById(UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));
        return subscriptionMapper.toResponse(subscription);
    }

    @Override
    public SubscriptionResponse updateSubscription(UUID subscriptionId, SubscriptionUpdateRequest request) {
        Subscription subscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));
        subscriptionMapper.updateEntity(request, subscription);
        Subscription updatedSubscription = subscriptionRepository.save(subscription);
        updateBusinessSubscriptionStatus(updatedSubscription.getBusinessId());
        updatedSubscription = subscriptionRepository.findByIdWithRelationships(updatedSubscription.getId()).orElse(updatedSubscription);
        return subscriptionMapper.toResponse(updatedSubscription);
    }

    @Override
    public SubscriptionResponse deleteSubscription(UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));
        subscription.softDelete();
        Subscription deletedSubscription = subscriptionRepository.save(subscription);
        updateBusinessSubscriptionStatus(deletedSubscription.getBusinessId());
        deletedSubscription = subscriptionRepository.findByIdWithRelationships(deletedSubscription.getId()).orElse(deletedSubscription);
        return subscriptionMapper.toResponse(deletedSubscription);
    }

    @Override
    public SubscriptionResponse renewSubscription(UUID subscriptionId, SubscriptionRenewRequest request) {
        Subscription subscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));
        subscription.renew();
        Subscription renewedSubscription = subscriptionRepository.save(subscription);
        if (request.shouldCreatePayment()) {
            createPaymentForSubscription(renewedSubscription, request);
        }
        updateBusinessSubscriptionStatus(renewedSubscription.getBusinessId());
        renewedSubscription = subscriptionRepository.findByIdWithRelationships(renewedSubscription.getId()).orElse(renewedSubscription);
        return subscriptionMapper.toResponse(renewedSubscription);
    }

    @Override
    public SubscriptionResponse cancelSubscription(UUID subscriptionId, SubscriptionCancelRequest request) {
        Subscription subscription = subscriptionRepository.findByIdAndIsDeletedFalse(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found: " + subscriptionId));
        subscription.cancel();
        if (subscription.getPayments() != null && !subscription.getPayments().isEmpty()) {
            subscription.getPayments().stream()
                    .filter(payment -> payment.getStatus().isPending())
                    .forEach(payment -> {
                        payment.markAsFailed();
                        payment.setNotes("Cancelled due to subscription cancellation");
                        paymentRepository.save(payment);
                    });
        }
        Subscription cancelledSubscription = subscriptionRepository.save(subscription);
        if (request.hasRefundAmount()) {
            createRefundForSubscription(cancelledSubscription, request);
        }
        updateBusinessSubscriptionStatus(cancelledSubscription.getBusinessId());
        cancelledSubscription = subscriptionRepository.findByIdWithRelationships(cancelledSubscription.getId()).orElse(cancelledSubscription);
        return subscriptionMapper.toResponse(cancelledSubscription);
    }

    private void createPaymentForSubscription(Subscription subscription, SubscriptionRenewRequest request) {
        // Build helper DTO, then use pure MapStruct mapping
        com.emenu.features.order.dto.helper.PaymentCreateHelper helper =
            paymentMapper.buildSubscriptionPaymentHelper(subscription, request);
        Payment payment = paymentMapper.createFromHelper(helper);
        paymentRepository.save(payment);
    }

    private void createRefundForSubscription(Subscription subscription, SubscriptionCancelRequest request) {
        // Build helper DTO, then use pure MapStruct mapping
        com.emenu.features.order.dto.helper.PaymentCreateHelper helper =
            paymentMapper.buildSubscriptionRefundHelper(subscription, request);
        Payment refund = paymentMapper.createFromHelper(helper);
        paymentRepository.save(refund);
    }

    private void updateBusinessSubscriptionStatus(UUID businessId) {
        Business business = businessRepository.findById(businessId).orElse(null);
        if (business == null) return;
        Optional<Subscription> activeSubscription = subscriptionRepository.findCurrentActiveByBusinessId(businessId, LocalDateTime.now());
        if (activeSubscription.isPresent()) {
            business.activateSubscription();
        } else {
            business.deactivateSubscription();
        }
        businessRepository.save(business);
    }
}