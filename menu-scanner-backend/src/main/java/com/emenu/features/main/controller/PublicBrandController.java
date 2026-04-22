package com.emenu.features.main.controller;

import com.emenu.features.main.dto.filter.BrandAllFilterRequest;
import com.emenu.features.main.dto.filter.BrandFilterRequest;
import com.emenu.features.main.dto.response.BrandResponse;
import com.emenu.features.main.service.BrandService;
import com.emenu.features.main.service.ProductConditionalService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/public/brands")
@RequiredArgsConstructor
@Slf4j
public class PublicBrandController {
    private final BrandService brandService;
    private final ProductConditionalService productConditionalService;

    /**
     * Get my business brands
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandResponse>>> getMyBusinessBrands(@Valid @RequestBody BrandFilterRequest filter) {
        log.info("Getting brands for current user's business - BusinessId: {}", filter.getBusinessId());

        if (filter.getBusinessId() != null && !productConditionalService.businessUsesBrands(filter.getBusinessId())) {
            log.info("Business {} does not use brands - returning empty list", filter.getBusinessId());
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
     * Get my business brands
     */
    @PostMapping("/all-data")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAllBrands(@Valid @RequestBody BrandAllFilterRequest filter) {
        log.info("Getting all brands for current user's business - BusinessId: {}", filter.getBusinessId());

        if (filter.getBusinessId() != null && !productConditionalService.businessUsesBrands(filter.getBusinessId())) {
            log.info("Business {} does not use brands - returning empty list", filter.getBusinessId());
            return ResponseEntity.ok(ApiResponse.success("Brands are not enabled for this business", Collections.emptyList()));
        }

        List<BrandResponse> brands = brandService.getAllListBrands(filter);
        return ResponseEntity.ok(ApiResponse.success("Business all brands retrieved successfully", brands));
    }
}
