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
import lombok.extern.slf4j.Slf4j;
import com.emenu.shared.dto.BatchImportResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/business-exchange-rates")
@RequiredArgsConstructor
@Slf4j
public class BusinessExchangeRateController {

    private final BusinessExchangeRateService exchangeRateService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> createBusinessExchangeRate(
            @Valid @RequestBody BusinessExchangeRateCreateRequest request) {
        log.info("Endpoint: create-business-exchange-rate - business exchange rate creation: business_id={}", request.getBusinessId());
        BusinessExchangeRateResponse exchangeRate = exchangeRateService.createBusinessExchangeRate(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business exchange rate created successfully", exchangeRate));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchImportResponse<BusinessExchangeRateResponse>>> createBusinessExchangeRateBatch(
            @Valid @RequestBody List<BusinessExchangeRateCreateRequest> requests,
            @RequestParam(required = false) String importId) {
        log.info("Endpoint: createBusinessExchangeRateBatch - business exchange rate batch creation: size={}, importId={}", requests.size(), importId);
        BatchImportResponse<BusinessExchangeRateResponse> response = exchangeRateService.createBusinessExchangeRateBatch(requests, importId);
        return ResponseEntity.ok(ApiResponse.success("Batch business exchange rate import completed", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessExchangeRateResponse>>> getAllBusinessExchangeRates(
            @Valid @RequestBody BusinessExchangeRateFilterRequest filter) {
        log.info("Endpoint: search-business-exchange-rates - business exchange rates retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<BusinessExchangeRateResponse> exchangeRates =
                exchangeRateService.getAllBusinessExchangeRates(filter);
        return ResponseEntity.ok(ApiResponse.success("Business exchange rates retrieved successfully", exchangeRates));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessExchangeRateResponse>>> getMyBusinessExchangeRates(
            @Valid @RequestBody BusinessExchangeRateFilterRequest filter) {
        log.info("Endpoint: my-business-exchange-rates - my business exchange rates retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        filter.setBusinessId(businessId);
        PaginationResponse<BusinessExchangeRateResponse> exchangeRates =
                exchangeRateService.getAllBusinessExchangeRates(filter);
        return ResponseEntity.ok(ApiResponse.success("Business exchange rates retrieved successfully", exchangeRates));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> getBusinessExchangeRateById(
            @PathVariable UUID id) {
        log.info("Endpoint: get-business-exchange-rate - business exchange rate retrieval: id={}", id);
        BusinessExchangeRateResponse exchangeRate = exchangeRateService.getBusinessExchangeRateById(id);
        return ResponseEntity.ok(ApiResponse.success("Business exchange rate retrieved successfully", exchangeRate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> updateBusinessExchangeRate(
            @PathVariable UUID id,
            @Valid @RequestBody BusinessExchangeRateUpdateRequest request) {
        log.info("Endpoint: update-business-exchange-rate - business exchange rate update: id={}", id);
        BusinessExchangeRateResponse exchangeRate = exchangeRateService.updateBusinessExchangeRate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Business exchange rate updated successfully", exchangeRate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> deleteBusinessExchangeRate(
            @PathVariable UUID id) {
        log.info("Endpoint: delete-business-exchange-rate - business exchange rate deletion: id={}", id);
        BusinessExchangeRateResponse exchangeRate = exchangeRateService.deleteBusinessExchangeRate(id);
        return ResponseEntity.ok(ApiResponse.success("Business exchange rate deleted successfully", exchangeRate));
    }

    @GetMapping("/business/{businessId}/active")
    public ResponseEntity<ApiResponse<BusinessExchangeRateResponse>> getActiveRateByBusinessId(
            @PathVariable UUID businessId) {
        log.info("Endpoint: get-active-business-exchange-rate - active business exchange rate retrieval: business_id={}", businessId);
        BusinessExchangeRateResponse exchangeRate = exchangeRateService.getActiveRateByBusinessId(businessId);
        return ResponseEntity.ok(ApiResponse.success("Active business exchange rate retrieved successfully", exchangeRate));
    }
}
