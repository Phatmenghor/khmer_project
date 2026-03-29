package com.emenu.features.order.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.order.dto.filter.PaymentOptionFilterRequest;
import com.emenu.features.order.dto.request.PaymentOptionRequest;
import com.emenu.features.order.dto.response.PaymentOptionResponse;
import com.emenu.features.order.service.IPaymentOptionService;
import com.emenu.security.SecurityUtils;
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
@RequestMapping("/api/v1/payment-options")
@RequiredArgsConstructor
@Slf4j
public class PaymentOptionController {

    private final IPaymentOptionService paymentOptionService;
    private final SecurityUtils securityUtils;

    /**
     * Create a new payment option
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentOptionResponse>> createPaymentOption(
            @Valid @RequestBody PaymentOptionRequest request) {
        log.info("Creating payment option");
        User currentUser = securityUtils.getCurrentUser();
        PaymentOptionResponse response = paymentOptionService.createPaymentOption(
                currentUser.getBusinessId(),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment option created successfully", response));
    }

    /**
     * Get all payment options with pagination and filters for authenticated user's business
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<PaymentOptionResponse>>> getAllPaymentOptions(
            @Valid @RequestBody PaymentOptionFilterRequest filter) {
        log.info("Getting all payment options for authenticated user's business");
        User currentUser = securityUtils.getCurrentUser();
        UUID businessId = currentUser.getBusinessId();

        filter.setBusinessId(businessId);
        PaginationResponse<PaymentOptionResponse> response = paymentOptionService.getAllPaymentOptionsWithFilters(
                businessId,
                filter
        );
        return ResponseEntity.ok(ApiResponse.success("Payment options retrieved successfully", response));
    }

    /**
     * Get all payment options with pagination and filters for authenticated user's business
     * Alternative endpoint for consistency with other entities
     */
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<PaymentOptionResponse>>> getMyBusinessPaymentOptions(
            @Valid @RequestBody PaymentOptionFilterRequest filter) {
        log.info("Getting payment options for authenticated user's business");
        User currentUser = securityUtils.getCurrentUser();
        UUID businessId = currentUser.getBusinessId();

        filter.setBusinessId(businessId);
        PaginationResponse<PaymentOptionResponse> response = paymentOptionService.getAllPaymentOptionsWithFilters(
                businessId,
                filter
        );
        return ResponseEntity.ok(ApiResponse.success("Payment options retrieved successfully", response));
    }

    /**
     * Get payment option by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentOptionResponse>> getPaymentOptionById(
            @PathVariable UUID id) {
        log.info("Getting payment option by ID: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        PaymentOptionResponse option = paymentOptionService.getPaymentOptionById(
                currentUser.getBusinessId(),
                id
        );
        return ResponseEntity.ok(ApiResponse.success("Payment option retrieved successfully", option));
    }

    /**
     * Update payment option
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentOptionResponse>> updatePaymentOption(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentOptionRequest request) {
        log.info("Updating payment option: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        PaymentOptionResponse response = paymentOptionService.updatePaymentOption(
                currentUser.getBusinessId(),
                id,
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Payment option updated successfully", response));
    }

    /**
     * Delete payment option
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePaymentOption(
            @PathVariable UUID id) {
        log.info("Deleting payment option: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        paymentOptionService.deletePaymentOption(
                currentUser.getBusinessId(),
                id
        );
        return ResponseEntity.ok(ApiResponse.success("Payment option deleted successfully", null));
    }
}
