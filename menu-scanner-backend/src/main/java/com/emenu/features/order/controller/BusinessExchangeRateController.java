package com.emenu.features.order.controller;

import com.emenu.features.order.dto.filter.BusinessExchangeRateFilterRequest;
import com.emenu.features.order.dto.request.BusinessExchangeRateCreateRequest;
import com.emenu.features.order.dto.response.BusinessExchangeRateResponse;
import com.emenu.features.order.dto.update.BusinessExchangeRateUpdateRequest;
import com.emenu.features.order.service.BusinessExchangeRateService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/business-exchange-rates")
@RequiredArgsConstructor
public class BusinessExchangeRateController {

    private final BusinessExchangeRateService exchangeRateService;
    private final SecurityUtils securityUtils;

    /**
     * Create new business exchange rate (deactivates previous active rate)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> createBusinessExchangeRate(
            @Valid @RequestBody BusinessExchangeRateCreateRequest request) {

        BusinessExchangeRateResponse exchangeRate = exchangeRateService.createBusinessExchangeRate(request);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business exchange rate created successfully", exchangeRate));
    }

    /**
     * Get all business exchange rates with filtering and pagination
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessExchangeRateResponse>>> getAllBusinessExchangeRates(
            @Valid @RequestBody BusinessExchangeRateFilterRequest filter) {

        PaginationResponse<BusinessExchangeRateResponse> exchangeRates =
                exchangeRateService.getAllBusinessExchangeRates(filter);

        return ResponseEntity.ok(ApiResponse.success("Business exchange rates retrieved successfully", exchangeRates));
    }

    /**
     * Get all business exchange rates for current business - Business ID extracted from token
     * Security: No businessId parameter needed, extracted from authenticated user's context
     */
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessExchangeRateResponse>>> getMyBusinessExchangeRates(
            @Valid @RequestBody BusinessExchangeRateFilterRequest filter) {

        UUID businessId = securityUtils.getCurrentUserBusinessId();
        filter.setBusinessId(businessId);

        PaginationResponse<BusinessExchangeRateResponse> exchangeRates =
                exchangeRateService.getAllBusinessExchangeRates(filter);

        return ResponseEntity.ok(ApiResponse.success("Business exchange rates retrieved successfully", exchangeRates));
    }

    /**
     * Get business exchange rate by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> getBusinessExchangeRateById(
            @PathVariable UUID id) {
        
        BusinessExchangeRateResponse exchangeRate = exchangeRateService.getBusinessExchangeRateById(id);
        
        return ResponseEntity.ok(ApiResponse.success("Business exchange rate retrieved successfully", exchangeRate));
    }

    /**
     * Update business exchange rate
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> updateBusinessExchangeRate(
            @PathVariable UUID id,
            @Valid @RequestBody BusinessExchangeRateUpdateRequest request) {
        
        BusinessExchangeRateResponse exchangeRate = exchangeRateService.updateBusinessExchangeRate(id, request);
        
        return ResponseEntity.ok(ApiResponse.success("Business exchange rate updated successfully", exchangeRate));
    }

    /**
     * Delete business exchange rate
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> deleteBusinessExchangeRate(
            @PathVariable UUID id) {
        
        BusinessExchangeRateResponse exchangeRate = exchangeRateService.deleteBusinessExchangeRate(id);
        
        return ResponseEntity.ok(ApiResponse.success("Business exchange rate deleted successfully", exchangeRate));
    }

    /**
     * Get current active exchange rate for a business
     */
    @GetMapping("/business/{businessId}/active")
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> getActiveRateByBusinessId(
            @PathVariable UUID businessId) {

        BusinessExchangeRateResponse exchangeRate = exchangeRateService.getActiveRateByBusinessId(businessId);

        return ResponseEntity.ok(ApiResponse.success("Active business exchange rate retrieved successfully", exchangeRate));
    }
}