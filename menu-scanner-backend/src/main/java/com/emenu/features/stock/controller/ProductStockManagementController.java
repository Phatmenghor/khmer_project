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

@RestController
@RequestMapping("/api/v1/product-stock")
@RequiredArgsConstructor
@Slf4j
public class ProductStockManagementController {

    private final ProductStockService productStockService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductStockDto>>> getAllProductStocks(
            @Valid @RequestBody ProductStockFilterRequest request) {
        log.info("Get all product stocks - business: {}", request.getBusinessId());
        PaginationResponse<ProductStockDto> response = productStockService.getAllProductStocks(request);
        return ResponseEntity.ok(ApiResponse.success("Product stocks retrieved", response));
    }

    @GetMapping("/{productStockId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> getProductStockById(
            @PathVariable UUID productStockId) {
        log.info("Get product stock - id: {}", productStockId);
        ProductStockDto response = productStockService.getProductStockById(productStockId);
        return ResponseEntity.ok(ApiResponse.success("Product stock retrieved", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductStockDto>> createProductStock(
            @Valid @RequestBody ProductStockCreateRequest request) {
        log.info("Create product stock - business: {}, product: {}", request.getBusinessId(), request.getProductId());
        ProductStockDto response = productStockService.createProductStock(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product stock created", response));
    }

    @PutMapping("/{productStockId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> updateProductStock(
            @PathVariable UUID productStockId,
            @Valid @RequestBody ProductStockUpdateRequest request) {
        log.info("Update product stock - id: {}", productStockId);
        ProductStockDto response = productStockService.updateProductStock(productStockId, request);
        return ResponseEntity.ok(ApiResponse.success("Product stock updated", response));
    }

    @DeleteMapping("/{productStockId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductStock(
            @PathVariable UUID productStockId) {
        log.info("Delete product stock - id: {}", productStockId);
        productStockService.deleteProductStock(productStockId);
        return ResponseEntity.ok(ApiResponse.success("Product stock deleted", null));
    }
}
