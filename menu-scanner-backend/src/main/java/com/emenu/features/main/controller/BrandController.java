package com.emenu.features.main.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.BrandFilterRequest;
import com.emenu.features.main.dto.request.BrandCreateRequest;
import com.emenu.features.main.dto.response.BrandResponse;
import com.emenu.features.main.dto.response.BrandWithProductCountResponse;
import com.emenu.features.main.dto.update.BrandUpdateRequest;
import com.emenu.features.main.service.BrandService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandService brandService;
    private final SecurityUtils securityUtils;

    /**
     * Create new brand (uses current user's business from token)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(@Valid @RequestBody BrandCreateRequest request) {
        BrandResponse brand = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Brand created successfully", brand));
    }

    /**
     * Get all brands with filtering
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandResponse>>> getAllBrands(@Valid @RequestBody BrandFilterRequest filter) {
        PaginationResponse<BrandResponse> brands = brandService.getAllBrands(filter);
        return ResponseEntity.ok(ApiResponse.success("Brands retrieved successfully", brands));
    }

    /**
     * Get my business brands
     * If businessId is provided in filter, use it; otherwise use current user's business
     */
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandResponse>>> getMyBusinessBrands(@Valid @RequestBody BrandFilterRequest filter) {
        User currentUser = securityUtils.getCurrentUser();
        filter.setBusinessId(currentUser.getBusinessId());
        PaginationResponse<BrandResponse> brands = brandService.getAllBrands(filter);
        return ResponseEntity.ok(ApiResponse.success("Business brands retrieved successfully", brands));
    }

    /**
     * Get my business brands with product count
     * If businessId is provided in filter, use it; otherwise use current user's business
     */
    @PostMapping("/my-business/with-product-count")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandWithProductCountResponse>>> getMyBusinessBrandsWithProductCount(@Valid @RequestBody BrandFilterRequest filter) {
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
        BrandResponse brand = brandService.updateBrand(id, request);
        return ResponseEntity.ok(ApiResponse.success("Brand updated successfully", brand));
    }

    /**
     * Delete brand
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> deleteBrand(@PathVariable UUID id) {
        BrandResponse brand = brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully", brand));
    }
}
