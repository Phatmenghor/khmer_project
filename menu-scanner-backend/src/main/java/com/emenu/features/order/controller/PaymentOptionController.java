package com.emenu.features.order.controller;

import com.emenu.enums.common.Status;
import com.emenu.features.auth.models.User;
import com.emenu.features.order.dto.request.PaymentOptionRequest;
import com.emenu.features.order.dto.response.PaymentOptionResponse;
import com.emenu.features.order.service.PaymentOptionService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payment-options")
@RequiredArgsConstructor
@Slf4j
public class PaymentOptionController {

    private final PaymentOptionService paymentOptionService;
    private final SecurityUtils securityUtils;

    /**
     * Create a new payment option (Admin only)
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
        return ResponseEntity.ok(ApiResponse.success("Payment option created successfully", response));
    }

    /**
     * Get all payment options for current business
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<PaymentOptionResponse>>> getAllPaymentOptions() {
        log.info("Getting all payment options");
        User currentUser = securityUtils.getCurrentUser();
        List<PaymentOptionResponse> options = paymentOptionService.getAllPaymentOptions(
                currentUser.getBusinessId()
        );
        return ResponseEntity.ok(ApiResponse.success("Payment options retrieved successfully", options));
    }

    /**
     * Get all active payment options for current business
     */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PaymentOptionResponse>>> getActivePaymentOptions() {
        log.info("Getting active payment options");
        User currentUser = securityUtils.getCurrentUser();
        List<PaymentOptionResponse> options = paymentOptionService.getActivePaymentOptions(
                currentUser.getBusinessId()
        );
        return ResponseEntity.ok(ApiResponse.success("Active payment options retrieved successfully", options));
    }

    /**
     * Search payment options with pagination
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<PaymentOptionResponse>>> searchPaymentOptions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Status status,
            Pageable pageable) {
        log.info("Searching payment options");
        User currentUser = securityUtils.getCurrentUser();
        Page<PaymentOptionResponse> options = paymentOptionService.searchPaymentOptions(
                currentUser.getBusinessId(),
                search,
                status,
                pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Payment options searched successfully", options));
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

    /**
     * Activate payment option
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<PaymentOptionResponse>> activatePaymentOption(
            @PathVariable UUID id) {
        log.info("Activating payment option: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        PaymentOptionResponse response = paymentOptionService.activatePaymentOption(
                currentUser.getBusinessId(),
                id
        );
        return ResponseEntity.ok(ApiResponse.success("Payment option activated successfully", response));
    }

    /**
     * Deactivate payment option
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<PaymentOptionResponse>> deactivatePaymentOption(
            @PathVariable UUID id) {
        log.info("Deactivating payment option: {}", id);
        User currentUser = securityUtils.getCurrentUser();
        PaymentOptionResponse response = paymentOptionService.deactivatePaymentOption(
                currentUser.getBusinessId(),
                id
        );
        return ResponseEntity.ok(ApiResponse.success("Payment option deactivated successfully", response));
    }
}
