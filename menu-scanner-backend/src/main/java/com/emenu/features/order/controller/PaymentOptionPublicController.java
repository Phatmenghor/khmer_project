package com.emenu.features.order.controller;

import com.emenu.features.order.dto.response.PaymentOptionResponse;
import com.emenu.features.order.service.PaymentOptionService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payment-options")
@RequiredArgsConstructor
@Slf4j
public class PaymentOptionPublicController {

    private final PaymentOptionService paymentOptionService;

    /**
     * Get all active payment options (Public - No authentication required)
     * Returns all active payment options without pagination
     */
    @GetMapping("/all-data")
    public ResponseEntity<ApiResponse<List<PaymentOptionResponse>>> getAllActivePaymentOptions() {
        log.info("Getting all active payment options (public)");
        List<PaymentOptionResponse> options = paymentOptionService.getAllActivePaymentOptions();
        return ResponseEntity.ok(ApiResponse.success("Payment options retrieved successfully", options));
    }
}
