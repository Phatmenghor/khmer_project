package com.emenu.features.subscription.controller;

import com.emenu.features.subscription.dto.filter.SubscriptionPaymentFilterRequest;
import com.emenu.features.subscription.dto.request.SubscriptionPaymentCreateRequest;
import com.emenu.features.subscription.dto.response.SubscriptionPaymentResponse;
import com.emenu.features.subscription.dto.update.SubscriptionPaymentUpdateRequest;
import com.emenu.features.subscription.service.SubscriptionPaymentService;
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
@RequestMapping("/api/v1/subscription-payments")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionPaymentController {

    private final SubscriptionPaymentService subscriptionPaymentService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<SubscriptionPaymentResponse>>> getAllSubscriptionPayments(
            @RequestBody SubscriptionPaymentFilterRequest filter) {
        log.info("Endpoint: subscription-payments/all - list request received");
        PaginationResponse<SubscriptionPaymentResponse> response = subscriptionPaymentService.getAllSubscriptionPayments(filter);
        return ResponseEntity.ok(ApiResponse.success("Subscription payments retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPaymentResponse>> getSubscriptionPaymentById(@PathVariable UUID id) {
        log.info("Endpoint: subscription-payments/{} - detail request received", id);
        SubscriptionPaymentResponse response = subscriptionPaymentService.getSubscriptionPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription payment retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionPaymentResponse>> createSubscriptionPayment(
            @Valid @RequestBody SubscriptionPaymentCreateRequest request) {
        log.info("Endpoint: subscription-payments - create request received for business: {}", request.getBusinessId());
        SubscriptionPaymentResponse response = subscriptionPaymentService.createSubscriptionPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subscription payment created successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPaymentResponse>> updateSubscriptionPayment(
            @PathVariable UUID id,
            @Valid @RequestBody SubscriptionPaymentUpdateRequest request) {
        log.info("Endpoint: subscription-payments/{} - update request received", id);
        SubscriptionPaymentResponse response = subscriptionPaymentService.updateSubscriptionPayment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription payment updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPaymentResponse>> deleteSubscriptionPayment(@PathVariable UUID id) {
        log.info("Endpoint: subscription-payments/{} - delete request received", id);
        SubscriptionPaymentResponse response = subscriptionPaymentService.deleteSubscriptionPayment(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription payment deleted successfully", response));
    }
}
