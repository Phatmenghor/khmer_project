package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.service.BusinessSettingService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Public Business Settings Controller
 * Provides public access to business settings (theme colors, logo, business name)
 * No authentication required for GET endpoints
 */
@RestController
@RequestMapping("/api/v1/public/business-settings")
@RequiredArgsConstructor
@Slf4j
public class PublicBusinessSettingController {

    private final BusinessSettingService businessSettingService;

    /**
     * Retrieves business settings for a specific business (PUBLIC)
     * Used for fetching theme colors, logo, and business name
     * No authentication required
     * GET /api/v1/public/business-settings/{businessId}
     */
    @GetMapping("/{businessId}")
    public ResponseEntity<ApiResponse<BusinessSettingResponse>> getBusinessSetting(
            @PathVariable UUID businessId) {
        log.info("Get public business setting for: {}", businessId);
        BusinessSettingResponse response = businessSettingService.getBusinessSettingByBusinessId(businessId);
        return ResponseEntity.ok(ApiResponse.success("Business setting retrieved", response));
    }
}
