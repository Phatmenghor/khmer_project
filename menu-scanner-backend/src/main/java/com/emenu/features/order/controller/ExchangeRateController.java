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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/exchange-rates")
@RequiredArgsConstructor
@Slf4j
public class ExchangeRateController {

    private final ExchangeRateService exchangeRateService;

    @PostMapping
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> createExchangeRate(@Valid @RequestBody ExchangeRateCreateRequest request) {
        log.info("Endpoint: create-exchange-rate - exchange rate creation: rate={}", request.getUsdToKhrRate());
        ExchangeRateResponse exchangeRate = exchangeRateService.createExchangeRate(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Exchange rate created successfully", exchangeRate));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ExchangeRateResponse>>> getAllExchangeRates(@Valid @RequestBody ExchangeRateFilterRequest filter) {
        log.info("Endpoint: search-exchange-rates - exchange rates retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<ExchangeRateResponse> exchangeRates = exchangeRateService.getAllExchangeRates(filter);
        return ResponseEntity.ok(ApiResponse.success("Exchange rates retrieved successfully", exchangeRates));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> getExchangeRateById(@PathVariable UUID id) {
        log.info("Endpoint: get-exchange-rate - exchange rate retrieval: id={}", id);
        ExchangeRateResponse exchangeRate = exchangeRateService.getExchangeRateById(id);
        return ResponseEntity.ok(ApiResponse.success("Exchange rate retrieved successfully", exchangeRate));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> updateExchangeRate(@PathVariable UUID id, @Valid @RequestBody ExchangeRateUpdateRequest request) {
        log.info("Endpoint: update-exchange-rate - exchange rate update: id={}", id);
        ExchangeRateResponse exchangeRate = exchangeRateService.updateExchangeRate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Exchange rate updated successfully", exchangeRate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> deleteExchangeRate(@PathVariable UUID id) {
        log.info("Endpoint: delete-exchange-rate - exchange rate deletion: id={}", id);
        ExchangeRateResponse exchangeRate = exchangeRateService.deleteExchangeRate(id);
        return ResponseEntity.ok(ApiResponse.success("Exchange rate deleted successfully", exchangeRate));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<ExchangeRateResponse>> getCurrentActiveRate() {
        log.info("Endpoint: get-current-exchange-rate - current exchange rate retrieval");
        ExchangeRateResponse exchangeRate = exchangeRateService.getCurrentActiveRate();
        return ResponseEntity.ok(ApiResponse.success("Current exchange rate retrieved successfully", exchangeRate));
    }
}
