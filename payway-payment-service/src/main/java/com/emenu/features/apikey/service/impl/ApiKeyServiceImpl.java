package com.emenu.features.apikey.service.impl;

import com.emenu.features.apikey.dto.request.ApiKeyCreateRequest;
import com.emenu.features.apikey.dto.response.ApiKeyResponse;
import com.emenu.features.apikey.model.ApiKey;
import com.emenu.features.apikey.repository.ApiKeyRepository;
import com.emenu.features.apikey.service.ApiKeyService;
import com.emenu.features.apikey.util.ApiKeyUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiKeyServiceImpl implements ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;

    @Override
    public List<ApiKeyResponse> listApiKeys() {
        List<ApiKeyResponse> keys = apiKeyRepository.findAll().stream()
                .map(ApiKeyUtil::toResponse)
                .toList();
        log.info("Listed {} API key(s)", keys.size());
        return keys;
    }

    @Override
    public ApiKeyResponse createApiKey(ApiKeyCreateRequest request) {
        String rawKey = ApiKeyUtil.generateKey(request.getProjectCode());

        ApiKey apiKey = ApiKey.builder()
                .projectCode(request.getProjectCode())
                .apiKey(rawKey)
                .label(request.getLabel())
                .active(true)
                .build();

        ApiKey saved = apiKeyRepository.save(apiKey);
        log.info("Created API key id={} for projectCode={}", saved.getId(), saved.getProjectCode());
        return ApiKeyUtil.toResponse(saved);
    }

    @Override
    public void revokeApiKey(UUID id) {
        apiKeyRepository.findById(id).ifPresent(key -> {
            key.setActive(false);
            apiKeyRepository.save(key);
            log.info("Revoked API key: id=[{}]", id);
        });
    }
}
