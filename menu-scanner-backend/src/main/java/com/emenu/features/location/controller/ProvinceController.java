package com.emenu.features.location.controller;

import com.emenu.features.location.dto.filter.ProvinceFilterRequest;
import com.emenu.features.location.dto.request.ProvinceRequest;
import com.emenu.features.location.dto.response.ProvinceResponse;
import com.emenu.features.location.service.ProvinceService;
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
@RequestMapping("/api/v1/locations/provinces")
@RequiredArgsConstructor
@Slf4j
public class ProvinceController {

    private final ProvinceService provinceService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<ProvinceResponse>>> getAllProvinces(
            @Valid @RequestBody ProvinceFilterRequest request) {
        log.info("Endpoint: search-provinces - provinces retrieval: page={}, size={}", request.getPageNo(), request.getPageSize());
        PaginationResponse<ProvinceResponse> response = provinceService.getAllProvinces(request);
        return ResponseEntity.ok(ApiResponse.success("Provinces retrieved", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProvinceResponse>> getProvinceById(@PathVariable UUID id) {
        log.info("Endpoint: get-province - province detail: id={}", id);
        ProvinceResponse response = provinceService.getProvinceById(id);
        return ResponseEntity.ok(ApiResponse.success("Province retrieved", response));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<ProvinceResponse>> getProvinceByCode(@PathVariable String code) {
        log.info("Endpoint: get-province-by-code - province detail: code={}", code);
        ProvinceResponse response = provinceService.getProvinceByCode(code);
        return ResponseEntity.ok(ApiResponse.success("Province retrieved", response));
    }

    @GetMapping("/name-en/{nameEn}")
    public ResponseEntity<ApiResponse<ProvinceResponse>> getProvinceByNameEn(@PathVariable String nameEn) {
        log.info("Endpoint: get-province-by-name-en - province detail: nameEn={}", nameEn);
        ProvinceResponse response = provinceService.getProvinceByNameEn(nameEn);
        return ResponseEntity.ok(ApiResponse.success("Province retrieved", response));
    }

    @GetMapping("/name-kh/{nameKh}")
    public ResponseEntity<ApiResponse<ProvinceResponse>> getProvinceByNameKh(@PathVariable String nameKh) {
        log.info("Endpoint: get-province-by-name-kh - province detail: nameKh={}", nameKh);
        ProvinceResponse response = provinceService.getProvinceByNameKh(nameKh);
        return ResponseEntity.ok(ApiResponse.success("Province retrieved", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProvinceResponse>> createProvince(
            @Valid @RequestBody ProvinceRequest request) {
        log.info("Endpoint: create-province - province creation: code={}", request.getProvinceCode());
        ProvinceResponse response = provinceService.createProvince(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Province created", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProvinceResponse>> updateProvince(
            @PathVariable UUID id,
            @Valid @RequestBody ProvinceRequest request) {
        log.info("Endpoint: update-province - province update: id={}", id);
        ProvinceResponse response = provinceService.updateProvince(id, request);
        return ResponseEntity.ok(ApiResponse.success("Province updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProvince(@PathVariable UUID id) {
        log.info("Endpoint: delete-province - province deletion: id={}", id);
        provinceService.deleteProvince(id);
        return ResponseEntity.ok(ApiResponse.success("Province deleted", null));
    }
}
