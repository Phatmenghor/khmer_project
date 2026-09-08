package com.emenu.features.bakong.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.emenu.features.bakong.common.TelegramNotifier;
import com.emenu.features.bakong.model.BakongTokenLog;
import com.emenu.features.bakong.repository.BakongTokenRepository;
import com.emenu.features.bakong.service.BakongTokenService;
import com.emenu.features.bakong.common.BakongJwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BakongTokenServiceImpl implements BakongTokenService {

    private final RestClient restClient;
    private final ObjectMapper mapper;
    private final TelegramNotifier telegramNotifier;
    private final BakongTokenRepository bakongTokenRepository;

    @Value("${bakong.base-url}")
    private String baseUrl;

    @Value("${bakong.email}")
    private String email;

    @Value("${bakong.token:}")
    private String configuredToken;

    private String cachedToken;
    private Instant tokenExpiry;

    @Override
    public synchronized String getToken() {
        if (configuredToken != null && !configuredToken.isBlank()) {
            if (cachedToken == null) {
                updateCachedToken(configuredToken);
                log.info("Using configured static Bakong token from application properties");
            }
            if (tokenExpiry == null || Instant.now().isBefore(tokenExpiry)) {
                return cachedToken;
            }
        }

        initializeFromDatabaseIfNeeded();

        if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }

        return renewToken();
    }

    @Override
    public synchronized String renewToken() {
        log.info("Initiating Bakong token renewal for email={}", email);

        try {
            String renewUrl = baseUrl.replaceAll("/+$", "") + "/v1/renew_token";
            log.info("Calling Bakong upstream renew_token endpoint={}", renewUrl);

            String responseBody = restClient.post()
                    .uri(renewUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("email", email))
                    .retrieve()
                    .body(String.class);

            JsonNode root = mapper.readTree(responseBody);
            JsonNode tokenNode = root.path("data").path("token");
            if (tokenNode.isMissingNode() || tokenNode.isNull()) {
                String respMsg = root.path("responseMessage").asText("");
                String codeStr = root.path("responseCode").asText("");
                String detail = !respMsg.isBlank() ? (respMsg + " (code=" + codeStr + ")") : responseBody;
                log.warn("Bakong renew_token response missing token field: {}", responseBody);
                throw new RuntimeException("Bakong token missing in upstream response: " + detail);
            }

            String newToken = tokenNode.asText();
            updateCachedToken(newToken);

            log.info("Bakong token renewed successfully, expiresAt={}", tokenExpiry);
            persistTokenLog(newToken, tokenExpiry, "ACTIVE", "RENEW_TOKEN", null);

            return cachedToken;
        } catch (Exception e) {
            log.error("Failed to renew Bakong token: {}", e.getMessage());
            persistTokenLog(null, null, "FAILED", "RENEW_TOKEN_ERROR", e.getMessage());

            if (configuredToken != null && !configuredToken.isBlank()) {
                log.warn("Bakong renew_token failed, falling back to configured static token");
                updateCachedToken(configuredToken);
                return cachedToken;
            }

            try {
                var dbTokenOpt = bakongTokenRepository.findTopByEmailAndStatusOrderByCreatedAtDesc(email, "ACTIVE");
                if (dbTokenOpt.isPresent() && dbTokenOpt.get().getToken() != null && !dbTokenOpt.get().getToken().isBlank()) {
                    log.warn("Bakong renew_token failed, falling back to latest active token from database table");
                    updateCachedToken(dbTokenOpt.get().getToken());
                    return cachedToken;
                }
            } catch (Exception dbEx) {
                log.warn("Failed to check fallback token from database: {}", dbEx.getMessage());
            }

            telegramNotifier.notifyIssue(
                    "Bakong token renewal failed",
                    baseUrl.replaceAll("/+$", "") + "/v1/renew_token",
                    Map.of("email", email),
                    e
            );
            throw new RuntimeException("Failed to obtain Bakong token: " + e.getMessage(), e);
        }
    }

    private void initializeFromDatabaseIfNeeded() {
        if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry)) {
            return;
        }

        try {
            bakongTokenRepository.findTopByEmailAndStatusOrderByCreatedAtDesc(email, "ACTIVE").ifPresent(dbToken -> {
                if (dbToken.getToken() != null && dbToken.getExpiresAt() != null && Instant.now().isBefore(dbToken.getExpiresAt())) {
                    cachedToken = dbToken.getToken();
                    tokenExpiry = dbToken.getExpiresAt();
                    log.info("Loaded active Bakong token from database table (bakong_token_logs), expiresAt={}", tokenExpiry);
                }
            });
        } catch (Exception ex) {
            log.warn("Failed to load active Bakong token from database table: {}", ex.getMessage());
        }
    }

    private void updateCachedToken(String token) {
        cachedToken = token;
        tokenExpiry = BakongJwtUtils.extractExpiry(token);
    }

    private void persistTokenLog(String token, Instant expiresAt, String status, String action, String errorMessage) {
        try {
            BakongTokenLog tokenLog = BakongTokenLog.builder()
                    .email(email)
                    .token(token)
                    .expiresAt(expiresAt)
                    .status(status)
                    .action(action)
                    .errorMessage(errorMessage)
                    .build();
            bakongTokenRepository.save(tokenLog);
            log.info("Persisted BakongTokenLog entry id={} action={} status={}", tokenLog.getId(), action, status);
        } catch (Exception ex) {
            log.warn("Failed to persist BakongTokenLog entry: {}", ex.getMessage());
        }
    }
}
