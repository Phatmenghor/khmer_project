package com.emenu.features.subscription.controller;

import com.emenu.features.subscription.dto.filter.SubscriptionHistoryFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCancelRequest;
import com.emenu.features.subscription.dto.request.SubscriptionRenewRequest;
import com.emenu.features.subscription.dto.response.SubscriptionHistoryResponse;
import com.emenu.features.subscription.service.SubscriptionService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final SecurityUtils securityUtils;

    @PostMapping("/history")
    public ResponseEntity<ApiResponse<PaginationResponse<SubscriptionHistoryResponse>>> getSubscriptionHistory(
            @RequestBody SubscriptionHistoryFilterRequest filter) {
        PaginationResponse<SubscriptionHistoryResponse> response = subscriptionService.getSubscriptionHistory(filter);
        return ResponseEntity.ok(ApiResponse.success("Subscription history retrieved successfully", response));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<List<SubscriptionHistoryResponse>>> getAllByBusinessId(
            @PathVariable UUID businessId) {
        List<SubscriptionHistoryResponse> response = subscriptionService.getAllByBusinessId(businessId);
        return ResponseEntity.ok(ApiResponse.success("Subscription history retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionHistoryResponse>> getSubscriptionById(@PathVariable UUID id) {
        SubscriptionHistoryResponse response = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription retrieved successfully", response));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<SubscriptionHistoryResponse>> getCurrentSubscription() {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        SubscriptionHistoryResponse response = subscriptionService.getCurrentSubscriptionByBusinessId(businessId);
        return ResponseEntity.ok(ApiResponse.success("Current subscription retrieved successfully", response));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<ApiResponse<SubscriptionHistoryResponse>> renewSubscription(
            @PathVariable UUID id,
            @RequestBody SubscriptionRenewRequest request) {
        SubscriptionHistoryResponse response = subscriptionService.renewSubscription(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription renewed successfully", response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionHistoryResponse>> cancelSubscription(
            @PathVariable UUID id,
            @RequestBody SubscriptionCancelRequest request) {
        SubscriptionHistoryResponse response = subscriptionService.cancelSubscription(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled successfully", response));
    }
}
