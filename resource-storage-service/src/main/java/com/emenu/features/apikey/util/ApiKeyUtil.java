package com.emenu.features.apikey.util;

import com.emenu.features.apikey.dto.response.ApiKeyResponse;
import com.emenu.features.apikey.model.ApiKey;

import java.security.SecureRandom;
import java.util.Base64;

public final class ApiKeyUtil {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private ApiKeyUtil() {}

    public static String generateKey(String projectCode) {
        byte[] bytes = new byte[24];
        SECURE_RANDOM.nextBytes(bytes);
        String randomPart = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String cleanPrefix = projectCode.toLowerCase().replaceAll("[^a-z0-9]", "");
        return "sk_" + cleanPrefix + "_" + randomPart;
    }

    public static ApiKeyResponse toResponse(ApiKey k) {
        return ApiKeyResponse.builder()
                .id(k.getId())
                .apiKey(k.getApiKey())
                .projectCode(k.getProjectCode())
                .pathStore(k.getPathStore())
                .label(k.getLabel())
                .active(k.isActive())
                .createdAt(k.getCreatedAt())
                .build();
    }
}
