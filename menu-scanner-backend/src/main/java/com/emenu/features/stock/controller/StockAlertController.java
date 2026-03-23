package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.request.StockAlertFilterRequest;
import com.emenu.features.stock.dto.response.StockAlertDto;
import com.emenu.features.stock.service.StockService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stock/alerts")
@RequiredArgsConstructor
@Slf4j
public class StockAlertController {

    private final StockService stockService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<StockAlertDto>>> getAllAlerts(
            @Valid @RequestBody StockAlertFilterRequest request) {
        log.info("Get all alerts - business: {}", request.getBusinessId());
        PaginationResponse<StockAlertDto> result = stockService.getAllAlerts(request);
        return ResponseEntity.ok(ApiResponse.success("Alerts retrieved", result));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countActiveAlerts(@RequestParam UUID businessId) {
        log.info("Count active alerts - business: {}", businessId);
        Long count = stockService.countActiveAlerts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Alert count retrieved", count));
    }
}
