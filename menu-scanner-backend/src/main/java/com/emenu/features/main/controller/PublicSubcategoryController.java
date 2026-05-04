package com.emenu.features.main.controller;

import com.emenu.features.main.dto.filter.SubcategoryAllFilterRequest;
import com.emenu.features.main.dto.filter.SubcategoryFilterRequest;
import com.emenu.features.main.dto.response.CategoryWithSubcategoriesResponse;
import com.emenu.features.main.dto.response.SubcategoryResponse;
import com.emenu.features.main.service.SubcategoryService;
import com.emenu.features.main.service.ProductConditionalService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/v1/public/subcategories")
@RequiredArgsConstructor
@Slf4j
public class PublicSubcategoryController {
    private final SubcategoryService subcategoryService;
    private final ProductConditionalService productConditionalService;

    /**
     * Get all subcategories with filtering - respects business settings (useSubcategories flag)
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<SubcategoryResponse>>> getAllSubcategories(@Valid @RequestBody SubcategoryFilterRequest filter) {
        log.info("Getting all subcategories for business - BusinessId: {}", filter.getBusinessId());

        if (filter.getBusinessId() != null && !productConditionalService.businessUsesSubcategories(filter.getBusinessId())) {
            log.info("Business {} does not use subcategories - returning empty list", filter.getBusinessId());
            PaginationResponse<SubcategoryResponse> emptyResponse = new PaginationResponse<>();
            emptyResponse.setContent(Collections.emptyList());
            emptyResponse.setTotalElements(0L);
            emptyResponse.setTotalPages(0);
            return ResponseEntity.ok(ApiResponse.success("Subcategories are not enabled for this business", emptyResponse));
        }

        PaginationResponse<SubcategoryResponse> subcategories = subcategoryService.getAllSubcategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Subcategories retrieved successfully", subcategories));
    }

    /**
     * Get all subcategories data - respects business settings (useSubcategories flag)
     */
    @PostMapping("/all-data")
    public ResponseEntity<ApiResponse<List<SubcategoryResponse>>> getAllDataSubcategories(@Valid @RequestBody SubcategoryAllFilterRequest filter) {
        log.info("Getting all subcategories data for business - BusinessId: {}", filter.getBusinessId());

        if (filter.getBusinessId() != null && !productConditionalService.businessUsesSubcategories(filter.getBusinessId())) {
            log.info("Business {} does not use subcategories - returning empty list", filter.getBusinessId());
            return ResponseEntity.ok(ApiResponse.success("Subcategories are not enabled for this business", Collections.emptyList()));
        }

        List<SubcategoryResponse> subcategories = subcategoryService.getAllItemSubcategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Subcategories all retrieved successfully", subcategories));
    }

    /**
     * Get all subcategories grouped by category - respects business settings (useSubcategories flag)
     */
    @GetMapping("/by-category")
    public ResponseEntity<ApiResponse<List<CategoryWithSubcategoriesResponse>>> getSubcategoriesByCategory(
            @RequestParam UUID businessId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        log.info("Getting subcategories grouped by category for business - BusinessId: {}", businessId);

        if (!productConditionalService.businessUsesSubcategories(businessId)) {
            log.info("Business {} does not use subcategories - returning empty list", businessId);
            return ResponseEntity.ok(ApiResponse.success("Subcategories are not enabled for this business", Collections.emptyList()));
        }

        List<CategoryWithSubcategoriesResponse> result = subcategoryService.getSubcategoriesGroupedByCategory(businessId, status, search);
        return ResponseEntity.ok(ApiResponse.success("Subcategories retrieved successfully", result));
    }
}
