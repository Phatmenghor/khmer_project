package com.emenu.features.master.controller;

import com.emenu.features.master.dto.request.PlatformProfileRequest;
import com.emenu.features.master.dto.response.PlatformProfileResponse;
import com.emenu.features.master.service.PlatformProfileService;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/platform-profile")
@RequiredArgsConstructor
public class AdminPlatformProfileController {

    private final PlatformProfileService platformProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<PlatformProfileResponse>> getPlatformProfile() {
        PlatformProfileResponse response = platformProfileService.getPlatformProfile();
        return ResponseEntity.ok(ApiResponse.success("Platform profile retrieved successfully", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<PlatformProfileResponse>> updatePlatformProfile(
            @Valid @RequestBody PlatformProfileRequest request) {
        PlatformProfileResponse response = platformProfileService.updatePlatformProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Platform profile updated successfully", response));
    }
}
