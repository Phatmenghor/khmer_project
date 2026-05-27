package com.emenu.features.subscription.controller;

import com.emenu.features.subscription.dto.filter.SubscriptionFilterRequest;
import com.emenu.features.subscription.dto.filter.SubscriptionHistoryFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCancelRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCreateRequest;
import com.emenu.features.subscription.dto.request.SubscriptionRenewRequest;
import com.emenu.features.subscription.dto.response.SubscriptionHistoryResponse;
import com.emenu.features.subscription.dto.response.SubscriptionResponse;
import com.emenu.features.subscription.dto.update.SubscriptionUpdateRequest;
import com.emenu.features.subscription.service.SubscriptionService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<SubscriptionResponse>>> getAllSubscriptions(
            @RequestBody SubscriptionFilterRequest filter) {
        log.info("Endpoint: subscriptions/all - list request");
        PaginationResponse<SubscriptionResponse> response = subscriptionService.getSubscriptions(filter);
        return ResponseEntity.ok(ApiResponse.success("Subscriptions retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getSubscriptionById(@PathVariable UUID id) {
        log.info("Endpoint: subscriptions/{} - detail request", id);
        SubscriptionResponse response = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionResponse>> createSubscription(
            @Valid @RequestBody SubscriptionCreateRequest request) {
        log.info("Endpoint: subscriptions - create request for business: {}", request.getBusinessId());
        SubscriptionResponse response = subscriptionService.createSubscription(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subscription created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> updateSubscription(
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionUpdateRequest request) {
        log.info("Endpoint: subscriptions/{} - update request", id);
        SubscriptionResponse response = subscriptionService.updateSubscription(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> deleteSubscription(@PathVariable UUID id) {
        log.info("Endpoint: subscriptions/{} - delete request", id);
        SubscriptionResponse response = subscriptionService.deleteSubscription(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription deleted successfully", response));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> renewSubscription(
            @PathVariable UUID id,
            @RequestBody SubscriptionRenewRequest request) {
        log.info("Endpoint: subscriptions/{}/renew - renew request", id);
        SubscriptionResponse response = subscriptionService.renewSubscription(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription renewed successfully", response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> cancelSubscription(
            @PathVariable UUID id,
            @RequestBody SubscriptionCancelRequest request) {
        log.info("Endpoint: subscriptions/{}/cancel - cancel request", id);
        SubscriptionResponse response = subscriptionService.cancelSubscription(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled successfully", response));
    }

    /**
     * History endpoint — shows subscription periods with from/to dates and linked payments.
     * Useful for billing history views (like Claude.ai billing page).
     */
    @PostMapping("/history")
    public ResponseEntity<ApiResponse<PaginationResponse<SubscriptionHistoryResponse>>> getSubscriptionHistory(
            @RequestBody SubscriptionHistoryFilterRequest filter) {
        log.info("Endpoint: subscriptions/history - history request businessId: {}, from: {}, to: {}",
                filter.getBusinessId(), filter.getFromDate(), filter.getToDate());
        PaginationResponse<SubscriptionHistoryResponse> response = subscriptionService.getSubscriptionHistory(filter);
        return ResponseEntity.ok(ApiResponse.success("Subscription history retrieved successfully", response));
    }
}
