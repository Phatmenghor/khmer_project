package com.emenu.features.main.service;

import com.emenu.features.main.dto.filter.BrandFilterRequest;
import com.emenu.features.main.dto.filter.BrandAllFilterRequest;
import com.emenu.features.main.dto.request.BrandCreateRequest;
import com.emenu.features.main.dto.response.BrandResponse;
import com.emenu.features.main.dto.response.BrandWithProductCountResponse;
import com.emenu.features.main.dto.update.BrandUpdateRequest;
import com.emenu.shared.dto.PaginationResponse;

import java.util.List;
import java.util.UUID;

import com.emenu.shared.dto.BatchImportResponse;
import jakarta.validation.Valid;

public interface BrandService {
    BrandResponse createBrand(@Valid BrandCreateRequest request);
    BatchImportResponse<BrandResponse> createBrandBatch(List<BrandCreateRequest> requests, String importId);
    PaginationResponse<BrandResponse> getAllBrands(BrandFilterRequest filter);
    PaginationResponse<BrandWithProductCountResponse> getBrandsWithProductCount(BrandFilterRequest filter);
    List<BrandResponse> getAllListBrands(BrandAllFilterRequest filter);
    BrandResponse getBrandById(UUID id);
    BrandResponse updateBrand(UUID id, BrandUpdateRequest request);
    BrandResponse deleteBrand(UUID id);
}
