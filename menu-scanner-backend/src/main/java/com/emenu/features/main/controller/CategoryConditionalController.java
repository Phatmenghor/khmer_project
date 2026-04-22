package com.emenu.features.main.controller;

import com.emenu.features.main.dto.response.CategoryResponse;
import com.emenu.features.main.service.CategoryService;
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
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryConditionalController {

    private final CategoryService categoryService;
    private final ProductConditionalService productConditionalService;

    /**
     * Get categories for a business - respects useCategories setting
     */
    @GetMapping("/business/{businessId}/conditional")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories(
            @PathVariable UUID businessId) {

        log.info("GET /api/v1/categories/business/{}/conditional - Fetching categories", businessId);

        // Check if business uses categories
        if (!productConditionalService.businessUsesCategories(businessId)) {
            log.info("Business {} does not use categories - returning empty list", businessId);
            return ResponseEntity.ok(ApiResponse.success(
                "Categories are not enabled for this business",
                Collections.emptyList()
            ));
        }

        try {
            List<CategoryResponse> categories = categoryService.getCategoriesByBusiness(businessId);
            log.info("Found {} categories for business {}", categories.size(), businessId);

            return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d categories", categories.size()),
                categories
            ));
        } catch (Exception e) {
            log.error("Error fetching categories for business {}: {}", businessId, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Get category by ID - returns null if business doesn't use categories
     */
    @GetMapping("/{id}/business/{businessId}/conditional")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable UUID id,
            @PathVariable UUID businessId) {

        log.info("GET /api/v1/categories/{}/business/{}/conditional", id, businessId);

        // Check if business uses categories
        if (!productConditionalService.businessUsesCategories(businessId)) {
            log.info("Business {} does not use categories - returning not found", businessId);
            return ResponseEntity.ok(ApiResponse.success(
                "Categories are not enabled for this business",
                null
            ));
        }

        try {
            CategoryResponse category = categoryService.getCategoryById(id);
            if (category != null && businessId.equals(category.getBusinessId())) {
                return ResponseEntity.ok(ApiResponse.success(
                    "Category retrieved successfully",
                    category
                ));
            } else {
                return ResponseEntity.ok(ApiResponse.success(
                    "Category not found",
                    null
                ));
            }
        } catch (Exception e) {
            log.error("Error fetching category {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}
