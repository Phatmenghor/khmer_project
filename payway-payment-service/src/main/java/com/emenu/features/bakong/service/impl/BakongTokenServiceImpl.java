package com.emenu.features.bakong.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.emenu.features.bakong.common.TelegramNotifier;
import com.emenu.features.bakong.config.BakongProperties;
import com.emenu.features.bakong.model.BakongTokenLog;
import com.emenu.features.bakong.repository.BakongTokenRepository;
import com.emenu.features.bakong.service.BakongTokenService;
import com.emenu.features.bakong.common.BakongJwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BakongTokenServiceImpl implements BakongTokenService {

    private final RestClient restClient;
    private final ObjectMapper mapper;
    private final BakongProperties bakongProperties;
    private final TelegramNotifier telegramNotifier;
    private final BakongTokenRepository bakongTokenRepository;

    private String cachedToken;
    private Instant tokenExpiry;

    @Override
    public synchronized String getToken() {
        initializeFromDatabaseIfNeeded();

        if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry)) {
            return cachedToken;
        }

        return renewToken();
    }

    @Override
    public synchronized String renewToken() {
        String email = bakongProperties.getEmail();
        String renewUrl = bakongProperties.getApiUrl() + "/v1/renew_token";
        log.info("Initiating Bakong token renewal for email={} endpoint={}", email, renewUrl);

        try {
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
        } catch (Exception ex) {
            return handleRenewalFailure(ex, renewUrl, email);
        }
    }

    private String handleRenewalFailure(Exception ex, String renewUrl, String email) {
        String cleanMsg = (ex instanceof RestClientResponseException rce)
                ? ("Bakong upstream server returned HTTP " + rce.getStatusCode().value() + " (" + rce.getStatusText() + ")")
                : ex.getMessage();

        log.error("Failed to renew Bakong token: {}", cleanMsg);
        persistTokenLog(null, null, "FAILED", "RENEW_TOKEN_ERROR", cleanMsg);

        Optional<String> dbFallback = findLatestActiveDatabaseToken();
        if (dbFallback.isPresent()) {
            log.warn("Bakong renew_token failed, falling back to latest active token from database table");
            updateCachedToken(dbFallback.get());
            return cachedToken;
        }

        telegramNotifier.notifyIssue("Bakong token renewal failed", renewUrl, Map.of("email", email), ex);
        throw new RuntimeException("Failed to obtain Bakong token: " + cleanMsg, ex);
    }

    private Optional<String> findLatestActiveDatabaseToken() {
        try {
            return bakongTokenRepository.findTopByEmailAndStatusOrderByCreatedAtDesc(bakongProperties.getEmail(), "ACTIVE")
                    .map(BakongTokenLog::getToken)
                    .filter(token -> token != null && !token.isBlank());
        } catch (Exception ex) {
            log.warn("Failed to query fallback token from database: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private void initializeFromDatabaseIfNeeded() {
        if (cachedToken != null && tokenExpiry != null && Instant.now().isBefore(tokenExpiry)) {
            return;
        }

        try {
            bakongTokenRepository.findTopByEmailAndStatusOrderByCreatedAtDesc(bakongProperties.getEmail(), "ACTIVE")
                    .ifPresent(dbToken -> {
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
                    .email(bakongProperties.getEmail())
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
