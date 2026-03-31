package com.emenu.features.main.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.ProductFilterDto;
import com.emenu.features.main.dto.request.ProductCreateDto;
import com.emenu.features.main.dto.request.BulkPromotionCreateDto;
import com.emenu.features.main.dto.response.ProductDetailDto;
import com.emenu.features.main.dto.response.ProductListDto;
import com.emenu.features.main.dto.response.BulkPromotionResultDto;
import com.emenu.features.main.dto.update.ProductUpdateDto;
import com.emenu.features.main.service.ProductService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
public class ProductController {

    private final ProductService productService;
    private final SecurityUtils securityUtils;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductListDto>>> getAllProducts(
            @Valid @RequestBody ProductFilterDto filter) {
        
        log.info("Get all products - Page: {}, Size: {}", filter.getPageNo(), filter.getPageSize());
        
        PaginationResponse<ProductListDto> products = productService.getAllProducts(filter);
        
        return ResponseEntity.ok(ApiResponse.success(
            String.format("Found %d products", products.getTotalElements()),
            products
        ));
    }

    @PostMapping("/admin/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductDetailDto>>> getAllProductAdmin(
            @Valid @RequestBody ProductFilterDto filter) {

        log.info("Get products by admin - Page: {}, Size: {}", filter.getPageNo(), filter.getPageSize());

        PaginationResponse<ProductDetailDto> products = productService.getAllProductsAdmin(filter);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", products.getTotalElements()),
                products
        ));
    }

    @PostMapping("/admin/pos/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductDetailDto>>> getAllProductAdminPos(
            @Valid @RequestBody ProductFilterDto filter) {

        log.info("Get products by admin for POS - Page: {}, Size: {}", filter.getPageNo(), filter.getPageSize());

        PaginationResponse<ProductDetailDto> products = productService.getAllProductsAdminPos(filter);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", products.getTotalElements()),
                products
        ));
    }

    @PostMapping("/admin/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProductDetailDto>>> getAllProductBusiness(
            @Valid @RequestBody ProductFilterDto filter) {

        log.info("Get products by business user - Page: {}, Size: {}", filter.getPageNo(), filter.getPageSize());
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        filter.setBusinessId(businessId);
        PaginationResponse<ProductDetailDto> products = productService.getAllProductsAdmin(filter);

        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", products.getTotalElements()),
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
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> resetAllPromotions() {
        log.info("Reset all promotions for current business");

        java.util.Map<String, Object> result = productService.resetAllPromotions();

        return ResponseEntity.ok(ApiResponse.success("All promotions reset successfully", result));
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
        log.info("Manual sync: clearing expired promotion display fields");

        int[] result = productService.syncExpiredPromotions();
        String message = String.format(
            "Sync complete. Updated %d products without sizes, %d products with sizes. Total: %d",
            result[0], result[1], result[0] + result[1]
        );

        log.info(message);
        return ResponseEntity.ok(ApiResponse.success(message, null));
    }
}