package com.emenu.features.order.controller;

import com.emenu.features.order.dto.filter.PaymentOptionFilterRequest;
import com.emenu.features.order.dto.response.PaymentOptionResponse;
import com.emenu.features.order.service.PaymentOptionService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/payment-options")
@RequiredArgsConstructor
@Slf4j
public class PublicPaymentOptionController {

    private final PaymentOptionService paymentOptionService;

    /**
     * Get payment options for a specific business with pagination and filtering
     * Used during checkout to show available payment methods
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<PaymentOptionResponse>>> getPaymentOptions(
            @Valid @RequestBody PaymentOptionFilterRequest filter) {
        log.info("Getting payment options for business: {}", filter.getBusinessId());

        PaginationResponse<PaymentOptionResponse> paymentOptions = paymentOptionService.getAllPaymentOptionsWithFilters(
                filter.getBusinessId(),
                filter
        );

        return ResponseEntity.ok(ApiResponse.success("Business payment options retrieved successfully", paymentOptions));
    }

    /**
     * Get all active payment options for a business without pagination
     * Used for quick access to payment methods during checkout
     */
    @PostMapping("/active")
    public ResponseEntity<ApiResponse<List<PaymentOptionResponse>>> getActivePaymentOptions(
            @Valid @RequestBody PaymentOptionFilterRequest filter) {
        log.info("Getting active payment options for business: {}", filter.getBusinessId());

        // Set page size to get all active options
        filter.setPageSize(100);
        filter.setPageNo(1);

        PaginationResponse<PaymentOptionResponse> response = paymentOptionService.getAllPaymentOptionsWithFilters(
                filter.getBusinessId(),
                filter
        );

        return ResponseEntity.ok(ApiResponse.success("Business active payment options retrieved successfully", response.getContent()));
    }
}
