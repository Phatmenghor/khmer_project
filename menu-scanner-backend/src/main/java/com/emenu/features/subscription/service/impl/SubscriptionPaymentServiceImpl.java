package com.emenu.features.subscription.service.impl;

import com.emenu.features.subscription.dto.filter.SubscriptionPaymentFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionPaymentCreateRequest;
import com.emenu.features.subscription.dto.response.SubscriptionPaymentResponse;
import com.emenu.features.subscription.dto.update.SubscriptionPaymentUpdateRequest;
import com.emenu.features.subscription.mapper.SubscriptionPaymentMapper;
import com.emenu.features.subscription.models.SubscriptionPayment;
import com.emenu.features.subscription.repository.SubscriptionPaymentRepository;
import com.emenu.features.subscription.service.SubscriptionPaymentService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SubscriptionPaymentServiceImpl implements SubscriptionPaymentService {

    private final SubscriptionPaymentRepository subscriptionPaymentRepository;
    private final SubscriptionPaymentMapper subscriptionPaymentMapper;
    private final PaginationMapper paginationMapper;

    @Override
    public SubscriptionPaymentResponse createSubscriptionPayment(SubscriptionPaymentCreateRequest request) {
        log.info("Creating subscription payment for business: {}, subscription: {}", request.getBusinessId(), request.getSubscriptionId());
        SubscriptionPayment payment = subscriptionPaymentMapper.toEntity(request);
        SubscriptionPayment saved = subscriptionPaymentRepository.save(payment);
        saved = subscriptionPaymentRepository.findByIdWithRelationships(saved.getId()).orElse(saved);
        log.info("Subscription payment created: {}", saved.getId());
        return subscriptionPaymentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<SubscriptionPaymentResponse> getAllSubscriptionPayments(SubscriptionPaymentFilterRequest filter) {
        log.info("Getting subscription payments - businessId: {}, subscriptionId: {}", filter.getBusinessId(), filter.getSubscriptionId());
        Pageable pageable = PaginationUtils.createPageable(filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection());
        Page<SubscriptionPayment> page = subscriptionPaymentRepository.findAllWithFilters(
                filter.getBusinessId(),
                filter.getSubscriptionId(),
                filter.getPlanId(),
                filter.getPaymentMethods(),
                filter.getStatuses(),
                filter.getPaymentTypes(),
                filter.getCreatedFrom(),
                filter.getCreatedTo(),
                filter.getSearch(),
                pageable
        );
        return paginationMapper.toPaginationResponse(page, subscriptionPaymentMapper.toResponseList(page.getContent()));
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionPaymentResponse getSubscriptionPaymentById(UUID id) {
        SubscriptionPayment payment = subscriptionPaymentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Subscription payment not found: " + id));
        return subscriptionPaymentMapper.toResponse(payment);
    }

    @Override
    public SubscriptionPaymentResponse updateSubscriptionPayment(UUID id, SubscriptionPaymentUpdateRequest request) {
        log.info("Updating subscription payment: {}", id);
        SubscriptionPayment payment = subscriptionPaymentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Subscription payment not found: " + id));
        subscriptionPaymentMapper.updateEntity(request, payment);
        SubscriptionPayment updated = subscriptionPaymentRepository.save(payment);
        updated = subscriptionPaymentRepository.findByIdWithRelationships(updated.getId()).orElse(updated);
        log.info("Subscription payment updated: {}", id);
        return subscriptionPaymentMapper.toResponse(updated);
    }

    @Override
    public SubscriptionPaymentResponse deleteSubscriptionPayment(UUID id) {
        log.info("Deleting subscription payment: {}", id);
        SubscriptionPayment payment = subscriptionPaymentRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Subscription payment not found: " + id));
        payment.softDelete();
        SubscriptionPayment deleted = subscriptionPaymentRepository.save(payment);
        deleted = subscriptionPaymentRepository.findByIdWithRelationships(deleted.getId()).orElse(deleted);
        log.info("Subscription payment deleted: {}", id);
        return subscriptionPaymentMapper.toResponse(deleted);
    }
}
