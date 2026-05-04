package com.emenu.features.main.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.BrandFilterRequest;
import com.emenu.features.main.dto.request.BrandCreateRequest;
import com.emenu.features.main.dto.response.BrandResponse;
import com.emenu.features.main.dto.response.BrandWithProductCountResponse;
import com.emenu.features.main.dto.update.BrandUpdateRequest;
import com.emenu.features.main.service.BrandService;
import com.emenu.features.main.service.ProductConditionalService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Slf4j
public class BrandController {

    private final BrandService brandService;
    private final ProductConditionalService productConditionalService;
    private final SecurityUtils securityUtils;

    /**
     * Create new brand (uses current user's business from token)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(@Valid @RequestBody BrandCreateRequest request) {
        log.info("Creating brand: {}", request.getName());
        BrandResponse brand = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Brand created successfully", brand));
    }

    /**
     * Get all brands with filtering - respects business settings (useBrands flag)
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandResponse>>> getAllBrands(@Valid @RequestBody BrandFilterRequest filter) {
        log.info("Getting all brands - BusinessId: {}", filter.getBusinessId());

        // Check if business uses brands
        if (filter.getBusinessId() != null && !productConditionalService.businessUsesBrands(filter.getBusinessId())) {
            log.info("Business {} does not use brands - returning empty list", filter.getBusinessId());
            PaginationResponse<BrandResponse> emptyResponse = new PaginationResponse<>();
            emptyResponse.setContent(Collections.emptyList());
            emptyResponse.setTotalElements(0L);
            emptyResponse.setTotalPages(0);
            return ResponseEntity.ok(ApiResponse.success("Brands are not enabled for this business", emptyResponse));
        }

        PaginationResponse<BrandResponse> brands = brandService.getAllBrands(filter);
        return ResponseEntity.ok(ApiResponse.success("Brands retrieved successfully", brands));
    }

    /**
     * Get my business brands - respects business settings (useBrands flag)
     */
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandResponse>>> getMyBusinessBrands(@Valid @RequestBody BrandFilterRequest filter) {
        log.info("Getting brands for current user's business");
        User currentUser = securityUtils.getCurrentUser();
        filter.setBusinessId(currentUser.getBusinessId());

        // Check if business uses brands
        if (!productConditionalService.businessUsesBrands(currentUser.getBusinessId())) {
            log.info("Business {} does not use brands - returning empty list", currentUser.getBusinessId());
            PaginationResponse<BrandResponse> emptyResponse = new PaginationResponse<>();
            emptyResponse.setContent(Collections.emptyList());
            emptyResponse.setTotalElements(0L);
            emptyResponse.setTotalPages(0);
            return ResponseEntity.ok(ApiResponse.success("Brands are not enabled for this business", emptyResponse));
        }

        PaginationResponse<BrandResponse> brands = brandService.getAllBrands(filter);
        return ResponseEntity.ok(ApiResponse.success("Business brands retrieved successfully", brands));
    }

    /**
     * Get my business brands with product count
     * If businessId is provided in filter, use it; otherwise use current user's business
     */
    @PostMapping("/my-business/with-product-count")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandWithProductCountResponse>>> getMyBusinessBrandsWithProductCount(@Valid @RequestBody BrandFilterRequest filter) {
        log.info("Getting brands with product count for current user's business");
        User currentUser = securityUtils.getCurrentUser();
        filter.setBusinessId(currentUser.getBusinessId());
        PaginationResponse<BrandWithProductCountResponse> brands = brandService.getBrandsWithProductCount(filter);
        return ResponseEntity.ok(ApiResponse.success("Business brands with product count retrieved successfully", brands));
    }

    /**
     * Get brand by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable UUID id) {
        log.info("Getting brand by ID: {}", id);
        BrandResponse brand = brandService.getBrandById(id);
        return ResponseEntity.ok(ApiResponse.success("Brand retrieved successfully", brand));
    }

    /**
     * Update brand
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable UUID id,
            @Valid @RequestBody BrandUpdateRequest request) {
        log.info("Updating brand: {}", id);
        BrandResponse brand = brandService.updateBrand(id, request);
        return ResponseEntity.ok(ApiResponse.success("Brand updated successfully", brand));
    }

    /**
     * Delete brand
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> deleteBrand(@PathVariable UUID id) {
        log.info("Deleting brand: {}", id);
        BrandResponse brand = brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully", brand));
    }
}
