package com.emenu.features.order.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.order.dto.filter.PaymentOptionFilterRequest;
import com.emenu.features.order.dto.request.PaymentOptionRequest;
import com.emenu.features.order.dto.response.PaymentOptionResponse;
import com.emenu.features.order.service.PaymentOptionService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.emenu.shared.dto.BatchImportResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payment-options")
@RequiredArgsConstructor
@Slf4j
public class PaymentOptionController {

    private final PaymentOptionService paymentOptionService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentOptionResponse>> createPaymentOption(
            @Valid @RequestBody PaymentOptionRequest request) {
        log.info("Endpoint: create-payment-option - payment option creation");
        User currentUser = securityUtils.getCurrentUser();
        PaymentOptionResponse response = paymentOptionService.createPaymentOption(
                currentUser.getBusinessId(),
                request
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment option created successfully", response));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchImportResponse<PaymentOptionResponse>>> createPaymentOptionBatch(
            @Valid @RequestBody List<PaymentOptionRequest> requests) {
        log.info("Endpoint: createPaymentOptionBatch - payment option batch creation: size={}", requests.size());
        User currentUser = securityUtils.getCurrentUser();
        BatchImportResponse<PaymentOptionResponse> response = paymentOptionService.createPaymentOptionBatch(
                currentUser.getBusinessId(),
                requests
        );
        return ResponseEntity.ok(ApiResponse.success("Batch payment option import completed", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<PaymentOptionResponse>>> getAllPaymentOptions(
            @Valid @RequestBody PaymentOptionFilterRequest filter) {
        log.info("Endpoint: search-payment-options - payment options retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        User currentUser = securityUtils.getCurrentUser();
        UUID businessId = currentUser.getBusinessId();

        filter.setBusinessId(businessId);
        PaginationResponse<PaymentOptionResponse> response = paymentOptionService.getAllPaymentOptionsWithFilters(
                businessId,
                filter
        );
        return ResponseEntity.ok(ApiResponse.success("Payment options retrieved successfully", response));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<PaymentOptionResponse>>> getMyBusinessPaymentOptions(
            @Valid @RequestBody PaymentOptionFilterRequest filter) {
        log.info("Endpoint: my-payment-options - my payment options retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        User currentUser = securityUtils.getCurrentUser();
        UUID businessId = currentUser.getBusinessId();

        filter.setBusinessId(businessId);
        PaginationResponse<PaymentOptionResponse> response = paymentOptionService.getAllPaymentOptionsWithFilters(
                businessId,
                filter
        );
        return ResponseEntity.ok(ApiResponse.success("Payment options retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentOptionResponse>> getPaymentOptionById(
            @PathVariable UUID id) {
        log.info("Endpoint: get-payment-option - payment option retrieval: id={}", id);
        User currentUser = securityUtils.getCurrentUser();
        PaymentOptionResponse option = paymentOptionService.getPaymentOptionById(
                currentUser.getBusinessId(),
                id
        );
        return ResponseEntity.ok(ApiResponse.success("Payment option retrieved successfully", option));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentOptionResponse>> updatePaymentOption(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentOptionRequest request) {
        log.info("Endpoint: update-payment-option - payment option update: id={}", id);
        User currentUser = securityUtils.getCurrentUser();
        PaymentOptionResponse response = paymentOptionService.updatePaymentOption(
                currentUser.getBusinessId(),
                id,
                request
        );
        return ResponseEntity.ok(ApiResponse.success("Payment option updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePaymentOption(
            @PathVariable UUID id) {
        log.info("Endpoint: delete-payment-option - payment option deletion: id={}", id);
        User currentUser = securityUtils.getCurrentUser();
        paymentOptionService.deletePaymentOption(
                currentUser.getBusinessId(),
                id
        );
        return ResponseEntity.ok(ApiResponse.success("Payment option deleted successfully", null));
    }
}
