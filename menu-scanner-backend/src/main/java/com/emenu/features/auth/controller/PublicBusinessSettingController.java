package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.response.BusinessSettingResponse;
import com.emenu.features.auth.service.BusinessSettingService;
import com.emenu.shared.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/business-settings")
@RequiredArgsConstructor
public class PublicBusinessSettingController {

    private final BusinessSettingService businessSettingService;

    @GetMapping("/{businessId}")
    public ResponseEntity<ApiResponse<BusinessSettingResponse>> getBusinessSetting(
            @PathVariable UUID businessId) {
        BusinessSettingResponse publicSettingResponse = businessSettingService.getBusinessSettingByBusinessId(businessId);
        return ResponseEntity.ok(ApiResponse.success("Business setting retrieved", publicSettingResponse));
    }
}
