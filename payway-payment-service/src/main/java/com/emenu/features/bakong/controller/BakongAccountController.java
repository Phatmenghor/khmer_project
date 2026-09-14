package com.emenu.features.bakong.controller;

import com.emenu.config.OpenApiConfig;
import com.emenu.features.bakong.dto.BakongAccountCreateRequest;
import com.emenu.features.bakong.dto.BakongAccountResponse;
import com.emenu.features.bakong.dto.BakongAccountSearchRequest;
import com.emenu.features.bakong.dto.BakongAccountUpdateRequest;
import com.emenu.features.bakong.service.BakongAccountService;
import com.emenu.shared.dto.ApiResponse;
import com.emenu.shared.dto.PageResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bakong-accounts")
@RequiredArgsConstructor
@Validated
@SecurityRequirement(name = OpenApiConfig.API_KEY_SCHEME)
public class BakongAccountController {

    private final BakongAccountService service;

    @PostMapping("/get-all")
    public ResponseEntity<ApiResponse<PageResponse<BakongAccountResponse>>> getAccountsByBody(@RequestBody(required = false) BakongAccountSearchRequest request) {
        return ResponseEntity.ok(ApiResponse.success(service.getAllAccounts(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BakongAccountResponse>> getAccountDetail(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(ApiResponse.success(service.getAccountById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BakongAccountResponse>> createAccount(@Valid @RequestBody BakongAccountCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Bakong account created successfully", service.createAccount(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BakongAccountResponse>> updateAccount(
            @PathVariable("id") UUID id,
            @Valid @RequestBody BakongAccountUpdateRequest request
    ) {
        request.setId(id);
        return ResponseEntity.ok(ApiResponse.success("Bakong account updated successfully", service.updateAccount(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<BakongAccountResponse>> deleteAccount(@PathVariable("id") UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Bakong account deleted successfully", service.deleteAccount(id)));
    }
}
