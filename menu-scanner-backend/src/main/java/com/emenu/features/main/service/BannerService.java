package com.emenu.features.main.service;

import com.emenu.features.main.dto.filter.BannerFilterRequest;
import com.emenu.features.main.dto.filter.BannerAllFilterRequest;
import com.emenu.features.main.dto.request.BannerCreateRequest;
import com.emenu.features.main.dto.response.BannerResponse;
import com.emenu.features.main.dto.update.BannerUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

import com.emenu.shared.dto.BatchImportResponse;
import jakarta.validation.Valid;

public interface BannerService {
    
    // CRUD Operations
    BannerResponse createBanner(@Valid BannerCreateRequest request);
    BatchImportResponse<BannerResponse> createBannerBatch(List<BannerCreateRequest> requests, String importId);
    PaginationResponse<BannerResponse> getAllBanners(BannerFilterRequest filter);
    List<BannerResponse> getAllItemBanners(BannerAllFilterRequest filter);
    BannerResponse getBannerById(UUID id);
    BannerResponse updateBanner(UUID id, BannerUpdateRequest request);
    BannerResponse deleteBanner(UUID id);
}