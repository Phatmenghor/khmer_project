package com.emenu.features.auth.controller;

import com.emenu.exception.custom.ValidationException;
import com.emenu.features.auth.dto.filter.BusinessOwnerFilterRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerChangePlanRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerCreateRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerSubscriptionCancelRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerSubscriptionRenewRequest;
import com.emenu.features.auth.dto.request.BusinessOwnerUpdateRequest;
import com.emenu.features.auth.dto.response.BusinessOwnerCreateResponse;
import com.emenu.features.auth.dto.response.BusinessOwnerDetailResponse;
import com.emenu.features.auth.service.BusinessOwnerService;
import com.emenu.security.SecurityUtils;
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
@RequestMapping("/api/v1/business-owners")
@RequiredArgsConstructor
@Slf4j
public class BusinessOwnerController {

    private final BusinessOwnerService businessOwnerService;
    private final SecurityUtils securityUtils;

    private void requireAuthentication() {
        if (securityUtils.getCurrentUserOptional().isEmpty()) {
            throw new ValidationException("Authentication required");
        }
    }

    @PostMapping("/all")
    public ResponseEntity<ApiResponse<PaginationResponse<BusinessOwnerDetailResponse>>> getAllBusinessOwners(
            @RequestBody BusinessOwnerFilterRequest filterRequest) {
        requireAuthentication();
        log.info("Endpoint: business-owners/all - paginated list request received");
        PaginationResponse<BusinessOwnerDetailResponse> response = businessOwnerService.getAllBusinessOwners(filterRequest);
        return ResponseEntity.ok(ApiResponse.success("Business owners retrieved successfully", response));
    }

    @GetMapping("/{ownerId}")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> getBusinessOwnerDetail(
            @PathVariable UUID ownerId) {
        requireAuthentication();
        log.info("Endpoint: business-owners/{} - detail request received", ownerId);
        BusinessOwnerDetailResponse response = businessOwnerService.getBusinessOwnerDetail(ownerId);
        return ResponseEntity.ok(ApiResponse.success("Business owner details retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessOwnerCreateResponse>> createBusinessOwner(
            @Valid @RequestBody BusinessOwnerCreateRequest createRequest) {
        requireAuthentication();
        log.info("Endpoint: business-owners - create request received: business_name={}, owner_email={}",
                createRequest.getBusinessName(), createRequest.getOwnerEmail());
        BusinessOwnerCreateResponse response = businessOwnerService.createBusinessOwner(createRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business owner created successfully", response));
    }

    @PutMapping("/{ownerId}")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> updateBusinessOwner(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerUpdateRequest updateRequest) {
        requireAuthentication();
        log.info("Endpoint: business-owners/{} - update request received", ownerId);
        BusinessOwnerDetailResponse response = businessOwnerService.updateBusinessOwner(ownerId, updateRequest);
        return ResponseEntity.ok(ApiResponse.success("Business owner updated successfully", response));
    }

    @PutMapping("/{ownerId}/subscription/renew")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> renewSubscription(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerSubscriptionRenewRequest renewRequest) {
        requireAuthentication();
        log.info("Endpoint: business-owners/{}/subscription/renew - renew request received", ownerId);
        BusinessOwnerDetailResponse response = businessOwnerService.renewSubscription(ownerId, renewRequest);
        return ResponseEntity.ok(ApiResponse.success("Subscription renewed successfully", response));
    }

    @PutMapping("/{ownerId}/subscription/change-plan")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> changePlan(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerChangePlanRequest changePlanRequest) {
        requireAuthentication();
        log.info("Endpoint: business-owners/{}/subscription/change-plan - change plan request received", ownerId);
        BusinessOwnerDetailResponse response = businessOwnerService.changePlan(ownerId, changePlanRequest);
        return ResponseEntity.ok(ApiResponse.success("Subscription plan changed successfully", response));
    }

    @PutMapping("/{ownerId}/subscription/cancel")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> cancelSubscription(
            @PathVariable UUID ownerId,
            @Valid @RequestBody BusinessOwnerSubscriptionCancelRequest cancelRequest) {
        requireAuthentication();
        log.info("Endpoint: business-owners/{}/subscription/cancel - cancel request received", ownerId);
        BusinessOwnerDetailResponse response = businessOwnerService.cancelSubscription(ownerId, cancelRequest);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled successfully", response));
    }

    @DeleteMapping("/{ownerId}")
    public ResponseEntity<ApiResponse<BusinessOwnerDetailResponse>> deleteBusinessOwner(
            @PathVariable UUID ownerId) {
        requireAuthentication();
        log.info("Endpoint: business-owners/{} - delete request received", ownerId);
        BusinessOwnerDetailResponse response = businessOwnerService.deleteBusinessOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success("Business owner deleted successfully", response));
    }
}
