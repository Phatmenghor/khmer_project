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

    /**
     * Authenticates a user with their credentials
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * Registers a new customer account
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = authService.registerCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer registration successful", response));
    }

    /**
     * Refresh access token using refresh token
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        RefreshTokenResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/social/authenticate")
    public ResponseEntity<ApiResponse<SocialAuthResponse>> authenticateSocial(
            @Valid @RequestBody SocialAuthRequest request,
            HttpServletRequest httpRequest) {

        request.setIpAddress(ClientIpUtils.getClientIp(httpRequest));
        request.setDeviceInfo(ClientIpUtils.getUserAgent(httpRequest));

        SocialAuthResponse response = socialAuthService.authenticate(request);
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", response));
    }

    @PostMapping("/social/sync")
    public ResponseEntity<ApiResponse<SocialSyncResponse>> syncSocialAccount(
            @Valid @RequestBody SocialAuthRequest request) {

        SocialSyncResponse response = socialAuthService.syncSocialAccount(request);

                response.getProvider(), response.getTelegramId(), response.getTelegramUsername());
        return ResponseEntity.ok(ApiResponse.success("Social account synced successfully", response));
    }

    @DeleteMapping("/social/sync/{provider}")
    public ResponseEntity<ApiResponse<SocialSyncResponse>> unsyncSocialAccount(@PathVariable String provider) {

        SocialSyncResponse response = socialAuthService.unsyncSocialAccount(provider);

        return ResponseEntity.ok(ApiResponse.success("Social account unsynced successfully", response));
    }

}