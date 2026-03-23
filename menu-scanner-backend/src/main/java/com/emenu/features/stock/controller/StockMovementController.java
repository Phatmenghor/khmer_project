package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.features.stock.service.StockService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Controller for Stock Movement History (audit trail of all stock changes)
 * Endpoint: /api/v1/stock/history
 *
 * ENDPOINTS OVERVIEW:
 * ─────────────────────────────────────────────────────
 * POST   /product/{productStockId}   → History for one stock batch
 * POST   /business/{businessId}      → History for entire business (paginated)
 * POST   /search                     → Search history with filters
 * POST   /export                     → Export all history (no pagination)
 * ─────────────────────────────────────────────────────
 *
 * MOVEMENT TYPES:
 *   STOCK_IN     → Received new stock (e.g. shipment arrived)
 *   STOCK_OUT    → Sold or dispatched (e.g. order fulfilled)
 *   ADJUSTMENT   → Manual correction (e.g. recount, damage)
 *   RETURN       → Customer return
 *   DAMAGE       → Damaged or lost items
 *   EXPIRY       → Expired items removed
 *   STOCK_CHECK  → Physical inventory count
 */
@RestController
@RequestMapping("/api/v1/stock/history")
@RequiredArgsConstructor
@Slf4j
public class StockMovementController {

    private final StockService stockService;

    // ==================== HISTORY BY PRODUCT ====================

    /**
     * Get movement history for a specific stock batch
     * POST /api/v1/stock/history/product/{productStockId}?from=...&to=...
     *
     * Use case: View all changes for one product batch (when stock was added, sold, adjusted)
     * Defaults to last 1 month if no dates provided
     */
    @PostMapping("/product/{productStockId}")
    public ResponseEntity<ApiResponse<List<StockMovementDto>>> getProductHistory(
            @PathVariable UUID productStockId,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to) {

        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusMonths(1);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        log.info("📜 GET PRODUCT HISTORY - Stock: {}, From: {}, To: {}", productStockId, fromDate, toDate);
        try {
            List<StockMovementDto> result = stockService.getStockHistory(productStockId, fromDate, toDate);
            log.info("✅ FOUND {} movements for stock: {}", result.size(), productStockId);
            return ResponseEntity.ok(ApiResponse.success("Stock movements retrieved", result));
        } catch (Exception e) {
            log.error("❌ GET HISTORY FAILED - Stock: {}, Error: {}", productStockId, e.getMessage());
            throw e;
        }
    }

    // ==================== HISTORY BY BUSINESS ====================

    /**
     * Get movement history for entire business (paginated)
     * POST /api/v1/stock/history/business/{businessId}?from=...&to=...&movementType=...&pageNo=1&pageSize=50
     *
     * Use case: View all stock movements across all products for the business
     * Defaults to last 1 month if no dates provided
     *
     * movementType filter: STOCK_IN | STOCK_OUT | ADJUSTMENT | RETURN | DAMAGE | EXPIRY | STOCK_CHECK
     */
    @PostMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<Page<StockMovementDto>>> getBusinessHistory(
            @PathVariable UUID businessId,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to,
            @RequestParam(required = false) String movementType,
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "50") Integer pageSize) {

        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusMonths(1);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        log.info("📜 GET BUSINESS HISTORY - Business: {}, Type: {}, From: {}, To: {}",
                businessId, movementType, fromDate, toDate);
        try {
            Page<StockMovementDto> result = stockService.getStockHistoryPaginated(
                    businessId, null, movementType, fromDate, toDate, pageNo, pageSize);
            log.info("✅ FOUND {} movements (page {}/{})",
                    result.getTotalElements(), result.getNumber() + 1, result.getTotalPages());
            return ResponseEntity.ok(ApiResponse.success("Business stock history retrieved", result));
        } catch (Exception e) {
            log.error("❌ GET BUSINESS HISTORY FAILED - Business: {}, Error: {}", businessId, e.getMessage());
            throw e;
        }
    }

    // ==================== SEARCH HISTORY ====================

    /**
     * Search movement history with filters
     * POST /api/v1/stock/history/search?businessId=...&productStockId=...&movementType=...&from=...&to=...
     *
     * Use case: Find all DAMAGE movements for a specific product in the last 3 months
     * Defaults to last 3 months if no dates provided
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<StockMovementDto>>> searchHistory(
            @RequestParam UUID businessId,
            @RequestParam(required = false) UUID productStockId,
            @RequestParam(required = false) String movementType,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to,
            @RequestParam(defaultValue = "1") Integer pageNo,
            @RequestParam(defaultValue = "50") Integer pageSize) {

        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusMonths(3);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        log.info("🔍 SEARCH HISTORY - Business: {}, Stock: {}, Type: {}", businessId, productStockId, movementType);
        try {
            Page<StockMovementDto> result = stockService.getStockHistoryPaginated(
                    businessId, productStockId, movementType, fromDate, toDate, pageNo, pageSize);
            log.info("✅ SEARCH FOUND {} movements", result.getTotalElements());
            return ResponseEntity.ok(ApiResponse.success("History search completed", result));
        } catch (Exception e) {
            log.error("❌ SEARCH FAILED - Business: {}, Error: {}", businessId, e.getMessage());
            throw e;
        }
    }

    // ==================== EXPORT HISTORY ====================

    /**
     * Export all movement history (no pagination, returns full list)
     * POST /api/v1/stock/history/export?businessId=...&from=...&to=...
     *
     * Use case: Download/export all movements for reporting or backup
     * Defaults to last 1 month if no dates provided
     */
    @PostMapping("/export")
    public ResponseEntity<ApiResponse<List<StockMovementDto>>> exportHistory(
            @RequestParam UUID businessId,
            @RequestParam(required = false) LocalDateTime from,
            @RequestParam(required = false) LocalDateTime to) {

        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusMonths(1);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        log.info("📤 EXPORT HISTORY - Business: {}, From: {}, To: {}", businessId, fromDate, toDate);
        try {
            List<StockMovementDto> result = stockService.getBusinessStockHistory(businessId, fromDate, toDate);
            log.info("✅ EXPORTED {} movements", result.size());
            return ResponseEntity.ok(ApiResponse.success("History exported", result));
        } catch (Exception e) {
            log.error("❌ EXPORT FAILED - Business: {}, Error: {}", businessId, e.getMessage());
            throw e;
        }
    }
}
