package com.emenu.features.main.controller;

import com.emenu.features.main.dto.filter.ProductFilterDto;
import com.emenu.features.main.dto.request.ProductCreateDto;
import com.emenu.features.main.dto.request.BulkPromotionCreateDto;
import com.emenu.features.main.dto.request.ResetSelectedPromotionsDto;
import com.emenu.features.main.dto.response.ProductDetailDto;
import com.emenu.features.main.dto.response.ProductListDto;
import com.emenu.features.main.dto.response.BulkPromotionResultDto;
import com.emenu.features.main.dto.update.ProductUpdateDto;
import com.emenu.features.main.service.ProductService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.BatchImportResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final SecurityUtils securityUtils;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductListDto>>> getAllProducts(
            @Valid @RequestBody ProductFilterDto filter) {
        PaginationResponse<ProductListDto> products = productService.getAllProducts(filter);
        return ResponseEntity.ok(ApiResponse.success(
            String.format("Found %d products", products.getTotalElements()),
            products
        ));
    }

    @PostMapping("/admin/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductDetailDto>>> getAllProductAdmin(
            @Valid @RequestBody ProductFilterDto filter) {
        PaginationResponse<ProductDetailDto> products = productService.getAllProductsAdmin(filter);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", products.getTotalElements()),
                products
        ));
    }

    @PostMapping("/admin/pos/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductDetailDto>>> getAllProductAdminPos(
            @Valid @RequestBody ProductFilterDto filter) {
        PaginationResponse<ProductDetailDto> products = productService.getAllProductsAdminPos(filter);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", products.getTotalElements()),
                products
        ));
    }

    @PostMapping("/admin/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductDetailDto>>> getAllProductBusiness(
            @Valid @RequestBody ProductFilterDto filter) {
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        filter.setBusinessId(businessId);
        PaginationResponse<ProductDetailDto> products = productService.getAllProductsAdmin(filter);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", products.getTotalElements()),
                products
        ));
    }

    @PostMapping("/admin/stock/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductDetailDto>>> getAllProductAdminStock(
            @Valid @RequestBody ProductFilterDto filter) {
        PaginationResponse<ProductDetailDto> products = productService.getAllProductsAdminStock(filter);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products with stock information (Page %d of %d)",
                    products.getTotalElements(), products.getPageNo(), products.getTotalPages()),
                products
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getProductById(@PathVariable UUID id) {
        ProductDetailDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductDetailDto>> createProduct(
            @Valid @RequestBody ProductCreateDto request) {
        ProductDetailDto product = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", product));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchImportResponse<ProductDetailDto>>> createProductBatch(
            @RequestBody List<ProductCreateDto> requests,
            @RequestParam(required = false) String importId) {
        BatchImportResponse<ProductDetailDto> response = productService.createProductBatch(requests, importId);
        return ResponseEntity.ok(ApiResponse.success("Batch product import completed", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody ProductUpdateDto request) {
        ProductDetailDto product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailDto>> deleteProduct(@PathVariable UUID id) {
        ProductDetailDto product = productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", product));
    }

    @PutMapping("/{id}/reset-promotion")
    public ResponseEntity<ApiResponse<ProductDetailDto>> resetProductPromotion(@PathVariable UUID id) {
        ProductDetailDto product = productService.resetProductPromotion(id);
        return ResponseEntity.ok(ApiResponse.success("Product promotion reset successfully", product));
    }

    @PutMapping("/reset-all-promotions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetAllPromotions() {
        Map<String, Object> result = productService.resetAllPromotions();
        return ResponseEntity.ok(ApiResponse.success("All promotions reset successfully", result));
    }

    @PutMapping("/reset-selected-promotions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resetSelectedPromotions(
            @Valid @RequestBody ResetSelectedPromotionsDto request) {
        Map<String, Object> result = productService.resetSelectedPromotions(request);
        return ResponseEntity.ok(ApiResponse.success("Selected promotions reset successfully", result));
    }

    @PostMapping("/bulk-create-promotions")
    public ResponseEntity<ApiResponse<BulkPromotionResultDto>> createBulkPromotions(
            @Valid @RequestBody BulkPromotionCreateDto request) {
        BulkPromotionResultDto result = productService.createBulkPromotions(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bulk promotion creation completed", result));
    }

    @PostMapping("/admin/sync-promotions")
    public ResponseEntity<ApiResponse<String>> syncExpiredPromotions() {
        int[] result = productService.syncExpiredPromotions();
        String message = String.format(
            "Sync complete. Updated %d products without sizes, %d products with sizes. Total: %d",
            result[0], result[1], result[0] + result[1]
        );
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }
}