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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final SocialAuthService socialAuthService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequestData) {
        log.info("Endpoint: login - user login request received: identifier={}", loginRequestData.getUserIdentifier());
        LoginResponse loginResponse = authService.login(loginRequestData);
        return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
    }

    @GetMapping("/business-token")
    public ResponseEntity<String> tokenBusiness() {
        String token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJwaGF0bWVuZ2hvcjIwQGdtYWlsLmNvbSIsInJvbGVzIjoiQlVTSU5FU1NfT1dORVIiLCJ0eXBlIjoiYWNjZXNzIiwidXNlclR5cGUiOiJCVVNJTkVTU19VU0VSIiwiaWF0IjoxNzc5NDM4NDU4LCJleHAiOjE3ODk0Mzg0NTh9.QRca-X421eDANkMi0IM0j3kLhzjQectM69xEfG0Zcdj4B4B4FNg7AXZrGVr5cKobfLzqwcHbWmRgHN3P6AuUcg";
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest registrationRequestData) {
        log.info("Endpoint: register - customer registration request received: email={}, user_type={}", registrationRequestData.getEmail(), registrationRequestData.getUserType());
        UserResponse registeredUserResponse = authService.registerCustomer(registrationRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer registration successful", registeredUserResponse));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequestData) {
        log.info("Endpoint: refresh - token refresh request received");
        RefreshTokenResponse refreshedTokenResponse = authService.refreshToken(refreshTokenRequestData);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", refreshedTokenResponse));
    }

    @PostMapping("/social/authenticate")
    public ResponseEntity<ApiResponse<SocialAuthResponse>> authenticateSocial(
            @Valid @RequestBody SocialAuthRequest socialAuthRequestData,
            HttpServletRequest httpRequest) {
        log.info("Endpoint: social/authenticate - social authentication request received: provider={}", socialAuthRequestData.getProvider());
        socialAuthRequestData.setIpAddress(ClientIpUtils.getClientIp(httpRequest));
        socialAuthRequestData.setDeviceInfo(ClientIpUtils.getUserAgent(httpRequest));
        SocialAuthResponse socialAuthResponse = socialAuthService.authenticate(socialAuthRequestData);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", socialAuthResponse));
    }

    @GetMapping("/social/sync")
    public ResponseEntity<ApiResponse<SocialSyncResponse>> getSocialSyncStatus() {
        log.info("Endpoint: GET social/sync - retrieving social sync status");
        SocialSyncResponse syncStatus = socialAuthService.getSocialSyncStatus();
        return ResponseEntity.ok(ApiResponse.success("Social sync status retrieved", syncStatus));
    }

    @PostMapping("/social/sync")
    public ResponseEntity<ApiResponse<SocialSyncResponse>> syncSocialAccount(
            @Valid @RequestBody SocialAuthRequest syncRequestData) {
        log.info("Endpoint: social/sync - social account sync request received: provider={}", syncRequestData.getProvider());
        SocialSyncResponse syncResponse = socialAuthService.syncSocialAccount(syncRequestData);
        return ResponseEntity.ok(ApiResponse.success("Social account synced successfully", syncResponse));
    }

    @DeleteMapping("/social/sync/{provider}")
    public ResponseEntity<ApiResponse<SocialSyncResponse>> unsyncSocialAccount(@PathVariable String provider) {
        log.info("Endpoint: social/sync - social account unsync request received: provider={}", provider);
        SocialSyncResponse unsyncResponse = socialAuthService.unsyncSocialAccount(provider);
        return ResponseEntity.ok(ApiResponse.success("Social account unsynced successfully", unsyncResponse));
    }

}