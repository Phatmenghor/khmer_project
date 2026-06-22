package com.emenu.features.apikey.controller;

import com.emenu.features.apikey.dto.request.ApiKeyCreateRequest;
import com.emenu.features.apikey.dto.response.ApiKeyResponse;
import com.emenu.features.apikey.model.ApiKey;
import com.emenu.features.apikey.repository.ApiKeyRepository;
import com.emenu.features.apikey.util.ApiKeyUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
                apiKeyRepository.findAll().stream().map(ApiKeyUtil::toResponse).toList()
        );
    }

    @PostMapping
    @Operation(summary = "Create a new API key with projectCode and optional path")
    public ResponseEntity<ApiKeyResponse> create(@Valid @RequestBody ApiKeyCreateRequest req) {
        String rawKey = ApiKeyUtil.generateKey(req.getProjectCode());
        ApiKey saved = apiKeyRepository.save(ApiKey.builder()
                .apiKey(rawKey)
                .projectCode(req.getProjectCode())
                .path(req.getPath())
                .label(req.getLabel())
                .active(true)
                .build());
        return ResponseEntity.ok(ApiKeyUtil.toResponse(saved));
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
}
