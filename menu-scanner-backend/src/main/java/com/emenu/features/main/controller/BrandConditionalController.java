package com.emenu.features.main.controller;

import com.emenu.features.main.dto.response.BrandResponse;
import com.emenu.features.main.service.BrandService;
import com.emenu.features.main.service.ProductConditionalService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Slf4j
public class BrandConditionalController {

    private final BrandService brandService;
    private final ProductConditionalService productConditionalService;

    /**
     * Get brands for a business - respects useBrands setting
     */
    @GetMapping("/business/{businessId}/conditional")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getBrands(
            @PathVariable UUID businessId) {

        log.info("GET /api/v1/brands/business/{}/conditional - Fetching brands", businessId);

        // Check if business uses brands
        if (!productConditionalService.businessUsesBrands(businessId)) {
            log.info("Business {} does not use brands - returning empty list", businessId);
            return ResponseEntity.ok(ApiResponse.success(
                "Brands are not enabled for this business",
                Collections.emptyList()
            ));
        }

        try {
            List<BrandResponse> brands = brandService.getBrandsByBusiness(businessId);
            log.info("Found {} brands for business {}", brands.size(), businessId);

            return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d brands", brands.size()),
                brands
            ));
        } catch (Exception e) {
            log.error("Error fetching brands for business {}: {}", businessId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get brand by ID - returns null if business doesn't use brands
     */
    @GetMapping("/{id}/business/{businessId}/conditional")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(
            @PathVariable UUID id,
            @PathVariable UUID businessId) {

        log.info("GET /api/v1/brands/{}/business/{}/conditional", id, businessId);

        // Check if business uses brands
        if (!productConditionalService.businessUsesBrands(businessId)) {
            log.info("Business {} does not use brands - returning not found", businessId);
            return ResponseEntity.ok(ApiResponse.success(
                "Brands are not enabled for this business",
                null
            ));
        }

        try {
            BrandResponse brand = brandService.getBrandById(id);
            if (brand != null && businessId.equals(brand.getBusinessId())) {
                return ResponseEntity.ok(ApiResponse.success(
                    "Brand retrieved successfully",
                    brand
                ));
            } else {
                return ResponseEntity.ok(ApiResponse.success(
                    "Brand not found",
                    null
                ));
            }
        } catch (Exception e) {
            log.error("Error fetching brand {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}
