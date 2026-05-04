package com.emenu.features.main.controller;

import com.emenu.features.main.dto.filter.CategoryFilterRequest;
import com.emenu.features.main.dto.request.CategoryCreateRequest;
import com.emenu.features.main.dto.response.CategoryResponse;
import com.emenu.features.main.dto.response.CategoryWithProductCountResponse;
import com.emenu.features.main.dto.update.CategoryUpdateRequest;
import com.emenu.features.main.service.CategoryService;
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
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Slf4j
public class CategoryController {

    private final CategoryService categoryService;
    private final ProductConditionalService productConditionalService;
    private final SecurityUtils securityUtils;

    /**
     * Create new category (uses current user's business from token)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        log.info("Creating category: {}", request.getName());
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", category));
    }

    /**
     * Get all categories with filtering - respects business settings (useCategories flag)
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<CategoryResponse>>> getAllCategories(@Valid @RequestBody CategoryFilterRequest filter) {
        log.info("Getting all categories - BusinessId: {}", filter.getBusinessId());

        // Check if business uses categories
        if (filter.getBusinessId() != null && !productConditionalService.businessUsesCategories(filter.getBusinessId())) {
            log.info("Business {} does not use categories - returning empty list", filter.getBusinessId());
            PaginationResponse<CategoryResponse> emptyResponse = new PaginationResponse<>();
            emptyResponse.setContent(Collections.emptyList());
            emptyResponse.setTotalElements(0L);
            emptyResponse.setTotalPages(0);
            return ResponseEntity.ok(ApiResponse.success("Categories are not enabled for this business", emptyResponse));
        }

        PaginationResponse<CategoryResponse> categories = categoryService.getAllCategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    /**
     * Get all categories with filtering - respects business settings (useCategories flag)
     */
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<CategoryResponse>>> getMyBusinessAllCategories(@Valid @RequestBody CategoryFilterRequest filter) {
        log.info("Getting my categories for current user's business");

        UUID businessId = securityUtils.getCurrentUserBusinessId();
        filter.setBusinessId(businessId);

        // Check if business uses categories
        if (!productConditionalService.businessUsesCategories(businessId)) {
            log.info("Business {} does not use categories - returning empty list", businessId);
            PaginationResponse<CategoryResponse> emptyResponse = new PaginationResponse<>();
            emptyResponse.setContent(Collections.emptyList());
            emptyResponse.setTotalElements(0L);
            emptyResponse.setTotalPages(0);
            return ResponseEntity.ok(ApiResponse.success("Categories are not enabled for this business", emptyResponse));
        }

        PaginationResponse<CategoryResponse> categories = categoryService.getAllCategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    /**
     * Get all categories with product count (for admin page) - extracts businessId from token
     * Includes total product count for each category
     */
    @PostMapping("/my-business/product/all")
    public ResponseEntity<ApiResponse<PaginationResponse<CategoryWithProductCountResponse>>> getMyBusinessCategoriesWithProductCount(@Valid @RequestBody CategoryFilterRequest filter) {
        log.info("Getting my business categories with product count");

            UUID businessId = securityUtils.getCurrentUserBusinessId();
            filter.setBusinessId(businessId);

        PaginationResponse<CategoryWithProductCountResponse> categories = categoryService.getCategoriesWithProductCount(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories with product count retrieved successfully", categories));
    }

    /**
     * Get category by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
        log.info("Getting category by ID: {}", id);
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }

    /**
     * Update category
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        log.info("Updating category: {}", id);
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    /**
     * Delete category
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> deleteCategory(@PathVariable UUID id) {
        log.info("Deleting category: {}", id);
        CategoryResponse category = categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", category));
    }
}