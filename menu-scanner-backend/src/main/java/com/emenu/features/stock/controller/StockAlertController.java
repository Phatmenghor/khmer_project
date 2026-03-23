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

/**
 * Controller for Stock Alerts (low stock, expiring, out of stock notifications)
 * Endpoint: /api/v1/stock/alerts
 *
 * ENDPOINTS OVERVIEW:
 * ─────────────────────────────────────────────────────
 * POST   /all                          → Get all alerts with filters (paginated)
 * GET    /count                        → Count of active alerts (for badge)
 * ─────────────────────────────────────────────────────
 *
 * FILTER OPTIONS (in request body):
 *   businessId   (required)  → Filter by business
 *   productId    (optional)  → Filter by product
 *   alertType    (optional)  → LOW_STOCK | OUT_OF_STOCK | EXPIRING_SOON | EXPIRED | NEGATIVE_STOCK | PRICE_ALERT | REORDER_DUE
 *   status       (optional)  → ACTIVE | ACKNOWLEDGED | RESOLVED
 */
@RestController
@RequestMapping("/api/v1/stock/alerts")
@RequiredArgsConstructor
@Slf4j
public class StockAlertController {

    private final StockService stockService;

    /**
     * Get all alerts with pagination and filters
     * POST /api/v1/stock/alerts/all
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<StockAlertDto>>> getAllAlerts(
            @Valid @RequestBody StockAlertFilterRequest request) {
        log.info("GET ALL ALERTS - Business: {}, Type: {}, Status: {}",
                request.getBusinessId(), request.getAlertType(), request.getStatus());
        try {
            PaginationResponse<StockAlertDto> result = stockService.getAllAlerts(request);
            log.info("FOUND {} alerts, Page: {}", result.getTotalElements(), result.getPageNo());
            return ResponseEntity.ok(ApiResponse.success("Alerts retrieved", result));
        } catch (Exception e) {
            log.error("GET ALL ALERTS FAILED - Business: {}, Error: {}", request.getBusinessId(), e.getMessage());
            throw e;
        }
    }

    /**
     * Count active alerts for a business
     * GET /api/v1/stock/alerts/count?businessId=...
     *
     * Use case: Show notification badge count on dashboard (e.g. "3 alerts")
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countActiveAlerts(
            @RequestParam UUID businessId) {
        log.info("COUNT ACTIVE ALERTS - Business: {}", businessId);
        try {
            Long count = stockService.countActiveAlerts(businessId);
            log.info("ALERT COUNT: {}", count);
            return ResponseEntity.ok(ApiResponse.success("Alert count retrieved", count));
        } catch (Exception e) {
            log.error("COUNT FAILED - Business: {}, Error: {}", businessId, e.getMessage());
            throw e;
        }
    }
}
