package com.emenu.features.location.controller;

import com.emenu.features.location.dto.filter.DistrictFilterRequest;
import com.emenu.features.location.dto.request.DistrictRequest;
import com.emenu.features.location.dto.response.DistrictResponse;
import com.emenu.features.location.service.DistrictService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/locations/districts")
@RequiredArgsConstructor
public class DistrictController {

    private final DistrictService districtService;

    /**
     * Retrieves all districts with pagination and filtering
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<DistrictResponse>>> getAllDistricts(
            @Valid @RequestBody DistrictFilterRequest request) {
        PaginationResponse<DistrictResponse> response = districtService.getAllDistricts(request);
        return ResponseEntity.ok(ApiResponse.success("Districts retrieved", response));
    }

    /**
     * Retrieves a district by its ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DistrictResponse>> getDistrictById(@PathVariable UUID id) {
        DistrictResponse response = districtService.getDistrictById(id);
        return ResponseEntity.ok(ApiResponse.success("District retrieved", response));
    }

    /**
     * Retrieves a district by its code
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<DistrictResponse>> getDistrictByCode(@PathVariable String code) {
        DistrictResponse response = districtService.getDistrictByCode(code);
        return ResponseEntity.ok(ApiResponse.success("District retrieved", response));
    }

    /**
     * Retrieves a district by its English name
     */
    @GetMapping("/name-en/{nameEn}")
    public ResponseEntity<ApiResponse<DistrictResponse>> getDistrictByNameEn(@PathVariable String nameEn) {
        DistrictResponse response = districtService.getDistrictByNameEn(nameEn);
        return ResponseEntity.ok(ApiResponse.success("District retrieved", response));
    }

    /**
     * Retrieves a district by its Khmer name
     */
    @GetMapping("/name-kh/{nameKh}")
    public ResponseEntity<ApiResponse<DistrictResponse>> getDistrictByNameKh(@PathVariable String nameKh) {
        DistrictResponse response = districtService.getDistrictByNameKh(nameKh);
        return ResponseEntity.ok(ApiResponse.success("District retrieved", response));
    }

    /**
     * Creates a new district
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DistrictResponse>> createDistrict(
            @Valid @RequestBody DistrictRequest request) {
        DistrictResponse response = districtService.createDistrict(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("District created", response));
    }

    /**
     * Updates an existing district
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DistrictResponse>> updateDistrict(
            @PathVariable UUID id,
            @Valid @RequestBody DistrictRequest request) {
        DistrictResponse response = districtService.updateDistrict(id, request);
        return ResponseEntity.ok(ApiResponse.success("District updated", response));
    }

    /**
     * Deletes a district by its ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDistrict(@PathVariable UUID id) {
        districtService.deleteDistrict(id);
        return ResponseEntity.ok(ApiResponse.success("District deleted", null));
    }
}