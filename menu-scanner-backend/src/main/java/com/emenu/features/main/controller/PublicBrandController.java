package com.emenu.features.main.controller;

import com.emenu.features.main.dto.filter.BrandAllFilterRequest;
import com.emenu.features.main.dto.filter.BrandFilterRequest;
import com.emenu.features.main.dto.response.BrandResponse;
import com.emenu.features.main.service.BrandService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/brands")
@RequiredArgsConstructor
@Slf4j
public class PublicBrandController {

    private final BrandService brandService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BrandResponse>>> getMyBusinessBrands(@Valid @RequestBody BrandFilterRequest filter) {
        log.info("Endpoint: public-search-brands - public brands retrieval: page={}, size={}, business_id={}", filter.getPageNo(), filter.getPageSize(), filter.getBusinessId());
        PaginationResponse<BrandResponse> brands = brandService.getAllBrands(filter);
        return ResponseEntity.ok(ApiResponse.success("Business brands retrieved successfully", brands));
    }

    @PostMapping("/all-data")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAllBrands(@Valid @RequestBody BrandAllFilterRequest filter) {
        log.info("Endpoint: public-search-all-brands - public all brands retrieval: business_id={}", filter.getBusinessId());
        List<BrandResponse> brands = brandService.getAllListBrands(filter);
        return ResponseEntity.ok(ApiResponse.success("Business all brands retrieved successfully", brands));
    }
}
