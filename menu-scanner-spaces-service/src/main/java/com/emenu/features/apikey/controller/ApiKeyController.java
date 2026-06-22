package com.emenu.features.apikey.controller;

import com.emenu.features.apikey.dto.request.ApiKeyCreateRequest;
import com.emenu.features.apikey.dto.response.ApiKeyResponse;
import com.emenu.features.apikey.model.ApiKey;
import com.emenu.features.apikey.repository.ApiKeyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/keys")
@RequiredArgsConstructor
@Tag(name = "API Key Management", description = "Create, list and revoke API keys — each key carries projectCode + path")
public class ApiKeyController {

    private final ApiKeyRepository apiKeyRepository;

    @GetMapping
    @Operation(summary = "List all API keys")
    public ResponseEntity<List<ApiKeyResponse>> list() {
        return ResponseEntity.ok(
                apiKeyRepository.findAll().stream().map(this::toResponse).toList()
        );
    }

    @PostMapping
    @Operation(summary = "Create a new API key with projectCode and optional path")
    public ResponseEntity<ApiKeyResponse> create(@RequestBody ApiKeyCreateRequest req) {
        String rawKey = generateKey(req.getProjectCode());
        ApiKey saved = apiKeyRepository.save(ApiKey.builder()
                .apiKey(rawKey)
                .projectCode(req.getProjectCode())
                .path(req.getPath())
                .label(req.getLabel())
                .active(true)
                .build());
        return ResponseEntity.ok(toResponse(saved));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Revoke (deactivate) an API key")
    public ResponseEntity<Void> revoke(@PathVariable UUID id) {
        apiKeyRepository.findById(id).ifPresent(k -> {
            k.setActive(false);
            apiKeyRepository.save(k);
        });
        return ResponseEntity.noContent().build();
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private String generateKey(String projectCode) {
        byte[] bytes = new byte[24];
        new SecureRandom().nextBytes(bytes);
        String randomPart = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String cleanPrefix = projectCode.toLowerCase().replaceAll("[^a-z0-9]", "");
        return "sk_" + cleanPrefix + "_" + randomPart;
    }

    private ApiKeyResponse toResponse(ApiKey k) {
        return ApiKeyResponse.builder()
                .id(k.getId())
                .apiKey(k.getApiKey())
                .projectCode(k.getProjectCode())
                .path(k.getPath())
                .label(k.getLabel())
                .active(k.isActive())
                .createdAt(k.getCreatedAt())
                .build();
    }
}
