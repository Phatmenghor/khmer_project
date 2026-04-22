package com.emenu.features.main.controller;

import com.emenu.features.main.dto.response.ProductDetailDto;
import com.emenu.features.main.dto.response.ProductListDto;
import com.emenu.features.main.models.Product;
import com.emenu.features.main.service.ProductConditionalService;
import com.emenu.features.main.service.ProductService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
public class ProductConditionalController {

    private final ProductService productService;
    private final ProductConditionalService productConditionalService;

    /**
     * Get product by ID with conditional fields based on business settings
     */
    @GetMapping("/{id}/business/{businessId}/conditional")
    public ResponseEntity<ApiResponse<ProductDetailDto>> getProductForBusiness(
            @PathVariable UUID id,
            @PathVariable UUID businessId) {

        log.info("GET /api/v1/products/{}/business/{}/conditional", id, businessId);

        try {
            Optional<Product> productOpt = productService.getProductById(id);

            if (productOpt.isEmpty() || !productOpt.get().getBusinessId().equals(businessId)) {
                return ResponseEntity.ok(ApiResponse.success(
                    "Product not found",
                    null
                ));
            }

            Product product = productOpt.get();
            ProductDetailDto dto = productConditionalService.convertProductToDetailDto(product, businessId);

            log.info("Successfully retrieved product {} for business {}", id, businessId);
            return ResponseEntity.ok(ApiResponse.success(
                "Product retrieved successfully",
                dto
            ));
        } catch (Exception e) {
            log.error("Error fetching product {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get products by category - respects useCategories setting
     */
    @GetMapping("/category/{categoryId}/business/{businessId}/conditional")
    public ResponseEntity<ApiResponse<List<ProductListDto>>> getProductsByCategory(
            @PathVariable UUID categoryId,
            @PathVariable UUID businessId) {

        log.info("GET /api/v1/products/category/{}/business/{}/conditional", categoryId, businessId);

        // Check if business uses categories
        if (!productConditionalService.businessUsesCategories(businessId)) {
            log.info("Business {} does not use categories - returning empty list", businessId);
            return ResponseEntity.ok(ApiResponse.success(
                "Categories are not enabled for this business",
                Collections.emptyList()
            ));
        }

        try {
            List<Product> products = productService.getProductsByCategory(businessId, categoryId);
            List<ProductListDto> dtos = products.stream()
                .map(p -> productConditionalService.convertProductToListDto(p, businessId))
                .toList();

            log.info("Found {} products in category {}", dtos.size(), categoryId);
            return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", dtos.size()),
                dtos
            ));
        } catch (Exception e) {
            log.error("Error fetching products by category {}: {}", categoryId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get products by brand - respects useBrands setting
     */
    @GetMapping("/brand/{brandId}/business/{businessId}/conditional")
    public ResponseEntity<ApiResponse<List<ProductListDto>>> getProductsByBrand(
            @PathVariable UUID brandId,
            @PathVariable UUID businessId) {

        log.info("GET /api/v1/products/brand/{}/business/{}/conditional", brandId, businessId);

        // Check if business uses brands
        if (!productConditionalService.businessUsesBrands(businessId)) {
            log.info("Business {} does not use brands - returning empty list", businessId);
            return ResponseEntity.ok(ApiResponse.success(
                "Brands are not enabled for this business",
                Collections.emptyList()
            ));
        }

        try {
            List<Product> products = productService.getProductsByBrand(businessId, brandId);
            List<ProductListDto> dtos = products.stream()
                .map(p -> productConditionalService.convertProductToListDto(p, businessId))
                .toList();

            log.info("Found {} products by brand {}", dtos.size(), brandId);
            return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", dtos.size()),
                dtos
            ));
        } catch (Exception e) {
            log.error("Error fetching products by brand {}: {}", brandId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get all products for a business with conditional fields
     */
    @GetMapping("/business/{businessId}/all/conditional")
    public ResponseEntity<ApiResponse<List<ProductListDto>>> getAllProductsForBusiness(
            @PathVariable UUID businessId) {

        log.info("GET /api/v1/products/business/{}/all/conditional", businessId);

        try {
            List<Product> products = productService.getProductsByBusiness(businessId);
            List<ProductListDto> dtos = products.stream()
                .map(p -> productConditionalService.convertProductToListDto(p, businessId))
                .toList();

            log.info("Found {} products for business {}", dtos.size(), businessId);
            return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d products", dtos.size()),
                dtos
            ));
        } catch (Exception e) {
            log.error("Error fetching products for business {}: {}", businessId, e.getMessage(), e);
            throw e;
        }
    }
}
