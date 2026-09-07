package com.emenu.features.bakong.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Slf4j
public final class BakongJwtUtils {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    private BakongJwtUtils() {
    }

    public static Instant extractExpiry(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token string must not be empty");
        }

        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }

            String payload = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            JsonNode payloadNode = MAPPER.readTree(payload);
            long exp = payloadNode.path("exp").asLong(0L);
            if (exp <= 0) {
                throw new IllegalArgumentException("JWT exp claim is missing");
            }

            return Instant.ofEpochSecond(exp);
        } catch (Exception ex) {
            log.error("Failed to parse JWT token expiration: {}", ex.getMessage());
            throw new IllegalArgumentException("Invalid JWT token payload", ex);
        }
    }
}
