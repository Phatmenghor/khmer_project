package com.emenu.features.auth.service.social.provider;

import com.emenu.exception.custom.ValidationException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramAuthProvider {

    @Value("${app.social.telegram.bot-token:}")
    private String botToken;

    private final ObjectMapper objectMapper;

    public SocialUserInfo getUserInfo(String authData) {
        log.info("[TG DEBUG] getUserInfo called — raw authData: {}", authData);
        try {
            JsonNode data = objectMapper.readTree(authData);
            log.info("[TG DEBUG] Parsed JSON fields: {}", data.fieldNames());

            String id = data.get("id").asText();
            String username = data.has("username") ? data.get("username").asText() : null;
            String firstName = data.has("first_name") ? data.get("first_name").asText() : null;
            String lastName = data.has("last_name") ? data.get("last_name").asText() : null;
            String photoUrl = data.has("photo_url") ? data.get("photo_url").asText() : null;

            log.info("[TG DEBUG] Extracted — id={}, username={}, firstName={}, lastName={}", id, username, firstName, lastName);

            String hash = data.has("hash") ? data.get("hash").asText() : null;
            log.info("[TG DEBUG] hash present={}, botToken configured={}, botToken length={}",
                    hash != null, !botToken.isEmpty(), botToken.length());

            if (hash != null && !botToken.isEmpty()) {
                log.info("[TG DEBUG] Running hash verification...");
                verifyTelegramAuth(data, hash);
                log.info("[TG DEBUG] Hash verification passed");
            } else {
                log.warn("[TG DEBUG] Telegram hash verification skipped: hash_present={}, bot_token_configured={}",
                        hash != null, !botToken.isEmpty());
            }

            return SocialUserInfo.builder()
                    .id(id)
                    .username(username)
                    .email(null)
                    .firstName(firstName)
                    .lastName(lastName)
                    .photoUrl(photoUrl)
                    .build();
        } catch (Exception e) {
            log.error("[TG DEBUG] getUserInfo failed — error type={}, message={}", e.getClass().getSimpleName(), e.getMessage());
            throw new ValidationException("Invalid Telegram authentication data");
        }
    }

    private void verifyTelegramAuth(JsonNode data, String hash) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] secretKey = digest.digest(botToken.getBytes(StandardCharsets.UTF_8));

            StringBuilder checkString = new StringBuilder();
            data.fields().forEachRemaining(entry -> {
                if (!"hash".equals(entry.getKey())) {
                    checkString.append(entry.getKey()).append("=").append(entry.getValue().asText()).append("\n");
                }
            });

            log.info("[TG DEBUG] Check string for HMAC:\n{}", checkString);

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
            byte[] hmac = mac.doFinal(checkString.toString().getBytes(StandardCharsets.UTF_8));
            String computedHash = bytesToHex(hmac);

            log.info("[TG DEBUG] computed hash={}", computedHash);
            log.info("[TG DEBUG] received hash={}", hash);
            log.info("[TG DEBUG] match={}", computedHash.equals(hash));

            if (!computedHash.equals(hash)) {
                log.error("[TG DEBUG] Hash mismatch — verification failed");
                throw new ValidationException("Invalid Telegram authentication hash");
            }
        } catch (Exception e) {
            log.error("[TG DEBUG] verifyTelegramAuth failed — error type={}, message={}", e.getClass().getSimpleName(), e.getMessage());
            throw new ValidationException("Failed to verify Telegram authentication");
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}
