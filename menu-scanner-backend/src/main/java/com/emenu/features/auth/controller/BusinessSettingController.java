package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.request.BusinessSettingCreateRequest;
import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.dto.update.BusinessSettingUpdateRequest;
import com.emenu.features.auth.service.BusinessSettingService;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/business-settings")
@RequiredArgsConstructor
@Slf4j
public class BusinessSettingController {

    private final BusinessSettingService businessSettingService;

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<BusinessSettingResponse>> getCurrentBusinessSetting() {
        log.info("Endpoint: current - current business setting retrieval request received");
        BusinessSettingResponse currentSettingResponse = businessSettingService.getCurrentBusinessSetting();
        return ResponseEntity.ok(ApiResponse.success("Business setting retrieved", currentSettingResponse));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<BusinessSettingResponse>> updateCurrentBusinessSetting(
            @Valid @RequestBody BusinessSettingUpdateRequest updateRequestData) {
        log.info("Endpoint: updateCurrentBusinessSetting - current business setting update request received");
        BusinessSettingResponse updatedSettingResponse = businessSettingService.updateCurrentBusinessSetting(updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("Business setting updated", updatedSettingResponse));
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<BusinessSettingResponse>> getBusinessSettingByBusinessId(
            @PathVariable UUID businessId) {
        log.info("Endpoint: getBusinessSettingByBusinessId - business setting retrieval request received: business_id={}", businessId);
        BusinessSettingResponse settingResponse = businessSettingService.getBusinessSettingByBusinessId(businessId);
        return ResponseEntity.ok(ApiResponse.success("Business setting retrieved", settingResponse));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BusinessSettingResponse>> createBusinessSetting(
            @Valid @RequestBody BusinessSettingCreateRequest createRequestData) {
        log.info("Endpoint: createBusinessSetting - business setting creation request received: business_id={}", createRequestData.getBusinessId());
        BusinessSettingResponse createdSettingResponse = businessSettingService.createBusinessSetting(createRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business setting created", createdSettingResponse));
    }

    @PutMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<BusinessSettingResponse>> updateBusinessSetting(
            @PathVariable UUID businessId,
            @Valid @RequestBody BusinessSettingUpdateRequest updateRequestData) {
        log.info("Endpoint: updateBusinessSetting - business setting update request received: business_id={}", businessId);
        BusinessSettingResponse updatedResponse = businessSettingService.updateBusinessSetting(businessId, updateRequestData);
        return ResponseEntity.ok(ApiResponse.success("Business setting updated", updatedResponse));
    }

    @DeleteMapping("/business/{businessId}")
    public ResponseEntity<ApiResponse<Void>> deleteBusinessSetting(@PathVariable UUID businessId) {
        log.info("Endpoint: deleteBusinessSetting - business setting deletion request received: business_id={}", businessId);
        businessSettingService.deleteBusinessSetting(businessId);
        return ResponseEntity.ok(ApiResponse.success("Business setting deleted", null));
    }
}