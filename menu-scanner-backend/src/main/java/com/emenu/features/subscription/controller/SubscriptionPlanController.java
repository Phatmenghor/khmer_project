package com.emenu.features.subscription.controller;

import com.emenu.features.subscription.dto.filter.SubscriptionPlanFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionPlanCreateRequest;
import com.emenu.features.subscription.dto.response.SubscriptionPlanResponse;
import com.emenu.features.subscription.dto.update.SubscriptionPlanUpdateRequest;
import com.emenu.features.subscription.service.SubscriptionPlanService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscription-plans")
@RequiredArgsConstructor
public class SubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;

    /**
     * Get all subscription plans with filtering and pagination
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<SubscriptionPlanResponse>>> getAllPlans(
            @Valid @RequestBody SubscriptionPlanFilterRequest filter) {
        PaginationResponse<SubscriptionPlanResponse> plans = subscriptionPlanService.getAllPlans(filter);
        return ResponseEntity.ok(ApiResponse.success("Subscription plans retrieved successfully", plans));
    }

    /**
     * Get subscription plan by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> getPlanById(@PathVariable UUID id) {
        SubscriptionPlanResponse plan = subscriptionPlanService.getPlanById(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan retrieved successfully", plan));
    }

    /**
     * Create new subscription plan
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> createPlan(@Valid @RequestBody SubscriptionPlanCreateRequest request) {
        SubscriptionPlanResponse plan = subscriptionPlanService.createPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subscription plan created successfully", plan));
    }

    /**
     * Update subscription plan (unified update endpoint)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> updatePlan(
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionPlanUpdateRequest request) {
        SubscriptionPlanResponse plan = subscriptionPlanService.updatePlan(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan updated successfully", plan));
    }

    /**
     * Delete subscription plan
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable UUID id) {
        subscriptionPlanService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan deleted successfully", null));
    }
}