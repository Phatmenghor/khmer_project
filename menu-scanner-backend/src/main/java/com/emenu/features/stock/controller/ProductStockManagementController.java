package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.request.ProductStockCreateRequest;
import com.emenu.features.stock.dto.request.ProductStockFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockUpdateRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.service.ProductStockService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller for managing ProductStock CRUD operations
 * Endpoint: /api/v1/product-stock
 */
@RestController
@RequestMapping("/api/v1/product-stock")
@RequiredArgsConstructor
@Slf4j
public class ProductStockManagementController {

    private final ProductStockService productStockService;

    /**
     * Get all product stocks with pagination and filters
     * POST /api/v1/product-stock/all
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductStockDto>>> getAllProductStocks(
            @Valid @RequestBody ProductStockFilterRequest request) {
        log.info("📥 INCOMING REQUEST - GET ALL PRODUCT STOCKS with filters");
        log.info("   Business ID: {}", request.getBusinessId());

        try {
            PaginationResponse<ProductStockDto> response = productStockService.getAllProductStocks(request);
            log.info("📤 RESPONSE SUCCESS - Total Records: {}, Current Page: {}",
                    response.getTotalElements(), response.getPageNo());
            return ResponseEntity.ok(ApiResponse.success("Product stocks retrieved", response));
        } catch (Exception e) {
            log.error("❌ ERROR - Failed to retrieve product stocks: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get product stock by ID
     * GET /api/v1/product-stock/{productStockId}
     */
    @GetMapping("/{productStockId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> getProductStockById(
            @PathVariable UUID productStockId) {
        log.info("📖 GET PRODUCT STOCK - ID: {}", productStockId);
        try {
            ProductStockDto response = productStockService.getProductStockById(productStockId);
            log.info("✅ RETRIEVED - ID: {}, Quantity: {}", response.getId(), response.getQuantityOnHand());
            return ResponseEntity.ok(ApiResponse.success("Product stock retrieved", response));
        } catch (Exception e) {
            log.error("❌ GET FAILED - ID: {}, Error: {}", productStockId, e.getMessage());
            throw e;
        }
    }

    /**
     * Create a new product stock
     * POST /api/v1/product-stock
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductStockDto>> createProductStock(
            @Valid @RequestBody ProductStockCreateRequest request) {
        log.info("📥 CREATE PRODUCT STOCK - Business: {}, Product: {}",
                request.getBusinessId(), request.getProductId());
        try {
            ProductStockDto response = productStockService.createProductStock(request);
            log.info("✅ CREATED - ID: {}, Quantity: {}", response.getId(), response.getQuantityOnHand());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Product stock created", response));
        } catch (Exception e) {
            log.error("❌ CREATE FAILED: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Update product stock
     * PUT /api/v1/product-stock/{productStockId}
     */
    @PutMapping("/{productStockId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> updateProductStock(
            @PathVariable UUID productStockId,
            @Valid @RequestBody ProductStockUpdateRequest request) {
        log.info("📝 UPDATE PRODUCT STOCK - ID: {}", productStockId);
        try {
            ProductStockDto response = productStockService.updateProductStock(productStockId, request);
            log.info("✅ UPDATED - ID: {}, New Quantity: {}", response.getId(), response.getQuantityOnHand());
            return ResponseEntity.ok(ApiResponse.success("Product stock updated", response));
        } catch (Exception e) {
            log.error("❌ UPDATE FAILED - ID: {}, Error: {}", productStockId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Delete product stock
     * DELETE /api/v1/product-stock/{productStockId}
     */
    @DeleteMapping("/{productStockId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductStock(
            @PathVariable UUID productStockId) {
        log.info("🗑️  DELETE PRODUCT STOCK - ID: {}", productStockId);
        try {
            productStockService.deleteProductStock(productStockId);
            log.info("✅ DELETED - ID: {}", productStockId);
            return ResponseEntity.ok(ApiResponse.success("Product stock deleted", null));
        } catch (Exception e) {
            log.error("❌ DELETE FAILED - ID: {}, Error: {}", productStockId, e.getMessage(), e);
            throw e;
        }
    }
}
