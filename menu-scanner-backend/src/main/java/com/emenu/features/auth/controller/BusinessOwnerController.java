package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.filter.BusinessOwnerFilterRequest;
import com.emenu.features.auth.dto.request.*;
import com.emenu.features.auth.dto.response.BusinessOwnerCreateResponse;
import com.emenu.features.auth.dto.response.BusinessOwnerDetailResponse;
import com.emenu.features.auth.service.BusinessOwnerService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PaginationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/business-owners")
@RequiredArgsConstructor
@Slf4j
public class BusinessOwnerController {

    private final BusinessOwnerService businessOwnerService;

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessOwnerCreateResponse>> createBusinessOwner(
            @Valid @RequestBody BusinessOwnerCreateRequest createRequestData) {
        BusinessOwnerCreateResponse ownerCreateResponse = businessOwnerService.createBusinessOwner(createRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        "Business owner created successfully with " + ownerCreateResponse.getCreatedComponents().size() + " components",
                        ownerCreateResponse
                ));
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessOwnerDetailResponse>>> getAllBusinessOwners(
            @Valid @RequestBody BusinessOwnerFilterRequest filterRequestData) {
        PaginationResponse<BusinessOwnerDetailResponse> ownersResponse = businessOwnerService.getAllBusinessOwners(filterRequestData);
        return ResponseEntity.ok(ApiResponse.success(
                String.format("Found %d business owners (Page %d of %d)",
                        ownersResponse.getTotalElements(), ownersResponse.getPageNo(), ownersResponse.getTotalPages()),
                ownersResponse
        ));
    }

    @GetMapping("/{ownerId}")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> getBusinessOwnerDetail(
            @PathVariable UUID ownerId) {
        BusinessOwnerDetailResponse ownerDetailResponse = businessOwnerService.getBusinessOwnerDetail(ownerId);
        return ResponseEntity.ok(ApiResponse.success(
                "Business owner details retrieved successfully",
                ownerDetailResponse
        ));
    }

    @PostMapping("/{ownerId}/renew")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> renewSubscription(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerSubscriptionRenewRequest renewRequestData) {
        BusinessOwnerDetailResponse renewResponse = businessOwnerService.renewSubscription(ownerId, renewRequestData);
        String message = renewRequestData.getNewPlanId() != null
                ? "Subscription renewed with plan change"
                : "Subscription renewed successfully";
        return ResponseEntity.ok(ApiResponse.success(message, renewResponse));
    }

    @PutMapping("/{ownerId}/change-plan")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> changePlan(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerChangePlanRequest changePlanRequestData) {
        BusinessOwnerDetailResponse planChangeResponse = businessOwnerService.changePlan(ownerId, changePlanRequestData);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan changed successfully", planChangeResponse));
    }

    @PostMapping("/{ownerId}/cancel")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> cancelSubscription(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerSubscriptionCancelRequest cancelRequestData) {
        BusinessOwnerDetailResponse cancelResponse = businessOwnerService.cancelSubscription(ownerId, cancelRequestData);
        String message = cancelRequestData.hasRefundAmount()
                ? "Subscription cancelled with refund processed"
                : "Subscription cancelled successfully";
        return ResponseEntity.ok(ApiResponse.success(message, cancelResponse));
    }

    @DeleteMapping("/{ownerId}")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> deleteBusinessOwner(
            @PathVariable UUID ownerId) {
        BusinessOwnerDetailResponse deleteResponse = businessOwnerService.deleteBusinessOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success(
                "Business owner and related data deleted successfully",
                deleteResponse
        ));
    }
}