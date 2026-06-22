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
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/keys")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "API Keys", description = "Issue / revoke project API keys — Basic Auth protected")
public class ApiKeyController {

    private final ApiKeyRepository apiKeyRepository;

    @GetMapping
    @Operation(summary = "List all API keys")
    public ResponseEntity<List<ApiKeyResponse>> list() {
        List<ApiKeyResponse> keys = apiKeyRepository.findAll().stream().map(ApiKeyUtil::toResponse).toList();
        log.info("Listed {} API key(s)", keys.size());
        return ResponseEntity.ok(keys);
    }

    @PostMapping
    @Operation(summary = "Create a new API key for a project")
    public ResponseEntity<ApiKeyResponse> create(@Valid @RequestBody ApiKeyCreateRequest req) {
        String rawKey = ApiKeyUtil.generateKey(req.getProjectCode());
        ApiKey saved = apiKeyRepository.save(ApiKey.builder()
                .apiKey(rawKey)
                .projectCode(req.getProjectCode())
                .pathStore(req.getPathStore())
                .label(req.getLabel())
                .active(true)
                .build());
        log.info("Created API key: projectCode=[{}], pathStore=[{}], id=[{}]", saved.getProjectCode(), saved.getPathStore(), saved.getId());
        return ResponseEntity.ok(ApiKeyUtil.toResponse(saved));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Revoke an API key")
    public ResponseEntity<Void> revoke(@PathVariable UUID id) {
        apiKeyRepository.findById(id).ifPresent(k -> {
            k.setActive(false);
            apiKeyRepository.save(k);
            log.info("Revoked API key: id=[{}], projectCode=[{}]", id, k.getProjectCode());
        });
        return ResponseEntity.noContent().build();
    }
}
