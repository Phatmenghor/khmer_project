package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.request.*;
import com.emenu.features.auth.dto.response.*;
import com.emenu.features.auth.service.AuthService;
import com.emenu.features.auth.service.SocialAuthService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.utils.ClientIpUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final SocialAuthService socialAuthService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequestData) {
        LoginResponse loginResponse = authService.login(loginRequestData);
        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest registrationRequestData) {
        UserResponse registeredUserResponse = authService.registerCustomer(registrationRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer registration successful", registeredUserResponse));
    }

    @PostMapping("/quick-register")
    public ResponseEntity<ApiResponse<UserResponse>> quickRegister(@Valid @RequestBody QuickRegisterRequest registrationRequestData) {
        UserResponse registeredUserResponse = authService.registerQuickUser(registrationRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User account registration successful", registeredUserResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequestData) {
        RefreshTokenResponse refreshedTokenResponse = authService.refreshToken(refreshTokenRequestData);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", refreshedTokenResponse));
    }

    @PostMapping("/social/authenticate")
    public ResponseEntity<ApiResponse<SocialAuthResponse>> authenticateSocial(
            @Valid @RequestBody SocialAuthRequest socialAuthRequestData,
            HttpServletRequest httpRequest) {
        socialAuthRequestData.setIpAddress(ClientIpUtils.getClientIp(httpRequest));
        socialAuthRequestData.setDeviceInfo(ClientIpUtils.getUserAgent(httpRequest));
        SocialAuthResponse socialAuthResponse = socialAuthService.authenticate(socialAuthRequestData);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", socialAuthResponse));
    }

    @GetMapping("/social/sync")
    public ResponseEntity<ApiResponse<SocialSyncResponse>> getSocialSyncStatus() {
        SocialSyncResponse syncStatus = socialAuthService.getSocialSyncStatus();
        return ResponseEntity.ok(ApiResponse.success("Social sync status retrieved", syncStatus));
    }

    @PostMapping("/social/sync")
    public ResponseEntity<ApiResponse<SocialSyncResponse>> syncSocialAccount(
            @Valid @RequestBody SocialAuthRequest syncRequestData) {
        SocialSyncResponse syncResponse = socialAuthService.syncSocialAccount(syncRequestData);
        return ResponseEntity.ok(ApiResponse.success("Social account synced successfully", syncResponse));
    }

    @DeleteMapping("/social/sync/{provider}")
    public ResponseEntity<ApiResponse<SocialSyncResponse>> unsyncSocialAccount(@PathVariable String provider) {
        SocialSyncResponse unsyncResponse = socialAuthService.unsyncSocialAccount(provider);
        return ResponseEntity.ok(ApiResponse.success("Social account unsynced successfully", unsyncResponse));
    }
}