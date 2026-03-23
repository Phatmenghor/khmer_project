package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.request.StockMovementFilterRequest;
import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.features.stock.service.StockService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for Stock Movement History (audit trail of all stock changes)
 * Endpoint: /api/v1/stock/history
 *
 * ENDPOINTS OVERVIEW:
 * ─────────────────────────────────────────────────────
 * POST   /all                          → Get all movements with filters (paginated)
 * ─────────────────────────────────────────────────────
 *
 * FILTER OPTIONS (in request body):
 *   businessId      (required)  → Filter by business
 *   productId       (optional)  → Filter by product
 *   productStockId  (optional)  → Filter by specific stock batch
 *   movementType    (optional)  → STOCK_IN | STOCK_OUT | ADJUSTMENT | RETURN | DAMAGE | EXPIRY | STOCK_CHECK
 *   fromDate        (optional)  → Start date filter
 *   toDate          (optional)  → End date filter
 */
@RestController
@RequestMapping("/api/v1/stock/history")
@RequiredArgsConstructor
@Slf4j
public class StockMovementController {

    private final StockService stockService;

    /**
     * Get all stock movements with pagination and filters
     * POST /api/v1/stock/history/all
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<StockMovementDto>>> getAllMovements(
            @Valid @RequestBody StockMovementFilterRequest request) {
        log.info("GET ALL MOVEMENTS - Business: {}, Product: {}, Type: {}",
                request.getBusinessId(), request.getProductId(), request.getMovementType());
        try {
            PaginationResponse<StockMovementDto> result = stockService.getAllMovements(request);
            log.info("FOUND {} movements, Page: {}", result.getTotalElements(), result.getPageNo());
            return ResponseEntity.ok(ApiResponse.success("Stock movements retrieved", result));
        } catch (Exception e) {
            log.error("GET ALL MOVEMENTS FAILED - Business: {}, Error: {}", request.getBusinessId(), e.getMessage());
            throw e;
        }
    }
}
