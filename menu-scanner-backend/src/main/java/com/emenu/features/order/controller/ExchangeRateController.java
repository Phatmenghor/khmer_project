package com.emenu.features.order.controller;

import com.emenu.features.order.dto.filter.ExchangeRateFilterRequest;
import com.emenu.features.order.dto.request.ExchangeRateCreateRequest;
import com.emenu.features.order.dto.response.ExchangeRateResponse;
import com.emenu.features.order.dto.update.ExchangeRateUpdateRequest;
import com.emenu.features.order.service.ExchangeRateService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exchange-rates")
@RequiredArgsConstructor
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    /**
     * Create new system exchange rate (deactivates previous active rate)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> createExchangeRate(@Valid @RequestBody ExchangeRateCreateRequest request) {
        ExchangeRateResponse exchangeRate = exchangeRateService.createExchangeRate(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Exchange rate created successfully", exchangeRate));
    }

    /**
     * Get all exchange rates with filtering and pagination
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ExchangeRateResponse>>> getAllExchangeRates(@Valid @RequestBody ExchangeRateFilterRequest filter) {
        PaginationResponse<ExchangeRateResponse> exchangeRates = exchangeRateService.getAllExchangeRates(filter);
        return ResponseEntity.ok(ApiResponse.success("Exchange rates retrieved successfully", exchangeRates));
    }

    /**
     * Get exchange rate by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> getExchangeRateById(@PathVariable UUID id) {
        ExchangeRateResponse exchangeRate = exchangeRateService.getExchangeRateById(id);
        return ResponseEntity.ok(ApiResponse.success("Exchange rate retrieved successfully", exchangeRate));
    }

    /**
     * Update exchange rate
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> updateExchangeRate(@PathVariable UUID id, @Valid @RequestBody ExchangeRateUpdateRequest request) {
        ExchangeRateResponse exchangeRate = exchangeRateService.updateExchangeRate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Exchange rate updated successfully", exchangeRate));
    }

    /**
     * Delete exchange rate
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> deleteExchangeRate(@PathVariable UUID id) {
        ExchangeRateResponse exchangeRate = exchangeRateService.deleteExchangeRate(id);
        return ResponseEntity.ok(ApiResponse.success("Exchange rate deleted successfully", exchangeRate));
    }

    /**
     * Get current active exchange rate
     */
    @GetMapping("/current")
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> getCurrentActiveRate() {
        ExchangeRateResponse exchangeRate = exchangeRateService.getCurrentActiveRate();
        return ResponseEntity.ok(ApiResponse.success("Current exchange rate retrieved successfully", exchangeRate));
    }
}