package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.BusinessFilterRequest;
import com.emenu.features.auth.dto.request.BusinessCreateRequest;
import com.emenu.features.auth.dto.response.BusinessResponse;
import com.emenu.features.auth.service.BusinessService;
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
@RequestMapping("/api/v1/businesses")
@RequiredArgsConstructor
@Slf4j
public class BusinessController {

    private final BusinessService businessService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessResponse>>> getAllBusinesses(
            @Valid @RequestBody BusinessFilterRequest filterRequestData) {
        log.info("Endpoint: all - businesses list retrieval request received: page={}", filterRequestData.getPageNo());
        PaginationResponse<BusinessResponse> businessListResponse = businessService.getAllBusinesses(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success("Businesses retrieved", businessListResponse));
    }

    @GetMapping("/{businessId}")
    public ResponseEntity<ApiResponse<BusinessResponse>> getBusinessById(@PathVariable UUID businessId) {
        log.info("Endpoint: getBusinessById - business details retrieval request received: business_id={}", businessId);
        BusinessResponse businessResponse = businessService.getBusinessById(businessId);
        return ResponseEntity.ok(ApiResponse.success("Business retrieved", businessResponse));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessResponse>> createBusiness(
            @Valid @RequestBody BusinessCreateRequest createRequestData) {
        log.info("Endpoint: create-business - business creation request received: name={}, owner_id={}", createRequestData.getName(), createRequestData.getOwnerId());
        BusinessResponse createdBusinessResponse = businessService.createBusiness(createRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business created", createdBusinessResponse));
    }

    @PutMapping("/{businessId}")
    public ResponseEntity<ApiResponse<BusinessResponse>> updateBusiness(
            @PathVariable UUID businessId,
            @Valid @RequestBody BusinessCreateRequest updateRequestData) {
        log.info("Endpoint: updateBusiness - business update request received: business_id={}", businessId);
        BusinessResponse updatedBusinessResponse = businessService.updateBusiness(businessId, updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("Business updated", updatedBusinessResponse));
    }

    @DeleteMapping("/{businessId}")
    public ResponseEntity<ApiResponse<Void>> deleteBusiness(@PathVariable UUID businessId) {
        log.info("Endpoint: deleteBusiness - business deletion request received: business_id={}", businessId);
        businessService.deleteBusiness(businessId);
        return ResponseEntity.ok(ApiResponse.success("Business deleted", null));
    }
}