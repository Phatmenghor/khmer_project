package com.emenu.features.location.controller;

import com.emenu.features.location.dto.filter.CommuneFilterRequest;
import com.emenu.features.location.dto.filter.DistrictFilterRequest;
import com.emenu.features.location.dto.filter.ProvinceFilterRequest;
import com.emenu.features.location.dto.filter.VillageFilterRequest;
import com.emenu.features.location.dto.response.CommuneResponse;
import com.emenu.features.location.dto.response.DistrictResponse;
import com.emenu.features.location.dto.response.ProvinceResponse;
import com.emenu.features.location.dto.response.VillageResponse;
import com.emenu.features.location.service.CommuneService;
import com.emenu.features.location.service.DistrictService;
import com.emenu.features.location.service.ProvinceService;
import com.emenu.features.location.service.VillageService;
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

@RestController
@RequestMapping("/api/v1/public/locations")
@RequiredArgsConstructor
@Slf4j
public class PublicLocationController {

    private final ProvinceService provinceService;
    private final DistrictService districtService;
    private final CommuneService communeService;
    private final VillageService villageService;

    @PostMapping("/all-province")
    public ResponseEntity<ApiResponse<PaginationResponse<ProvinceResponse>>> getAllProvinces(
            @Valid @RequestBody ProvinceFilterRequest request) {
        log.info("Endpoint: public-search-provinces - provinces retrieval: page={}, size={}", request.getPageNo(), request.getPageSize());
        PaginationResponse<ProvinceResponse> response = provinceService.getAllProvinces(request);
        return ResponseEntity.ok(ApiResponse.success("Provinces retrieved", response));
    }

    @PostMapping("/all-district")
    public ResponseEntity<ApiResponse<PaginationResponse<DistrictResponse>>> getAllDistricts(
            @Valid @RequestBody DistrictFilterRequest request) {
        log.info("Endpoint: public-search-districts - districts retrieval: page={}, size={}", request.getPageNo(), request.getPageSize());
        PaginationResponse<DistrictResponse> response = districtService.getAllDistricts(request);
        return ResponseEntity.ok(ApiResponse.success("Districts retrieved", response));
    }

    @PostMapping("/all-commune")
    public ResponseEntity<ApiResponse<PaginationResponse<CommuneResponse>>> getAllCommunes(
            @Valid @RequestBody CommuneFilterRequest request) {
        log.info("Endpoint: public-search-communes - communes retrieval: page={}, size={}", request.getPageNo(), request.getPageSize());
        PaginationResponse<CommuneResponse> response = communeService.getAllCommunes(request);
        return ResponseEntity.ok(ApiResponse.success("Communes retrieved", response));
    }

    @PostMapping("/all-village")
    public ResponseEntity<ApiResponse<PaginationResponse<VillageResponse>>> getAllVillages(
            @Valid @RequestBody VillageFilterRequest request) {
        log.info("Endpoint: public-search-villages - villages retrieval: page={}, size={}", request.getPageNo(), request.getPageSize());
        PaginationResponse<VillageResponse> response = villageService.getAllVillages(request);
        return ResponseEntity.ok(ApiResponse.success("Villages retrieved", response));
    }
}