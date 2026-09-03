package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.BusinessOwnerFilterRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerChangePlanRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerCreateRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerPublicRegisterRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerSubscriptionCancelRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerSubscriptionRenewRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerUpdateRequest;
import com.emenu.features.auth.dto.response.BusinessOwnerCreateResponse;
import com.emenu.features.auth.dto.response.BusinessOwnerDetailResponse;
import com.emenu.features.auth.service.BusinessOwnerService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/business-owners")
@RequiredArgsConstructor
public class BusinessOwnerController {

    private final BusinessOwnerService businessOwnerService;

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessOwnerDetailResponse>>> getAllBusinessOwners(
            @RequestBody BusinessOwnerFilterRequest filterRequest) {
        PaginationResponse<BusinessOwnerDetailResponse> response = businessOwnerService.getAllBusinessOwners(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Business owners retrieved successfully", response));
    }

    @GetMapping("/{ownerId}")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> getBusinessOwnerDetail(
            @PathVariable UUID ownerId) {
        BusinessOwnerDetailResponse response = businessOwnerService.getBusinessOwnerDetail(ownerId);
        return ResponseEntity.ok(ApiResponse.success("Business owner details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessOwnerCreateResponse>> createBusinessOwner(
            @Valid @RequestBody BusinessOwnerCreateRequest createRequest) {
        BusinessOwnerCreateResponse response = businessOwnerService.createBusinessOwner(createRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business owner created successfully", response));
    }

    @PutMapping("/{ownerId}")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> updateBusinessOwner(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerUpdateRequest updateRequest) {
        BusinessOwnerDetailResponse response = businessOwnerService.updateBusinessOwner(ownerId, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Business owner updated successfully", response));
    }

    @PutMapping("/{ownerId}/subscription/renew")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> renewSubscription(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerSubscriptionRenewRequest renewRequest) {
        BusinessOwnerDetailResponse response = businessOwnerService.renewSubscription(ownerId, renewRequest);
        return ResponseEntity.ok(ApiResponse.success("Subscription renewed successfully", response));
    }

    @PutMapping("/{ownerId}/subscription/change-plan")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> changePlan(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerChangePlanRequest changePlanRequest) {
        BusinessOwnerDetailResponse response = businessOwnerService.changePlan(ownerId, changePlanRequest);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan changed successfully", response));
    }

    @PutMapping("/{ownerId}/subscription/cancel")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> cancelSubscription(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerSubscriptionCancelRequest cancelRequest) {
        BusinessOwnerDetailResponse response = businessOwnerService.cancelSubscription(ownerId, cancelRequest);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled successfully", response));
    }

    @DeleteMapping("/{ownerId}")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> deleteBusinessOwner(
            @PathVariable UUID ownerId) {
        BusinessOwnerDetailResponse response = businessOwnerService.deleteBusinessOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success("Business owner deleted successfully", response));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<BusinessOwnerCreateResponse>> registerBusinessOwner(
            @Valid @RequestBody BusinessOwnerPublicRegisterRequest registerRequest) {
        BusinessOwnerCreateResponse response = businessOwnerService.registerBusinessOwner(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business owner registered successfully", response));
    }
}
