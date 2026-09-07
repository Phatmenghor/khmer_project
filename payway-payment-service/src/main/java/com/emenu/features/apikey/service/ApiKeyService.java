package com.emenu.features.apikey.service;

import com.emenu.features.apikey.dto.request.ApiKeyCreateRequest;
import com.emenu.features.apikey.dto.response.ApiKeyResponse;

import java.util.List;
import java.util.UUID;

public interface ApiKeyService {

    List<ApiKeyResponse> listApiKeys();

    ApiKeyResponse createApiKey(ApiKeyCreateRequest request);

    void revokeApiKey(UUID id);
}
