package com.emenu.features.subscription.service.impl;

import com.emenu.enums.sub_scription.SubscriptionPlanStatus;
import com.emenu.shared.mapper.PaginationMapper;
import com.emenu.features.subscription.dto.filter.SubscriptionPlanFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionPlanCreateRequest;
import com.emenu.features.subscription.dto.response.SubscriptionPlanResponse;
import com.emenu.features.subscription.dto.update.SubscriptionPlanUpdateRequest;
import com.emenu.features.subscription.mapper.SubscriptionPlanMapper;
import com.emenu.features.subscription.models.SubscriptionPlan;
import com.emenu.features.subscription.repository.SubscriptionPlanRepository;
import com.emenu.features.subscription.repository.SubscriptionRepository;
import com.emenu.exception.custom.ValidationException;
import com.emenu.features.subscription.service.SubscriptionPlanService;
import com.emenu.features.subscription.specification.SubscriptionPlanSpecification;
import com.emenu.features.notification.websocket.service.WebSocketNotificationService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanMapper planMapper;
    private final PaginationMapper paginationMapper;
    private final WebSocketNotificationService webSocketNotificationService;

    @Override
    public SubscriptionPlanResponse createPlan(SubscriptionPlanCreateRequest request) {
        log.info("Creating subscription plan: {}", request.getName());

        // Check if plan with same name already exists
        if (planRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new ValidationException("Plan with this name already exists: " + request.getName());
        }

        SubscriptionPlan plan = planMapper.toEntity(request);
        SubscriptionPlan savedPlan = planRepository.save(plan);

        log.info("Subscription plan created successfully: {} with ID: {}", savedPlan.getName(), savedPlan.getId());
        webSocketNotificationService.notifyPlatformEvent("SUBSCRIPTION_PLAN_CHANGED", Map.of("action", "created", "planId", savedPlan.getId().toString()));
        return planMapper.toResponse(savedPlan);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<SubscriptionPlanResponse> getAllPlans(SubscriptionPlanFilterRequest filter) {
        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        List<SubscriptionPlanStatus> statusesTypes = (filter.getStatuses() != null && !filter.getStatuses().isEmpty())
                ? filter.getStatuses() : null;

        Specification<SubscriptionPlan> spec = SubscriptionPlanSpecification.findAllWithFilters(
                statusesTypes,
                filter.getSearch()
        );
        Page<SubscriptionPlan> planPage = planRepository.findAll(spec, pageable);

        return paginationMapper.toPaginationResponse(planPage, planMapper.toResponseList(planPage.getContent()));
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionPlanResponse getPlanById(UUID planId) {
        SubscriptionPlan plan = planRepository.findByIdAndIsDeletedFalse(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found with ID: " + planId));

        return planMapper.toResponse(plan);
    }

    @Override
    public SubscriptionPlanResponse updatePlan(UUID planId, SubscriptionPlanUpdateRequest request) {
        log.info("Updating subscription plan: {}", planId);

        SubscriptionPlan plan = planRepository.findByIdAndIsDeletedFalse(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found with ID: " + planId));

        // Check if name is being changed and if new name already exists
        if (request.getName() != null && !request.getName().equals(plan.getName())) {
            if (planRepository.existsByNameAndIsDeletedFalse(request.getName())) {
                throw new ValidationException("Plan with name '" + request.getName() + "' already exists");
            }
        }

        planMapper.updateEntity(request, plan);
        SubscriptionPlan updatedPlan = planRepository.save(plan);

        log.info("Subscription plan updated successfully: {} - {}", updatedPlan.getId(), updatedPlan.getName());
        webSocketNotificationService.notifyPlatformEvent("SUBSCRIPTION_PLAN_CHANGED", Map.of("action", "updated", "planId", updatedPlan.getId().toString()));
        return planMapper.toResponse(updatedPlan);
    }

    @Override
    public void deletePlan(UUID planId) {
        log.info("Deleting subscription plan: {}", planId);

        SubscriptionPlan plan = planRepository.findByIdAndIsDeletedFalse(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found with ID: " + planId));

        // Check if plan is currently in use
        if (!canDeletePlan(planId)) {
            throw new ValidationException("Cannot delete plan that is currently in use by active subscriptions");
        }

        plan.softDelete();
        planRepository.save(plan);

        log.info("Subscription plan deleted successfully: {} - {}", plan.getId(), plan.getName());
        webSocketNotificationService.notifyPlatformEvent("SUBSCRIPTION_PLAN_CHANGED", Map.of("action", "deleted", "planId", plan.getId().toString()));
    }


    @Transactional(readOnly = true)
    private boolean canDeletePlan(UUID planId) {
        return !isPlanInUse(planId);
    }

    @Transactional(readOnly = true)
    private boolean isPlanInUse(UUID planId) {
        long subscriptionCount = subscriptionRepository.countByPlan(planId);
        return subscriptionCount > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> getAllActivePlans() {
        List<SubscriptionPlan> plans = planRepository.findAllActivePlans();
        return planMapper.toResponseList(plans);
    }
}
