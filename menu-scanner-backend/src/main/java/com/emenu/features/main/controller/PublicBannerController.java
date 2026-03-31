package com.emenu.features.main.controller;

import com.emenu.features.main.dto.filter.BannerAllFilterRequest;
import com.emenu.features.main.dto.response.BannerResponse;
import com.emenu.features.main.service.BannerService;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/banners")
@RequiredArgsConstructor
public class PublicBannerController {
    private final BannerService bannerService;

    /**
     * Get all public banners with filtering
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getMyBusinessAllBanners(@Valid @RequestBody BannerAllFilterRequest filter) {
        List<BannerResponse> banners = bannerService.getAllItemBanners(filter);
        return ResponseEntity.ok(ApiResponse.success("Banners retrieved successfully", banners));
    }
}
