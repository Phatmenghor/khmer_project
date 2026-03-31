package com.emenu.features.subscription.service.impl;

import com.emenu.enums.sub_scription.SubscriptionPlanStatus;
import com.emenu.features.subscription.dto.filter.SubscriptionPlanFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionPlanCreateRequest;
import com.emenu.features.subscription.dto.response.SubscriptionPlanResponse;
import com.emenu.features.subscription.dto.update.SubscriptionPlanUpdateRequest;
import com.emenu.features.subscription.mapper.SubscriptionPlanMapper;
import com.emenu.features.subscription.models.SubscriptionPlan;
import com.emenu.features.subscription.repository.SubscriptionPlanRepository;
import com.emenu.features.subscription.repository.SubscriptionRepository;
import com.emenu.features.subscription.service.SubscriptionPlanService;
import com.emenu.shared.dto.PaginationResponse;
import com.emenu.shared.pagination.PaginationUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanMapper planMapper;
    private final com.emenu.shared.mapper.PaginationMapper paginationMapper;

    @Override
    public SubscriptionPlanResponse createPlan(SubscriptionPlanCreateRequest request) {

        // Check if plan with same name already exists
        if (planRepository.existsByNameAndIsDeletedFalse(request.getName())) {
            throw new RuntimeException("Plan with this name already exists: " + request.getName());
        }

        SubscriptionPlan plan = planMapper.toEntity(request);
        SubscriptionPlan savedPlan = planRepository.save(plan);

        return planMapper.toResponse(savedPlan);
    }

    @Override
    @Transactional(readOnly = true)
    public PaginationResponse<SubscriptionPlanResponse> getAllPlans(SubscriptionPlanFilterRequest filter) {

        Pageable pageable = PaginationUtils.createPageable(
                filter.getPageNo(), filter.getPageSize(), filter.getSortBy(), filter.getSortDirection()
        );

        // Convert empty lists to null to skip filtering
        List<SubscriptionPlanStatus> statusesTypes = (filter.getStatuses() != null && !filter.getStatuses().isEmpty())
                ? filter.getStatuses() : null;

        Page<SubscriptionPlan> planPage = planRepository.findAllWithFilters(
                statusesTypes,
                filter.getSearch(),
                pageable
        );

        return planMapper.toPaginationResponse(planPage, paginationMapper);
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

        SubscriptionPlan plan = planRepository.findByIdAndIsDeletedFalse(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found with ID: " + planId));

        // Check if name is being changed and if new name already exists
        if (request.getName() != null && !request.getName().equals(plan.getName())) {
            if (planRepository.existsByNameAndIsDeletedFalse(request.getName())) {
                throw new RuntimeException("Plan with name '" + request.getName() + "' already exists");
            }
        }

        planMapper.updateEntity(request, plan);
        SubscriptionPlan updatedPlan = planRepository.save(plan);

        return planMapper.toResponse(updatedPlan);
    }

    @Override
    public void deletePlan(UUID planId) {

        SubscriptionPlan plan = planRepository.findByIdAndIsDeletedFalse(planId)
                .orElseThrow(() -> new RuntimeException("Subscription plan not found with ID: " + planId));

        // Check if plan is currently in use
        if (!canDeletePlan(planId)) {
            throw new RuntimeException("Cannot delete plan that is currently in use by active subscriptions");
        }

        plan.softDelete();
        planRepository.save(plan);

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
}