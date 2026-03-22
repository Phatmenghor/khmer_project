package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.request.StockAdjustmentRequest;
import com.emenu.features.stock.dto.request.StockQueryRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.features.stock.service.StockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
@Slf4j
public class StockController {

    private final StockService stockService;

    // ========== Query Operations - Body-Based Filtering ==========

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProductStockDto>>> searchStock(
        @Valid @RequestBody StockQueryRequest request
    ) {
        log.info("Searching stock with filters: {}", request);
        Page<ProductStockDto> result = stockService.searchStock(request);
        return ResponseEntity.ok(ApiResponse.success(result, "Stock search completed"));
    }

    @PostMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<ProductStockDto>>> getLowStockProducts(
        @RequestParam UUID businessId
    ) {
        log.info("Getting low stock products for business: {}", businessId);
        List<ProductStockDto> result = stockService.getLowStockProducts(businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "Low stock products retrieved"));
    }

    @PostMapping("/expired")
    public ResponseEntity<ApiResponse<List<ProductStockDto>>> getExpiredProducts(
        @RequestParam UUID businessId
    ) {
        log.info("Getting expired products for business: {}", businessId);
        List<ProductStockDto> result = stockService.getExpiredProducts(businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "Expired products retrieved"));
    }

    @PostMapping("/expiring")
    public ResponseEntity<ApiResponse<List<ProductStockDto>>> getExpiringProducts(
        @RequestParam UUID businessId,
        @RequestParam(defaultValue = "7") Integer daysAhead
    ) {
        log.info("Getting expiring products for business: {} within {} days", businessId, daysAhead);
        List<ProductStockDto> result = stockService.getExpiringProducts(businessId, daysAhead);
        return ResponseEntity.ok(ApiResponse.success(result, "Expiring products retrieved"));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<List<ProductStockDto>>> getAllStock(
        @RequestParam UUID businessId
    ) {
        log.info("Getting all stock for business: {}", businessId);
        List<ProductStockDto> result = stockService.getAllStockByBusiness(businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "All stock retrieved"));
    }

    // ========== Get Operations ==========

    @GetMapping("/{stockId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> getStockById(
        @PathVariable UUID stockId
    ) {
        log.info("Getting stock by ID: {}", stockId);
        ProductStockDto result = stockService.getStockById(stockId);
        return ResponseEntity.ok(ApiResponse.success(result, "Stock retrieved"));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> getStockByProduct(
        @PathVariable UUID productId,
        @RequestParam UUID businessId,
        @RequestParam(required = false) UUID sizeId
    ) {
        log.info("Getting stock for product: {} in business: {}", productId, businessId);
        ProductStockDto result = stockService.getStockByProductAndSize(productId, sizeId, businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "Stock retrieved"));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ApiResponse<ProductStockDto>> getByBarcode(
        @PathVariable String barcode,
        @RequestParam UUID businessId
    ) {
        log.info("Getting stock by barcode: {} for business: {}", barcode, businessId);
        ProductStockDto result = stockService.getByBarcode(barcode, businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "Stock retrieved by barcode"));
    }

    // ========== Availability Check - Body-Based ==========

    @PostMapping("/check-availability")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkAvailability(
        @RequestParam UUID businessId,
        @RequestParam UUID productId,
        @RequestParam(required = false) UUID sizeId,
        @RequestParam Integer quantity
    ) {
        log.info("Checking availability for product: {} quantity: {}", productId, quantity);
        Boolean available = stockService.checkAvailability(productId, sizeId, quantity, businessId);

        Map<String, Object> result = new HashMap<>();
        result.put("available", available);
        result.put("quantity", quantity);

        return ResponseEntity.ok(ApiResponse.success(result, "Availability checked"));
    }

    @PostMapping("/check-bulk-availability")
    public ResponseEntity<ApiResponse<Map<UUID, Boolean>>> checkBulkAvailability(
        @RequestParam UUID businessId,
        @RequestBody Map<UUID, Integer> productQuantities
    ) {
        log.info("Checking bulk availability for {} products", productQuantities.size());
        Map<UUID, Boolean> result = stockService.checkBulkAvailability(productQuantities, businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "Bulk availability checked"));
    }

    // ========== Adjustment Operations - Body-Based ==========

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<Object>> adjustStock(
        @RequestParam UUID businessId,
        @Valid @RequestBody StockAdjustmentRequest request
    ) {
        log.info("Adjusting stock: {}", request);
        var result = stockService.adjustStock(businessId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(result, "Stock adjusted successfully"));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse<Object>> addStock(
        @RequestParam UUID businessId,
        @RequestParam UUID productStockId,
        @RequestParam Integer quantity,
        @RequestParam(required = false) String reason
    ) {
        log.info("Adding stock: {} quantity for stock: {}", quantity, productStockId);
        var result = stockService.addStock(businessId, productStockId, quantity, reason != null ? reason : "Stock In", null);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(result, "Stock added successfully"));
    }

    @PostMapping("/{stockId}/mark-expired")
    public ResponseEntity<ApiResponse<Object>> markExpired(
        @PathVariable UUID stockId,
        @RequestParam UUID businessId,
        @RequestParam(required = false) String reason
    ) {
        log.info("Marking stock as expired: {}", stockId);
        var result = stockService.markExpired(businessId, stockId, reason != null ? reason : "Product expired", null);
        return ResponseEntity.ok(ApiResponse.success(result, "Stock marked as expired"));
    }

    // ========== Barcode Management ==========

    @PostMapping("/{stockId}/assign-barcode")
    public ResponseEntity<ApiResponse<ProductStockDto>> assignBarcode(
        @PathVariable UUID stockId,
        @RequestParam UUID businessId,
        @RequestParam String barcode
    ) {
        log.info("Assigning barcode: {} to stock: {}", barcode, stockId);
        ProductStockDto result = stockService.assignBarcode(businessId, stockId, barcode);
        return ResponseEntity.ok(ApiResponse.success(result, "Barcode assigned successfully"));
    }

    @PostMapping("/{stockId}/remove-barcode")
    public ResponseEntity<ApiResponse<ProductStockDto>> removeBarcode(
        @PathVariable UUID stockId,
        @RequestParam UUID businessId
    ) {
        log.info("Removing barcode from stock: {}", stockId);
        ProductStockDto result = stockService.removeBarcode(businessId, stockId);
        return ResponseEntity.ok(ApiResponse.success(result, "Barcode removed successfully"));
    }

    // ========== Stock Summary & Reports ==========

    @PostMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStockSummary(
        @RequestParam UUID businessId
    ) {
        log.info("Getting stock summary for business: {}", businessId);
        Map<String, Object> result = stockService.getStockSummary(businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "Stock summary retrieved"));
    }

    @PostMapping("/report/valuation")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getValuationReport(
        @RequestParam UUID businessId
    ) {
        log.info("Getting valuation report for business: {}", businessId);
        Map<String, Object> result = stockService.getStockValuationReport(businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "Valuation report retrieved"));
    }

    @PostMapping("/report/low-stock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLowStockReport(
        @RequestParam UUID businessId
    ) {
        log.info("Getting low stock report for business: {}", businessId);
        Map<String, Object> result = stockService.getLowStockReport(businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "Low stock report retrieved"));
    }

    @PostMapping("/report/expiry")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExpiryReport(
        @RequestParam UUID businessId
    ) {
        log.info("Getting expiry report for business: {}", businessId);
        Map<String, Object> result = stockService.getExpiryReport(businessId);
        return ResponseEntity.ok(ApiResponse.success(result, "Expiry report retrieved"));
    }

    @PostMapping("/report/movement")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMovementReport(
        @RequestParam UUID businessId,
        @RequestParam(required = false) LocalDateTime from,
        @RequestParam(required = false) LocalDateTime to
    ) {
        LocalDateTime fromDate = from != null ? from : LocalDateTime.now().minusMonths(1);
        LocalDateTime toDate = to != null ? to : LocalDateTime.now();

        log.info("Getting movement report for business: {} from: {} to: {}", businessId, fromDate, toDate);
        Map<String, Object> result = stockService.getMovementReport(businessId, fromDate, toDate);
        return ResponseEntity.ok(ApiResponse.success(result, "Movement report retrieved"));
    }
}
