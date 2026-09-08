package com.emenu.features.apikey.controller;

import com.emenu.features.apikey.dto.request.ApiKeyCreateRequest;
import com.emenu.features.apikey.dto.response.ApiKeyResponse;
import com.emenu.features.apikey.service.ApiKeyService;
import com.emenu.shared.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/keys")
@RequiredArgsConstructor
@Validated
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ApiKeyResponse>>> listApiKeys() {
        return ResponseEntity.ok(ApiResponse.success("API keys retrieved successfully", apiKeyService.listApiKeys()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ApiKeyResponse>> createApiKey(@Valid @RequestBody ApiKeyCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("API key created successfully", apiKeyService.createApiKey(request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeApiKey(@PathVariable @NotNull(message = "API key ID is required") UUID id) {
        apiKeyService.revokeApiKey(id);
        return ResponseEntity.ok(ApiResponse.success("API key revoked successfully", null));
    }
}
