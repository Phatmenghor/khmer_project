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
import com.emenu.shared.dto.BatchImportResponse;
import java.util.List;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Slf4j
public class BrandController {

    private final BrandService brandService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(@Valid @RequestBody BrandCreateRequest request) {
        log.info("Endpoint: create-brand - brand creation: name={}", request.getName());
        BrandResponse brand = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Brand created successfully", brand));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchImportResponse<BrandResponse>>> createBrandBatch(
            @RequestBody List<BrandCreateRequest> requests,
            @RequestParam(required = false) String importId) {
        log.info("Endpoint: createBrandBatch - brand batch creation: size={}, importId={}", requests.size(), importId);
        BatchImportResponse<BrandResponse> response = brandService.createBrandBatch(requests, importId);
        return ResponseEntity.ok(ApiResponse.success("Batch brand import completed", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandResponse>>> getAllBrands(@Valid @RequestBody BrandFilterRequest filter) {
        log.info("Endpoint: search-brands - brands retrieval: page={}, size={}, business_id={}", filter.getPageNo(), filter.getPageSize(), filter.getBusinessId());
        PaginationResponse<BrandResponse> brands = brandService.getAllBrands(filter);
        return ResponseEntity.ok(ApiResponse.success("Brands retrieved successfully", brands));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandResponse>>> getMyBusinessBrands(@Valid @RequestBody BrandFilterRequest filter) {
        log.info("Endpoint: search-my-brands - my brands retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        User currentUser = securityUtils.getCurrentUser();
        filter.setBusinessId(currentUser.getBusinessId());
        PaginationResponse<BrandResponse> brands = brandService.getAllBrands(filter);
        return ResponseEntity.ok(ApiResponse.success("Business brands retrieved successfully", brands));
    }

    @PostMapping("/my-business/with-product-count")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandWithProductCountResponse>>> getMyBusinessBrandsWithProductCount(@Valid @RequestBody BrandFilterRequest filter) {
        log.info("Endpoint: search-my-brands-count - my brands with count retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        User currentUser = securityUtils.getCurrentUser();
        filter.setBusinessId(currentUser.getBusinessId());
        PaginationResponse<BrandWithProductCountResponse> brands = brandService.getBrandsWithProductCount(filter);
        return ResponseEntity.ok(ApiResponse.success("Business brands with product count retrieved successfully", brands));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable UUID id) {
        log.info("Endpoint: get-brand - brand detail: id={}", id);
        BrandResponse brand = brandService.getBrandById(id);
        return ResponseEntity.ok(ApiResponse.success("Brand retrieved successfully", brand));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable UUID id,
            @Valid @RequestBody BrandUpdateRequest request) {
        log.info("Endpoint: update-brand - brand update: id={}", id);
        BrandResponse brand = brandService.updateBrand(id, request);
        return ResponseEntity.ok(ApiResponse.success("Brand updated successfully", brand));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BrandResponse>> deleteBrand(@PathVariable UUID id) {
        log.info("Endpoint: delete-brand - brand deletion: id={}", id);
        BrandResponse brand = brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully", brand));
    }
}
