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

@RestController
@RequestMapping("/api/v1/public/payment-options")
@RequiredArgsConstructor
@Slf4j
public class PublicPaymentOptionController {

    private final PaymentOptionService paymentOptionService;

    /**
     * Get payment options for a specific business with pagination and filtering
     * Used during checkout to show available payment methods
     * Filter can include status to show only active/inactive options
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
}

