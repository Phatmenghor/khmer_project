package com.emenu.features.main.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.BannerFilterRequest;
import com.emenu.features.main.dto.request.BannerCreateRequest;
import com.emenu.features.main.dto.response.BannerResponse;
import com.emenu.features.main.dto.update.BannerUpdateRequest;
import com.emenu.features.main.service.BannerService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.BatchImportResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(@Valid @RequestBody BannerCreateRequest request) {
        BannerResponse banner = bannerService.createBanner(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Banner created successfully", banner));
    }

    @PostMapping("/batch")
    public ResponseEntity<ApiResponse<BatchImportResponse<BannerResponse>>> createBannerBatch(
            @RequestBody List<BannerCreateRequest> requests,
            @RequestParam(required = false) String importId) {
        BatchImportResponse<BannerResponse> response = bannerService.createBannerBatch(requests, importId);
        return ResponseEntity.ok(ApiResponse.success("Batch banner import completed", response));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BannerResponse>>> getAllBanners(@Valid @RequestBody BannerFilterRequest filter) {
        PaginationResponse<BannerResponse> banners = bannerService.getAllBanners(filter);
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BannerResponse>>> getMyBusinessAllBanners(@Valid @RequestBody BannerFilterRequest filter) {
        User currentUser = securityUtils.getCurrentUser();

        if (filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.getBusinessId());
        }

        PaginationResponse<BannerResponse> banners = bannerService.getAllBanners(filter);
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> getBannerById(@PathVariable UUID id) {
        BannerResponse banner = bannerService.getBannerById(id);
        return ResponseEntity.ok(ApiResponse.success("Banner retrieved successfully", banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable UUID id,
            @Valid @RequestBody BannerUpdateRequest request) {
        BannerResponse banner = bannerService.updateBanner(id, request);
        return ResponseEntity.ok(ApiResponse.success("Banner updated successfully", banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> deleteBanner(@PathVariable UUID id) {
        BannerResponse banner = bannerService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted successfully", banner));
    }
}