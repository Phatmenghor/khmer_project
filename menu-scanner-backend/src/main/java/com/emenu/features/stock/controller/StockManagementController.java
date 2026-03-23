package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.request.StockAdjustmentRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.dto.response.StockMovementDto;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.features.stock.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller for Stock Operations (adjustments, barcode, availability, reports)
 * Endpoint: /api/v1/stock
 *
 * ENDPOINTS OVERVIEW:
 * ─────────────────────────────────────────────────────
 * GET    /{stockId}                  → Get stock by ID
 * GET    /product/{productId}        → Get stock by product
 * GET    /barcode/{barcode}          → Get stock by barcode scan
 * ─────────────────────────────────────────────────────
 * POST   /adjust                     → Adjust stock (damage, recount, etc.)
 * POST   /add                        → Quick add quantity
 * POST   /{stockId}/mark-expired     → Mark stock as expired
 * ─────────────────────────────────────────────────────
 * POST   /{stockId}/assign-barcode   → Assign barcode to stock
 * POST   /{stockId}/remove-barcode   → Remove barcode from stock
 * ─────────────────────────────────────────────────────
 * POST   /check-availability         → Check if product has enough stock
 * POST   /check-bulk-availability    → Check multiple products at once
 * ─────────────────────────────────────────────────────
 * POST   /summary                    → Dashboard summary for a business
 * ─────────────────────────────────────────────────────
 */
@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
@Slf4j
public class StockManagementController {

    private final StockService stockService;

    // ==================== GET OPERATIONS ====================

    /**
     * Get stock by ID
     * GET /api/v1/stock/{stockId}
     */
    @GetMapping("/{stockId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> getStockById(
            @PathVariable UUID stockId) {
        log.info("📖 GET STOCK - ID: {}", stockId);
        try {
            ProductStockDto result = stockService.getStockById(stockId);
            log.info("✅ FOUND - ID: {}, Qty: {}", result.getId(), result.getQuantityOnHand());
            return ResponseEntity.ok(ApiResponse.success("Stock retrieved", result));
        } catch (Exception e) {
            log.error("❌ GET FAILED - ID: {}, Error: {}", stockId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get stock by product ID (and optional size)
     * GET /api/v1/stock/product/{productId}?businessId=...&sizeId=...
     *
     * Use case: When you know the product but not the stock ID
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> getStockByProduct(
            @PathVariable UUID productId,
            @RequestParam UUID businessId,
            @RequestParam(required = false) UUID sizeId) {
        log.info("📖 GET STOCK BY PRODUCT - Product: {}, Business: {}, Size: {}", productId, businessId, sizeId);
        try {
            ProductStockDto result = stockService.getStockByProductAndSize(productId, sizeId, businessId);
            log.info("✅ FOUND - Stock ID: {}, Qty: {}", result.getId(), result.getQuantityOnHand());
            return ResponseEntity.ok(ApiResponse.success("Stock retrieved", result));
        } catch (Exception e) {
            log.error("❌ GET BY PRODUCT FAILED - Product: {}, Error: {}", productId, e.getMessage());
            throw e;
        }
    }

    /**
     * Get stock by barcode scan
     * GET /api/v1/stock/barcode/{barcode}?businessId=...
     *
     * Use case: Cashier scans a barcode to look up the product stock
     */
    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ApiResponse<ProductStockDto>> getByBarcode(
            @PathVariable String barcode,
            @RequestParam UUID businessId) {
        log.info("📖 GET STOCK BY BARCODE - Barcode: {}, Business: {}", barcode, businessId);
        try {
            ProductStockDto result = stockService.getByBarcode(barcode, businessId);
            log.info("✅ FOUND - Stock ID: {}, SKU: {}", result.getId(), result.getSku());
            return ResponseEntity.ok(ApiResponse.success("Stock retrieved by barcode", result));
        } catch (Exception e) {
            log.error("❌ BARCODE LOOKUP FAILED - Barcode: {}, Error: {}", barcode, e.getMessage());
            throw e;
        }
    }

    // ==================== STOCK ADJUSTMENT OPERATIONS ====================

    /**
     * Adjust stock quantity with reason
     * POST /api/v1/stock/adjust?businessId=...
     *
     * Use case: Physical count found 5 less units → adjustmentQuantity = -5, type = RECOUNT
     *           3 units damaged → adjustmentQuantity = -3, type = DAMAGED
     *           Found 10 extra units → adjustmentQuantity = +10, type = CORRECTION
     *
     * adjustmentType: RECOUNT | RECEIVED | DAMAGED | LOST | CORRECTION
     */
    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<StockMovementDto>> adjustStock(
            @RequestParam UUID businessId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        log.info("📝 ADJUST STOCK - Stock: {}, Type: {}, Qty: {}",
                request.getProductStockId(), request.getAdjustmentType(), request.getAdjustmentQuantity());
        try {
            StockMovementDto result = stockService.adjustStock(businessId, request);
            log.info("✅ ADJUSTED - Previous: {}, New: {}", result.getPreviousQuantity(), result.getNewQuantity());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Stock adjusted successfully", result));
        } catch (Exception e) {
            log.error("❌ ADJUST FAILED - Stock: {}, Error: {}", request.getProductStockId(), e.getMessage());
            throw e;
        }
    }

    /**
     * Quick add stock quantity
     * POST /api/v1/stock/add?businessId=...&productStockId=...&quantity=...&reason=...
     *
     * Use case: New shipment arrived, add 20 more units to existing batch
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<StockMovementDto>> addStock(
            @RequestParam UUID businessId,
            @RequestParam UUID productStockId,
            @RequestParam Integer quantity,
            @RequestParam(required = false) String reason) {
        log.info("📥 ADD STOCK - Stock: {}, Qty: +{}", productStockId, quantity);
        try {
            StockMovementDto result = stockService.addStock(
                    businessId, productStockId, quantity,
                    reason != null ? reason : "Stock In", null);
            log.info("✅ ADDED - Previous: {}, New: {}", result.getPreviousQuantity(), result.getNewQuantity());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Stock added successfully", result));
        } catch (Exception e) {
            log.error("❌ ADD FAILED - Stock: {}, Error: {}", productStockId, e.getMessage());
            throw e;
        }
    }

    /**
     * Mark stock batch as expired
     * POST /api/v1/stock/{stockId}/mark-expired?businessId=...&reason=...
     *
     * Use case: Product passed expiry date, remove from active inventory
     */
    @PostMapping("/{stockId}/mark-expired")
    public ResponseEntity<ApiResponse<StockMovementDto>> markExpired(
            @PathVariable UUID stockId,
            @RequestParam UUID businessId,
            @RequestParam(required = false) String reason) {
        log.info("⏰ MARK EXPIRED - Stock: {}", stockId);
        try {
            StockMovementDto result = stockService.markExpired(
                    businessId, stockId,
                    reason != null ? reason : "Product expired", null);
            log.info("✅ MARKED EXPIRED - Stock: {}", stockId);
            return ResponseEntity.ok(ApiResponse.success("Stock marked as expired", result));
        } catch (Exception e) {
            log.error("❌ MARK EXPIRED FAILED - Stock: {}, Error: {}", stockId, e.getMessage());
            throw e;
        }
    }

    // ==================== BARCODE OPERATIONS ====================

    /**
     * Assign barcode to a stock batch
     * POST /api/v1/stock/{stockId}/assign-barcode?businessId=...&barcode=...
     *
     * Use case: Print and stick a barcode label on a product batch
     */
    @PostMapping("/{stockId}/assign-barcode")
    public ResponseEntity<ApiResponse<ProductStockDto>> assignBarcode(
            @PathVariable UUID stockId,
            @RequestParam UUID businessId,
            @RequestParam String barcode) {
        log.info("🏷️ ASSIGN BARCODE - Stock: {}, Barcode: {}", stockId, barcode);
        try {
            ProductStockDto result = stockService.assignBarcode(businessId, stockId, barcode);
            log.info("✅ BARCODE ASSIGNED - Stock: {}, Barcode: {}", stockId, barcode);
            return ResponseEntity.ok(ApiResponse.success("Barcode assigned successfully", result));
        } catch (Exception e) {
            log.error("❌ ASSIGN BARCODE FAILED - Stock: {}, Error: {}", stockId, e.getMessage());
            throw e;
        }
    }

    /**
     * Remove barcode from a stock batch
     * POST /api/v1/stock/{stockId}/remove-barcode?businessId=...
     *
     * Use case: Barcode damaged or need to reassign
     */
    @PostMapping("/{stockId}/remove-barcode")
    public ResponseEntity<ApiResponse<ProductStockDto>> removeBarcode(
            @PathVariable UUID stockId,
            @RequestParam UUID businessId) {
        log.info("🏷️ REMOVE BARCODE - Stock: {}", stockId);
        try {
            ProductStockDto result = stockService.removeBarcode(businessId, stockId);
            log.info("✅ BARCODE REMOVED - Stock: {}", stockId);
            return ResponseEntity.ok(ApiResponse.success("Barcode removed successfully", result));
        } catch (Exception e) {
            log.error("❌ REMOVE BARCODE FAILED - Stock: {}, Error: {}", stockId, e.getMessage());
            throw e;
        }
    }

    // ==================== AVAILABILITY CHECK ====================

    /**
     * Check if enough stock is available for a product
     * POST /api/v1/stock/check-availability?businessId=...&productId=...&quantity=...&sizeId=...
     *
     * Use case: Before adding to cart, check if 3 units of Coca-Cola are in stock
     * Returns: { "available": true, "quantity": 3 }
     */
    @PostMapping("/check-availability")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkAvailability(
            @RequestParam UUID businessId,
            @RequestParam UUID productId,
            @RequestParam(required = false) UUID sizeId,
            @RequestParam Integer quantity) {
        log.info("🔍 CHECK AVAILABILITY - Product: {}, Qty: {}", productId, quantity);
        try {
            Boolean available = stockService.checkAvailability(productId, sizeId, quantity, businessId);
            Map<String, Object> result = new HashMap<>();
            result.put("available", available);
            result.put("quantity", quantity);
            log.info("✅ AVAILABILITY - Product: {}, Available: {}", productId, available);
            return ResponseEntity.ok(ApiResponse.success("Availability checked", result));
        } catch (Exception e) {
            log.error("❌ CHECK FAILED - Product: {}, Error: {}", productId, e.getMessage());
            throw e;
        }
    }

    /**
     * Check availability for multiple products at once
     * POST /api/v1/stock/check-bulk-availability?businessId=...
     *
     * Use case: Cart checkout → check all items are in stock before payment
     * Body: { "productId1": 3, "productId2": 1 }
     * Returns: { "productId1": true, "productId2": false }
     */
    @PostMapping("/check-bulk-availability")
    public ResponseEntity<ApiResponse<Map<UUID, Boolean>>> checkBulkAvailability(
            @RequestParam UUID businessId,
            @RequestBody Map<UUID, Integer> productQuantities) {
        log.info("🔍 BULK CHECK - {} products", productQuantities.size());
        try {
            Map<UUID, Boolean> result = stockService.checkBulkAvailability(productQuantities, businessId);
            log.info("✅ BULK CHECK DONE - {} products checked", result.size());
            return ResponseEntity.ok(ApiResponse.success("Bulk availability checked", result));
        } catch (Exception e) {
            log.error("❌ BULK CHECK FAILED - Error: {}", e.getMessage());
            throw e;
        }
    }

    // ==================== REPORTS & SUMMARY ====================

    /**
     * Get stock dashboard summary for a business
     * POST /api/v1/stock/summary?businessId=...
     *
     * Use case: Dashboard overview showing total items, value, low stock count, etc.
     */
    @PostMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStockSummary(
            @RequestParam UUID businessId) {
        log.info("📊 STOCK SUMMARY - Business: {}", businessId);
        try {
            Map<String, Object> result = stockService.getStockSummary(businessId);
            log.info("✅ SUMMARY RETRIEVED - Business: {}", businessId);
            return ResponseEntity.ok(ApiResponse.success("Stock summary retrieved", result));
        } catch (Exception e) {
            log.error("❌ SUMMARY FAILED - Business: {}, Error: {}", businessId, e.getMessage());
            throw e;
        }
    }
}
