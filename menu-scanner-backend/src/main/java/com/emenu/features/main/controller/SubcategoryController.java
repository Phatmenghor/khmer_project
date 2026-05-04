package com.emenu.features.main.controller;

import com.emenu.features.main.dto.filter.SubcategoryFilterRequest;
import com.emenu.features.main.dto.request.SubcategoryCreateRequest;
import com.emenu.features.main.dto.response.SubcategoryResponse;
import com.emenu.features.main.dto.update.SubcategoryUpdateRequest;
import com.emenu.features.main.service.SubcategoryService;
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
@RequestMapping("/api/v1/subcategories")
@RequiredArgsConstructor
@Slf4j
public class SubcategoryController {

    private final SubcategoryService subcategoryService;
    private final ProductConditionalService productConditionalService;
    private final SecurityUtils securityUtils;

    /**
     * Create new subcategory (uses current user's business from token)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<SubcategoryResponse>> createSubcategory(@Valid @RequestBody SubcategoryCreateRequest request) {
        log.info("Creating subcategory: {}", request.getName());
        SubcategoryResponse subcategory = subcategoryService.createSubcategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subcategory created successfully", subcategory));
    }

    /**
     * Get all subcategories with filtering - respects business settings (useSubcategories flag)
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<SubcategoryResponse>>> getAllSubcategories(@Valid @RequestBody SubcategoryFilterRequest filter) {
        log.info("Getting all subcategories - BusinessId: {}", filter.getBusinessId());

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
     * Get my business subcategories - respects business settings (useSubcategories flag)
     */
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<SubcategoryResponse>>> getMyBusinessSubcategories(@Valid @RequestBody SubcategoryFilterRequest filter) {
        log.info("Getting subcategories for current user's business");
        UUID businessId = securityUtils.getCurrentUserBusinessId();
        filter.setBusinessId(businessId);

        if (!productConditionalService.businessUsesSubcategories(businessId)) {
            log.info("Business {} does not use subcategories - returning empty list", businessId);
            PaginationResponse<SubcategoryResponse> emptyResponse = new PaginationResponse<>();
            emptyResponse.setContent(Collections.emptyList());
            emptyResponse.setTotalElements(0L);
            emptyResponse.setTotalPages(0);
            return ResponseEntity.ok(ApiResponse.success("Subcategories are not enabled for this business", emptyResponse));
        }

        PaginationResponse<SubcategoryResponse> subcategories = subcategoryService.getAllSubcategories(filter);
        return ResponseEntity.ok(ApiResponse.success("Business subcategories retrieved successfully", subcategories));
    }

    /**
     * Get subcategory by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> getSubcategoryById(@PathVariable UUID id) {
        log.info("Getting subcategory by ID: {}", id);
        SubcategoryResponse subcategory = subcategoryService.getSubcategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Subcategory retrieved successfully", subcategory));
    }

    /**
     * Update subcategory
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> updateSubcategory(
            @PathVariable UUID id,
            @Valid @RequestBody SubcategoryUpdateRequest request) {
        log.info("Updating subcategory: {}", id);
        SubcategoryResponse subcategory = subcategoryService.updateSubcategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subcategory updated successfully", subcategory));
    }

    /**
     * Delete subcategory
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> deleteSubcategory(@PathVariable UUID id) {
        log.info("Deleting subcategory: {}", id);
        SubcategoryResponse subcategory = subcategoryService.deleteSubcategory(id);
        return ResponseEntity.ok(ApiResponse.success("Subcategory deleted successfully", subcategory));
    }
}
