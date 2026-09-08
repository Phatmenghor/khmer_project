package com.emenu.features.apikey.service.impl;

import com.emenu.config.exception.ResourceNotFoundException;
import com.emenu.features.apikey.dto.request.ApiKeyCreateRequest;
import com.emenu.features.apikey.dto.response.ApiKeyResponse;
import com.emenu.features.apikey.model.ApiKey;
import com.emenu.features.apikey.repository.ApiKeyRepository;
import com.emenu.features.apikey.service.ApiKeyService;
import com.emenu.features.apikey.util.ApiKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiKeyServiceImpl implements ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ApiKeyResponse> listApiKeys() {
        List<ApiKeyResponse> keys = apiKeyRepository.findAll().stream()
                .map(ApiKeyUtil::toResponse)
                .toList();
        log.info("Listed {} API key(s)", keys.size());
        return keys;
    }

    @Override
    @Transactional
    public ApiKeyResponse createApiKey(ApiKeyCreateRequest request) {
        if (request == null || request.getLabel() == null || request.getLabel().isBlank()) {
            throw new IllegalArgumentException("Label is required for API key creation");
        }

        String projectCode = request.getLabel().trim();
        String rawKey = ApiKeyUtil.generateKey(projectCode);

        ApiKey apiKey = ApiKey.builder()
                .projectCode(projectCode)
                .apiKey(rawKey)
                .label(request.getLabel().trim())
                .active(true)
                .build();

        ApiKey saved = apiKeyRepository.save(apiKey);
        log.info("Created API key id={} for projectCode={}", saved.getId(), saved.getProjectCode());
        return ApiKeyUtil.toResponse(saved);
    }

    @Override
    @Transactional
    public void revokeApiKey(UUID id) {
        ApiKey apiKey = apiKeyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("API key not found with id: " + id));

        apiKey.setActive(false);
        apiKeyRepository.save(apiKey);
        log.info("Revoked API key: id=[{}]", id);
    }
}
