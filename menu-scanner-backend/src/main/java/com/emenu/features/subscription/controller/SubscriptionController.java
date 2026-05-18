package com.emenu.features.subscription.controller;

import com.emenu.features.subscription.dto.filter.SubscriptionFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCancelRequest;
import com.emenu.features.subscription.dto.request.SubscriptionCreateRequest;
import com.emenu.features.subscription.dto.response.SubscriptionCancellationResponse;
import com.emenu.features.subscription.dto.response.SubscriptionRenewalResponse;
import com.emenu.features.subscription.dto.response.SubscriptionResponse;
import com.emenu.features.subscription.dto.request.SubscriptionRenewRequest;
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
            @Valid @RequestBody SubscriptionFilterRequest filter) {
        log.info("Endpoint: search-subscriptions - subscriptions retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<SubscriptionResponse> subscriptions = subscriptionService.getSubscriptions(filter);
        return ResponseEntity.ok(ApiResponse.success("Subscriptions retrieved successfully", subscriptions));
    }

    @PostMapping("/my-business")
    public ResponseEntity<ApiResponse<PaginationResponse<SubscriptionResponse>>> getMyBusinessSubscriptions(
            @Valid @RequestBody SubscriptionFilterRequest filter) {
        log.info("Endpoint: my-subscriptions - my subscriptions retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<SubscriptionResponse> subscriptions = subscriptionService.getCurrentUserBusinessSubscriptions(filter);
        return ResponseEntity.ok(ApiResponse.success("Business subscriptions retrieved successfully", subscriptions));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionResponse>> createSubscription(@Valid @RequestBody SubscriptionCreateRequest request) {
        log.info("Endpoint: create-subscription - subscription creation: business_id={}", request.getBusinessId());
        SubscriptionResponse subscription = subscriptionService.createSubscription(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subscription created successfully", subscription));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> getSubscriptionById(@PathVariable UUID id) {
        log.info("Endpoint: get-subscription - subscription retrieval: id={}", id);
        SubscriptionResponse subscription = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription retrieved successfully", subscription));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> updateSubscription(
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionUpdateRequest request) {
        log.info("Endpoint: update-subscription - subscription update: id={}", id);
        SubscriptionResponse subscription = subscriptionService.updateSubscription(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription updated successfully", subscription));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> deleteSubscription(@PathVariable UUID id) {
        log.info("Endpoint: delete-subscription - subscription deletion: id={}", id);
        SubscriptionResponse subscription = subscriptionService.deleteSubscription(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription deleted successfully", subscription));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<ApiResponse<SubscriptionRenewalResponse>> renewSubscription(
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionRenewRequest request) {

        log.info("Endpoint: renew-subscription - subscription renewal: subscription_id={}", id);

        SubscriptionResponse subscription = subscriptionService.renewSubscription(id, request);

        SubscriptionRenewalResponse response = new SubscriptionRenewalResponse();
        response.setSubscription(subscription);
        response.setPaymentCreated(request.shouldCreatePayment());

        if (request.shouldCreatePayment()) {
            response.setPaymentAmount(request.getPaymentAmount());
            response.setPaymentMethod(request.getPaymentMethod());
        }

        String message = request.shouldCreatePayment() ?
                "Subscription renewed successfully with payment record" :
                "Subscription renewed successfully";

        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionCancellationResponse>> cancelSubscription(
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionCancelRequest request) {

        log.info("Endpoint: cancel-subscription - subscription cancellation: subscription_id={}", id);

        // Call enhanced service method
        SubscriptionResponse subscription = subscriptionService.cancelSubscription(id, request);

        // Create comprehensive response
        SubscriptionCancellationResponse response = new SubscriptionCancellationResponse();
        response.setSubscription(subscription);
        response.setPaymentsCleared(true); // Always clear payments
        response.setRefundCreated(request.hasRefundAmount());

        if (request.hasRefundAmount()) {
            response.setRefundAmount(request.getRefundAmount());
        }

        String message = "Subscription cancelled successfully";
        if (request.hasRefundAmount()) {
            message += " with refund record";
        }

        return ResponseEntity.ok(ApiResponse.success(message, response));
    }
}
