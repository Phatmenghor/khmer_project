package com.emenu.features.auth.controller;

import com.emenu.features.auth.dto.request.BusinessOwnerCreateRequest;
import com.emenu.features.auth.dto.response.BusinessOwnerCreateResponse;
import com.emenu.features.auth.dto.response.SubdomainResolveResponse;
import com.emenu.features.auth.models.Business;
import com.emenu.features.auth.repository.BusinessRepository;
import com.emenu.features.auth.service.BusinessOwnerService;
import com.emenu.exception.custom.NotFoundException;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Slf4j
public class PublicAuthController {

    private final BusinessOwnerService businessOwnerService;
    private final BusinessRepository businessRepository;

    /**
     * Public endpoint for self-registration of new business owners
     * No authentication required - Anyone can register
     */
    @PostMapping("/register-business-owner")
    public ResponseEntity<ApiResponse<BusinessOwnerCreateResponse>> registerBusinessOwner(
            @Valid @RequestBody BusinessOwnerCreateRequest registerRequest) {
        log.info("Endpoint: public/register-business-owner - business owner registration request received: business_name={}, owner_email={}",
                registerRequest.getBusinessName(), registerRequest.getOwnerEmail());

        BusinessOwnerCreateResponse response = businessOwnerService.createBusinessOwner(registerRequest);

        log.info("Business owner registration completed successfully");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Business owner registration successful. You can now login with your credentials.", response));
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
