package com.emenu.features.apikey.controller;

import com.emenu.features.apikey.dto.request.ApiKeyCreateRequest;
import com.emenu.features.apikey.dto.response.ApiKeyResponse;
import com.emenu.features.apikey.model.ApiKey;
import com.emenu.features.apikey.repository.ApiKeyRepository;
import com.emenu.features.apikey.util.ApiKeyUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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
@Slf4j
public class ApiKeyController {

    private final ApiKeyRepository apiKeyRepository;

    @GetMapping
    public ResponseEntity<List<ApiKeyResponse>> list() {
        List<ApiKeyResponse> keys = apiKeyRepository.findAll().stream().map(ApiKeyUtil::toResponse).toList();
        log.info("Listed {} API key(s)", keys.size());
        return ResponseEntity.ok(keys);
    }

    @PostMapping
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
    public ResponseEntity<Void> revoke(@PathVariable UUID id) {
        apiKeyRepository.findById(id).ifPresent(k -> {
            k.setActive(false);
            apiKeyRepository.save(k);
            log.info("Revoked API key: id=[{}]", id);
        });
        return ResponseEntity.noContent().build();
    }
}
