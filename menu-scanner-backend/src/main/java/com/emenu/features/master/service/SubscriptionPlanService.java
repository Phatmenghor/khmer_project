package com.emenu.features.master.service;

import com.emenu.features.master.dto.filter.SubscriptionPlanFilterRequest;
import com.emenu.features.master.dto.request.SubscriptionPlanCreateRequest;
import com.emenu.features.master.dto.response.SubscriptionPlanResponse;
import com.emenu.features.master.dto.update.SubscriptionPlanUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

public interface SubscriptionPlanService {

    // Plan Management with Filtering
    SubscriptionPlanResponse createPlan(SubscriptionPlanCreateRequest request);
    PaginationResponse<SubscriptionPlanResponse> getAllPlans(SubscriptionPlanFilterRequest filter);
    SubscriptionPlanResponse getPlanById(UUID planId);
    SubscriptionPlanResponse updatePlan(UUID planId, SubscriptionPlanUpdateRequest request);
    void deletePlan(UUID planId);
    List<SubscriptionPlanResponse> getAllActivePlans();
}