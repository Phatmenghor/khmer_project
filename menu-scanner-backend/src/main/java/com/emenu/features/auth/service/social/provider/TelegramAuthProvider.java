package com.emenu.features.auth.service.social.provider;

import com.emenu.exception.custom.ValidationException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

@Service
@RequiredArgsConstructor
@Slf4j
public class TelegramAuthProvider {

    @Value("${app.social.telegram.bot-token:}")
    private String botToken;

    private final ObjectMapper objectMapper;

    public SocialUserInfo getUserInfo(String authData) {
        try {
            JsonNode data = objectMapper.readTree(authData);

            String id = data.get("id").asText();
            String username = data.has("username") ? data.get("username").asText() : null;
            String firstName = data.has("first_name") ? data.get("first_name").asText() : null;
            String lastName = data.has("last_name") ? data.get("last_name").asText() : null;
            String photoUrl = data.has("photo_url") ? data.get("photo_url").asText() : null;

            String hash = data.has("hash") ? data.get("hash").asText() : null;
            if (hash != null && !botToken.isEmpty()) {
                verifyTelegramAuth(data, hash);
            } else {
                log.warn("Telegram hash verification skipped: hash_present={}, bot_token_configured={}",
                        hash != null, !botToken.isEmpty());
            }

            log.info("Telegram auth parsed: id={}, username={}", id, username);

            return SocialUserInfo.builder()
                    .id(id)
                    .username(username)
                    .email(null)
                    .firstName(firstName)
                    .lastName(lastName)
                    .photoUrl(photoUrl)
                    .build();
        } catch (ValidationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Telegram auth data parsing failed: {}", e.getMessage());
            throw new ValidationException("Invalid Telegram authentication data");
        }
    }

    private void verifyTelegramAuth(JsonNode data, String hash) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] secretKey = digest.digest(botToken.getBytes(StandardCharsets.UTF_8));

            // Telegram spec: fields sorted alphabetically, joined by \n, no trailing newline
            List<Map.Entry<String, JsonNode>> fields = new ArrayList<>();
            data.fields().forEachRemaining(fields::add);
            fields.sort(Map.Entry.comparingByKey());

            StringBuilder checkString = new StringBuilder();
            for (Map.Entry<String, JsonNode> entry : fields) {
                if (!"hash".equals(entry.getKey())) {
                    if (checkString.length() > 0) checkString.append("\n");
                    checkString.append(entry.getKey()).append("=").append(entry.getValue().asText());
                }
            }

            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
            byte[] hmac = mac.doFinal(checkString.toString().getBytes(StandardCharsets.UTF_8));
            String computedHash = bytesToHex(hmac);

            if (!computedHash.equals(hash)) {
                log.warn("Telegram hash verification failed: hash mismatch");
                throw new ValidationException("Invalid Telegram authentication hash");
            }
        } catch (ValidationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Telegram hash verification error: {}", e.getMessage());
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
