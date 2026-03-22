package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.response.StockAlertDto;
import com.emenu.features.stock.service.StockService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stock/alerts")
@RequiredArgsConstructor
@Slf4j
public class StockAlertController {

    private final StockService stockService;

    @PostMapping("/active")
    public ResponseEntity<ApiResponse<List<StockAlertDto>>> getActiveAlerts(
        @RequestParam UUID businessId
    ) {
        log.info("Getting active alerts for business: {}", businessId);
        List<StockAlertDto> result = stockService.getActiveAlerts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Active alerts retrieved", result));
    }

    @PostMapping("/critical")
    public ResponseEntity<ApiResponse<List<StockAlertDto>>> getCriticalAlerts(
        @RequestParam UUID businessId
    ) {
        log.info("Getting critical alerts for business: {}", businessId);
        List<StockAlertDto> result = stockService.getCriticalAlerts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Critical alerts retrieved", result));
    }

    @PostMapping("/by-type")
    public ResponseEntity<ApiResponse<List<StockAlertDto>>> getAlertsByType(
        @RequestParam UUID businessId,
        @RequestParam String alertType
    ) {
        log.info("Getting {} alerts for business: {}", alertType, businessId);
        List<StockAlertDto> result = stockService.getAlertsByType(businessId, alertType);
        return ResponseEntity.ok(ApiResponse.success("Alerts retrieved", result));
    }

    @PostMapping("/{alertId}/acknowledge")
    public ResponseEntity<ApiResponse<StockAlertDto>> acknowledgeAlert(
        @PathVariable UUID alertId,
        @RequestParam UUID businessId,
        @RequestParam UUID userId
    ) {
        log.info("Acknowledging alert: {} by user: {}", alertId, userId);
        StockAlertDto result = stockService.acknowledgeAlert(businessId, alertId, userId);
        return ResponseEntity.ok(ApiResponse.success("Alert acknowledged", result));
    }

    @PostMapping("/{alertId}/resolve")
    public ResponseEntity<ApiResponse<StockAlertDto>> resolveAlert(
        @PathVariable UUID alertId,
        @RequestParam UUID businessId
    ) {
        log.info("Resolving alert: {}", alertId);
        StockAlertDto result = stockService.resolveAlert(businessId, alertId);
        return ResponseEntity.ok(ApiResponse.success("Alert resolved", result));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countActiveAlerts(
        @RequestParam UUID businessId
    ) {
        log.info("Counting active alerts for business: {}", businessId);
        Long count = stockService.countActiveAlerts(businessId);
        return ResponseEntity.ok(ApiResponse.success("Alert count retrieved", count));
    }
}
