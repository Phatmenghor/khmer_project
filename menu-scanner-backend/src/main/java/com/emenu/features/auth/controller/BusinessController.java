package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.BusinessFilterRequest;
import com.emenu.features.auth.dto.request.BusinessCreateRequest;
import com.emenu.features.auth.dto.response.BusinessResponse;
import com.emenu.features.auth.service.BusinessService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/businesses")
@RequiredArgsConstructor
public class BusinessController {

    private final BusinessService businessService;

    /**
     * Retrieves all businesses with pagination and filtering
     */
    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessResponse>>> getAllBusinesses(
            @Valid @RequestBody BusinessFilterRequest request) {
        PaginationResponse<BusinessResponse> response = businessService.getAllBusinesses(request);
        return ResponseEntity.ok(ApiResponse.success("Businesses retrieved", response));
    }

    /**
     * Retrieves a business by its ID
     */
    @GetMapping("/{businessId}")
    public ResponseEntity<ApiResponse<BusinessResponse>> getBusinessById(@PathVariable UUID businessId) {
        BusinessResponse response = businessService.getBusinessById(businessId);
        return ResponseEntity.ok(ApiResponse.success("Business retrieved", response));
    }

    /**
     * Creates a new business
     */
    @PostMapping
    public ResponseEntity<ApiResponse<BusinessResponse>> createBusiness(
            @Valid @RequestBody BusinessCreateRequest request) {
        BusinessResponse response = businessService.createBusiness(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business created", response));
    }

    /**
     * Updates an existing business
     */
    @PutMapping("/{businessId}")
    public ResponseEntity<ApiResponse<BusinessResponse>> updateBusiness(
            @PathVariable UUID businessId,
            @Valid @RequestBody BusinessCreateRequest request) {
        BusinessResponse response = businessService.updateBusiness(businessId, request);
        return ResponseEntity.ok(ApiResponse.success("Business updated", response));
    }

    /**
     * Deletes a business by its ID
     */
    @DeleteMapping("/{businessId}")
    public ResponseEntity<ApiResponse<Void>> deleteBusiness(@PathVariable UUID businessId) {
        businessService.deleteBusiness(businessId);
        return ResponseEntity.ok(ApiResponse.success("Business deleted", null));
    }
}