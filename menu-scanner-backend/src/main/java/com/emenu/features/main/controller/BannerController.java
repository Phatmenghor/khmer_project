package com.emenu.features.main.controller;

import com.emenu.features.auth.models.User;
import com.emenu.features.main.dto.filter.BannerFilterRequest;
import com.emenu.features.main.dto.request.BannerCreateRequest;
import com.emenu.features.main.dto.response.BannerResponse;
import com.emenu.features.main.dto.update.BannerUpdateRequest;
import com.emenu.features.main.service.BannerService;
import com.emenu.security.SecurityUtils;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
@Slf4j
public class BannerController {

    private final BannerService bannerService;
    private final SecurityUtils securityUtils;

    @PostMapping
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(@Valid @RequestBody BannerCreateRequest request) {
        log.info("Endpoint: create-banner - banner creation: image={}", request.getImageUrl());
        BannerResponse banner = bannerService.createBanner(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Banner created successfully", banner));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BannerResponse>>> getAllBanners(@Valid @RequestBody BannerFilterRequest filter) {
        log.info("Endpoint: search-banners - banners retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        PaginationResponse<BannerResponse> banners = bannerService.getAllBanners(filter);
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }

    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BannerResponse>>> getMyBusinessAllBanners(@Valid @RequestBody BannerFilterRequest filter) {
        log.info("Endpoint: search-my-banners - my banners retrieval: page={}, size={}", filter.getPageNo(), filter.getPageSize());
        User currentUser = securityUtils.getCurrentUser();

        if (filter.getBusinessId() == null) {
            filter.setBusinessId(currentUser.getBusinessId());
        }

        PaginationResponse<BannerResponse> banners = bannerService.getAllBanners(filter);
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> getBannerById(@PathVariable UUID id) {
        log.info("Endpoint: get-banner - banner detail: id={}", id);
        BannerResponse banner = bannerService.getBannerById(id);
        return ResponseEntity.ok(ApiResponse.success("Banner retrieved successfully", banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(
            @PathVariable UUID id,
            @Valid @RequestBody BannerUpdateRequest request) {
        log.info("Endpoint: update-banner - banner update: id={}", id);
        BannerResponse banner = bannerService.updateBanner(id, request);
        return ResponseEntity.ok(ApiResponse.success("Banner updated successfully", banner));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> deleteBanner(@PathVariable UUID id) {
        log.info("Endpoint: delete-banner - banner deletion: id={}", id);
        BannerResponse banner = bannerService.deleteBanner(id);
        return ResponseEntity.ok(ApiResponse.success("Banner deleted successfully", banner));
    }
}