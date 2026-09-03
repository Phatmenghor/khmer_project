package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.request.BusinessOwnerCreateRequest;
import com.emenu.features.auth.dto.request.QuickRegisterRequest;
import com.emenu.features.auth.dto.response.BusinessOwnerCreateResponse;
import com.emenu.features.auth.dto.response.SubdomainResolveResponse;
import com.emenu.features.auth.dto.response.UserResponse;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.service.AuthService;
import com.emenu.features.auth.service.BusinessOwnerService;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicAuthController {

    private final BusinessOwnerService businessOwnerService;
    private final BusinessRepository businessRepository;
    private final AuthService authService;

    /**
     * Public endpoint for self-registration of new business owners
     * No authentication required - Anyone can register
     */
    @PostMapping("/register-business-owner")
    public ResponseEntity<ApiResponse<BusinessOwnerCreateResponse>> registerBusinessOwner(
            @Valid @RequestBody BusinessOwnerCreateRequest registerRequest) {
        BusinessOwnerCreateResponse response = businessOwnerService.createBusinessOwner(registerRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business owner registration successful. You can now login with your credentials.", response));
    }

    @PostMapping("/quick-register")
    public ResponseEntity<ApiResponse<UserResponse>> quickRegisterPublic(
            @Valid @RequestBody QuickRegisterRequest registrationRequestData) {
        UserResponse response = authService.registerQuickUser(registrationRequestData);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registration successful. You can now log in.", response));
    }

    @GetMapping("/businesses/resolve-subdomain")
    public ResponseEntity<ApiResponse<SubdomainResolveResponse>> resolveSubdomain(
            @RequestParam String subdomain) {
        Business business = businessRepository.findBySubdomainAndIsDeletedFalse(subdomain)
                .orElseThrow(() -> new NotFoundException("No business found for subdomain: " + subdomain));

        SubdomainResolveResponse response = new SubdomainResolveResponse(
                business.getId(), business.getName(), business.getSubdomain());

        return ResponseEntity.ok(ApiResponse.success("Business resolved", response));
    }

    @GetMapping("/businesses/check-subdomain")
    public ResponseEntity<ApiResponse<Boolean>> checkSubdomainAvailable(
            @RequestParam String subdomain) {
        boolean available = !businessRepository.existsBySubdomainAndIsDeletedFalse(subdomain);
        String message = available ? "Subdomain is available" : "Subdomain is already taken";
        return ResponseEntity.ok(ApiResponse.success(message, available));
    }
}
