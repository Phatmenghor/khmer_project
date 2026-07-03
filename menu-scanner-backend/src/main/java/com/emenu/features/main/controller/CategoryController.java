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
import com.emenu.shared.dto.BatchImportResponse;
import java.util.List;
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

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        log.info("Endpoint: create-category - category creation: name={}", request.getName());
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", category));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchImportResponse<CategoryResponse>>> createCategoryBatch(
            @Valid @RequestBody List<CategoryCreateRequest> requests) {
        log.info("Endpoint: createCategoryBatch - category batch creation: size={}", requests.size());
        BatchImportResponse<CategoryResponse> response = categoryService.createCategoryBatch(requests);
        return ResponseEntity.ok(ApiResponse.success("Batch category import completed", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<CategoryResponse>>> getAllCategories(@Valid @RequestBody CategoryFilterRequest filter) {
        log.info("Endpoint: search-categories - categories retrieval: page={}, size={}, business_id={}", filter.getPageNo(), filter.getPageSize(), filter.getBusinessId());

        PaginationResponse<CategoryResponse> categories = categoryService.getAllCategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<CategoryResponse>>> getMyBusinessAllCategories(@Valid @RequestBody CategoryFilterRequest filter) {
        log.info("Endpoint: search-my-categories - my categories retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());

        UUID businessId = securityUtils.getCurrentUserBusinessId();
        filter.setBusinessId(businessId);

        PaginationResponse<CategoryResponse> categories = categoryService.getAllCategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @PostMapping("/my-business/product/all")
    public ResponseEntity<ApiResponse<PaginationResponse<CategoryWithProductCountResponse>>> getMyBusinessCategoriesWithProductCount(@Valid @RequestBody CategoryFilterRequest filter) {
        log.info("Endpoint: search-my-categories-count - my categories with count retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());

        UUID businessId = securityUtils.getCurrentUserBusinessId();
        filter.setBusinessId(businessId);

        PaginationResponse<CategoryWithProductCountResponse> categories = categoryService.getCategoriesWithProductCount(filter);
        return ResponseEntity.ok(ApiResponse.success("Categories with product count retrieved successfully", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
        log.info("Endpoint: get-category - category detail: id={}", id);
        CategoryResponse category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        log.info("Endpoint: update-category - category update: id={}", id);
        CategoryResponse category = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> deleteCategory(@PathVariable UUID id) {
        log.info("Endpoint: delete-category - category deletion: id={}", id);
        CategoryResponse category = categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", category));
    }
}