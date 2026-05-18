package com.emenu.features.stock.controller;

import com.emenu.features.stock.dto.request.ProductStockCreateRequest;
import com.emenu.features.stock.dto.request.ProductStockFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockItemsFilterRequest;
import com.emenu.features.stock.dto.request.ProductStockUpdateRequest;
import com.emenu.features.stock.dto.response.ProductStockDto;
import com.emenu.features.stock.dto.response.ProductStockItemDto;
import com.emenu.features.stock.service.ProductStockService;
import com.emenu.security.SecurityUtils;
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
public class ProductStockController {

    private final ProductStockService productStockService;
    private final SecurityUtils securityUtils;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductStockDto>>> getAllProductStocks(
            @Valid @RequestBody ProductStockFilterRequest request) {
        log.info("Endpoint: search-product-stocks - product stocks retrieval: page={}, size={}", request.getPageNo(), request.getPageSize());
        PaginationResponse<ProductStockDto> response = productStockService.getAllProductStocks(request);
        return ResponseEntity.ok(ApiResponse.success("Product stocks retrieved", response));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductStockDto>>> getMyBusinessProductStocks(
            @Valid @RequestBody ProductStockFilterRequest request) {
        log.info("Endpoint: my-product-stocks - my product stocks retrieval: page={}, size={}", request.getPageNo(), request.getPageSize());
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        request.setBusinessId(businessId);
        PaginationResponse<ProductStockDto> response = productStockService.getAllProductStocks(request);
        return ResponseEntity.ok(ApiResponse.success("Product stocks retrieved", response));
    }

    @PostMapping("/items/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductStockItemDto>>> getMyBusinessProductStockItems(
            @Valid @RequestBody ProductStockFilterRequest request) {
        log.info("Endpoint: my-product-stock-items - my product stock items retrieval: page={}, size={}", request.getPageNo(), request.getPageSize());
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        request.setBusinessId(businessId);
        PaginationResponse<ProductStockItemDto> response = productStockService.getAllProductStockItems(request);
        return ResponseEntity.ok(ApiResponse.success("Product stock items retrieved", response));
    }

    @PostMapping("/items/my-business")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductStockItemDto>>> getMyBusinessProductStockItemsTypeSafe(
            @Valid @RequestBody ProductStockItemsFilterRequest request) {
        log.info("Endpoint: my-product-stock-items-typesafe - my product stock items retrieval: page={}, size={}", request.getPageNo(), request.getPageSize());
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        request.setBusinessId(businessId);
        PaginationResponse<ProductStockItemDto> response = productStockService.getProductStockItems(request);
        return ResponseEntity.ok(ApiResponse.success("Product stock items retrieved", response));
    }

    @GetMapping("/{productStockId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> getProductStockById(
            @PathVariable UUID productStockId) {
        log.info("Endpoint: get-product-stock - product stock retrieval: id={}", productStockId);
        ProductStockDto response = productStockService.getProductStockById(productStockId);
        return ResponseEntity.ok(ApiResponse.success("Product stock retrieved", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductStockDto>> createProductStock(
            @Valid @RequestBody ProductStockCreateRequest request) {
        log.info("Endpoint: create-product-stock - product stock creation: product_id={}", request.getProductId());
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        request.setBusinessId(businessId);
        ProductStockDto response = productStockService.createProductStock(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product stock created", response));
    }

    @PutMapping("/{productStockId}")
    public ResponseEntity<ApiResponse<ProductStockDto>> updateProductStock(
            @PathVariable UUID productStockId,
            @Valid @RequestBody ProductStockUpdateRequest request) {
        log.info("Endpoint: update-product-stock - product stock update: id={}", productStockId);
        ProductStockDto response = productStockService.updateProductStock(productStockId, request);
        return ResponseEntity.ok(ApiResponse.success("Product stock updated", response));
    }

    @DeleteMapping("/{productStockId}")
    public ResponseEntity<ApiResponse<Void>> deleteProductStock(
            @PathVariable UUID productStockId) {
        log.info("Endpoint: delete-product-stock - product stock deletion: id={}", productStockId);
        productStockService.deleteProductStock(productStockId);
        return ResponseEntity.ok(ApiResponse.success("Product stock deleted", null));
    }
}
