package com.emenu.features.master.controller;

import com.emenu.shared.dto.ApiResponse;
import com.emenu.features.master.dto.response.PlatformProfileResponse;
import com.emenu.features.master.service.PlatformProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/platform-profile")
@RequiredArgsConstructor
public class PublicPlatformProfileController {

    private final PlatformProfileService platformProfileService;

    @GetMapping
    public ResponseEntity<ApiResponse<PlatformProfileResponse>> getPublicPlatformProfile() {
        PlatformProfileResponse response = platformProfileService.getPlatformProfile();
        return ResponseEntity.ok(ApiResponse.success("Public platform profile retrieved successfully", response));
    }
}
