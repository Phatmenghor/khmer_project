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

/**
 * Controller for Stock Alerts (low stock, expiring, out of stock notifications)
 * Endpoint: /api/v1/stock/alerts
 *
 * ENDPOINTS OVERVIEW:
 * ─────────────────────────────────────────────────────
 * POST   /active                     → Get all active (unresolved) alerts
 * POST   /critical                   → Get only critical severity alerts
 * POST   /by-type                    → Get alerts filtered by type
 * ─────────────────────────────────────────────────────
 * POST   /{alertId}/acknowledge      → Mark alert as seen by user
 * POST   /{alertId}/resolve          → Mark alert as resolved
 * ─────────────────────────────────────────────────────
 * GET    /count                       → Count of active alerts (for badge)
 * ─────────────────────────────────────────────────────
 *
 * ALERT TYPES:
 *   LOW_STOCK      (WARNING)  → Stock below threshold
 *   OUT_OF_STOCK   (CRITICAL) → No stock left
 *   EXPIRING_SOON  (WARNING)  → Expiry date approaching
 *   EXPIRED        (CRITICAL) → Past expiry date
 *   NEGATIVE_STOCK (CRITICAL) → Quantity went below zero
 *   PRICE_ALERT    (INFO)     → Price-related notification
 *   REORDER_DUE    (INFO)     → Time to reorder
 *
 * ALERT STATUS FLOW:
 *   ACTIVE → ACKNOWLEDGED → RESOLVED
 */
@RestController
@RequestMapping("/api/v1/stock/alerts")
@RequiredArgsConstructor
@Slf4j
public class StockAlertController {

    private final StockService stockService;

    // ==================== GET ALERTS ====================

    /**
     * Get all active (unresolved) alerts for a business
     * POST /api/v1/stock/alerts/active?businessId=...
     *
     * Use case: Show all alerts on dashboard that need attention
     */
    @PostMapping("/active")
    public ResponseEntity<ApiResponse<List<StockAlertDto>>> getActiveAlerts(
            @RequestParam UUID businessId) {
        log.info("🔔 GET ACTIVE ALERTS - Business: {}", businessId);
        try {
            List<StockAlertDto> result = stockService.getActiveAlerts(businessId);
            log.info("✅ FOUND {} active alerts", result.size());
            return ResponseEntity.ok(ApiResponse.success("Active alerts retrieved", result));
        } catch (Exception e) {
            log.error("❌ GET ACTIVE ALERTS FAILED - Business: {}, Error: {}", businessId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get only critical severity alerts
     * POST /api/v1/stock/alerts/critical?businessId=...
     *
     * Use case: Show urgent alerts that need immediate action
     * Critical types: EXPIRED, OUT_OF_STOCK, NEGATIVE_STOCK
     */
    @PostMapping("/critical")
    public ResponseEntity<ApiResponse<List<StockAlertDto>>> getCriticalAlerts(
            @RequestParam UUID businessId) {
        log.info("🚨 GET CRITICAL ALERTS - Business: {}", businessId);
        try {
            List<StockAlertDto> result = stockService.getCriticalAlerts(businessId);
            log.info("✅ FOUND {} critical alerts", result.size());
            return ResponseEntity.ok(ApiResponse.success("Critical alerts retrieved", result));
        } catch (Exception e) {
            log.error("❌ GET CRITICAL ALERTS FAILED - Business: {}, Error: {}", businessId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get alerts filtered by type
     * POST /api/v1/stock/alerts/by-type?businessId=...&alertType=LOW_STOCK
     *
     * Use case: Show only low stock alerts, or only expiring alerts
     * alertType: LOW_STOCK | OUT_OF_STOCK | EXPIRING_SOON | EXPIRED | NEGATIVE_STOCK | PRICE_ALERT | REORDER_DUE
     */
    @PostMapping("/by-type")
    public ResponseEntity<ApiResponse<List<StockAlertDto>>> getAlertsByType(
            @RequestParam UUID businessId,
            @RequestParam String alertType) {
        log.info("🔔 GET ALERTS BY TYPE - Business: {}, Type: {}", businessId, alertType);
        try {
            List<StockAlertDto> result = stockService.getAlertsByType(businessId, alertType);
            log.info("✅ FOUND {} {} alerts", result.size(), alertType);
            return ResponseEntity.ok(ApiResponse.success("Alerts retrieved", result));
        } catch (Exception e) {
            log.error("❌ GET ALERTS BY TYPE FAILED - Type: {}, Error: {}", alertType, e.getMessage());
            throw e;
        }
    }

    // ==================== ALERT ACTIONS ====================

    /**
     * Acknowledge an alert (mark as seen)
     * POST /api/v1/stock/alerts/{alertId}/acknowledge?businessId=...&userId=...
     *
     * Use case: Manager sees the alert and clicks "Acknowledge" → status changes to ACKNOWLEDGED
     */
    @PostMapping("/{alertId}/acknowledge")
    public ResponseEntity<ApiResponse<StockAlertDto>> acknowledgeAlert(
            @PathVariable UUID alertId,
            @RequestParam UUID businessId,
            @RequestParam UUID userId) {
        log.info("👁️ ACKNOWLEDGE ALERT - Alert: {}, By User: {}", alertId, userId);
        try {
            StockAlertDto result = stockService.acknowledgeAlert(businessId, alertId, userId);
            log.info("✅ ALERT ACKNOWLEDGED - Alert: {}, Status: {}", alertId, result.getStatus());
            return ResponseEntity.ok(ApiResponse.success("Alert acknowledged", result));
        } catch (Exception e) {
            log.error("❌ ACKNOWLEDGE FAILED - Alert: {}, Error: {}", alertId, e.getMessage());
            throw e;
        }
    }

    /**
     * Resolve an alert (issue has been fixed)
     * POST /api/v1/stock/alerts/{alertId}/resolve?businessId=...
     *
     * Use case: Stock was refilled → resolve the LOW_STOCK alert → status changes to RESOLVED
     */
    @PostMapping("/{alertId}/resolve")
    public ResponseEntity<ApiResponse<StockAlertDto>> resolveAlert(
            @PathVariable UUID alertId,
            @RequestParam UUID businessId) {
        log.info("✅ RESOLVE ALERT - Alert: {}", alertId);
        try {
            StockAlertDto result = stockService.resolveAlert(businessId, alertId);
            log.info("✅ ALERT RESOLVED - Alert: {}, Status: {}", alertId, result.getStatus());
            return ResponseEntity.ok(ApiResponse.success("Alert resolved", result));
        } catch (Exception e) {
            log.error("❌ RESOLVE FAILED - Alert: {}, Error: {}", alertId, e.getMessage());
            throw e;
        }
    }

    // ==================== ALERT COUNT ====================

    /**
     * Count active alerts for a business
     * GET /api/v1/stock/alerts/count?businessId=...
     *
     * Use case: Show notification badge count on dashboard (e.g. "3 alerts")
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> countActiveAlerts(
            @RequestParam UUID businessId) {
        log.info("🔢 COUNT ACTIVE ALERTS - Business: {}", businessId);
        try {
            Long count = stockService.countActiveAlerts(businessId);
            log.info("✅ ALERT COUNT: {}", count);
            return ResponseEntity.ok(ApiResponse.success("Alert count retrieved", count));
        } catch (Exception e) {
            log.error("❌ COUNT FAILED - Business: {}, Error: {}", businessId, e.getMessage());
            throw e;
        }
    }
}
