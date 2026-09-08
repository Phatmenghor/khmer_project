package com.emenu.features.bakong.common;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.time.Instant;
import java.util.Base64;

@Slf4j
public final class BakongJwtUtils {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    private BakongJwtUtils() {
    }

    public static long extractExpirationTimestamp(String jwtToken) {
        if (jwtToken == null || jwtToken.isBlank()) {
            return 0L;
        }

        try {
            String[] parts = jwtToken.split("\\.");
            if (parts.length < 2) {
                return 0L;
            }

            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
            JsonNode jsonNode = objectMapper.readTree(payloadJson);
            if (jsonNode.has("exp")) {
                return jsonNode.get("exp").asLong();
            }
        } catch (Exception e) {
            log.warn("Failed to parse JWT token expiration: {}", e.getMessage());
        }

        return 0L;
    }

    public static Instant extractExpiry(String jwtToken) {
        long exp = extractExpirationTimestamp(jwtToken);
        if (exp == 0L) {
            return Instant.now();
        }
        return Instant.ofEpochSecond(exp);
    }

    public static boolean isTokenExpired(String jwtToken, long bufferSeconds) {
        long exp = extractExpirationTimestamp(jwtToken);
        if (exp == 0L) {
            return true;
        }

        long now = System.currentTimeMillis() / 1000;
        return (exp - bufferSeconds) <= now;
    }
}
