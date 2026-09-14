package com.emenu.features.bakong.service.impl;

import com.emenu.constant.BakongApiConstants;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.emenu.features.bakong.notifier.TelegramNotifier;
import com.emenu.config.BakongProperties;
import com.emenu.features.bakong.dto.BakongMonitoringStatusResponse.TokenStatusInfo;
import com.emenu.features.bakong.model.BakongConfig;
import com.emenu.features.bakong.model.BakongTokenLog;
import com.emenu.features.bakong.repository.BakongConfigRepository;
import com.emenu.features.bakong.repository.BakongTokenRepository;
import com.emenu.features.bakong.service.BakongTokenService;
import com.emenu.util.BakongJwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class BakongTokenServiceImpl implements BakongTokenService {

    private static final Duration SAFETY_BUFFER = Duration.ofMinutes(5);

    private final RestClient restClient;
    private final ObjectMapper mapper;
    private final BakongProperties bakongProperties;
    private final BakongConfigRepository bakongConfigRepository;
    private final TelegramNotifier telegramNotifier;
    private final BakongTokenRepository bakongTokenRepository;

    private final Map<String, CachedTokenInfo> tokenCacheMap = new ConcurrentHashMap<>();

    private static class CachedTokenInfo {
        final String token;
        final Instant expiry;

        CachedTokenInfo(String token, Instant expiry) {
            this.token = token;
            this.expiry = expiry;
        }

        boolean isValid() {
            return token != null && !token.isBlank() && expiry != null && Instant.now().plus(SAFETY_BUFFER).isBefore(expiry);
        }
    }

    private String getBakongEmail() {
        return bakongConfigRepository.findTopByEnabledTrue()
                .map(BakongConfig::getEmail)
                .orElseGet(bakongProperties::getEmail);
    }

    private String getBakongApiUrl() {
        return bakongConfigRepository.findTopByEnabledTrue()
                .map(BakongConfig::getApiUrl)
                .orElseGet(bakongProperties::getApiUrl);
    }

    @Override
    public synchronized String getToken() {
        return getTokenForEmail(getBakongEmail());
    }

    @Override
    public synchronized String getTokenForEmail(String email) {
        if (email == null || email.isBlank()) {
            email = getBakongEmail();
        }

        // 1. Check in-memory cached token for email
        CachedTokenInfo cached = tokenCacheMap.get(email);
        if (cached != null && cached.isValid()) {
            log.debug("Reusing valid in-memory Bakong token for email={} (expiresAt={})", email, cached.expiry);
            return cached.token;
        }

        // 2. Try loading active valid token from database table for email
        initializeFromDatabaseIfNeeded(email);

        cached = tokenCacheMap.get(email);
        if (cached != null && cached.isValid()) {
            log.info("Reusing active database-loaded Bakong token for email={} (expiresAt={})", email, cached.expiry);
            return cached.token;
        }

        // 3. Renew token upstream if token is expired or not found
        return renewTokenForEmail(email);
    }

    @Override
    public synchronized String renewToken() {
        return renewTokenForEmail(getBakongEmail());
    }

    @Override
    public synchronized String renewTokenForEmail(String email) {
        if (email == null || email.isBlank()) {
            email = getBakongEmail();
        }

        String renewUrl = getBakongApiUrl() + BakongApiConstants.RENEW_TOKEN_ENDPOINT;
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
                log.warn("Bakong renew_token response missing token field for email={}: {}", email, responseBody);
                throw new RuntimeException("Bakong token missing in upstream response: " + detail);
            }

            String newToken = tokenNode.asText();
            Instant expiry = BakongJwtUtils.extractExpiry(newToken);
            tokenCacheMap.put(email, new CachedTokenInfo(newToken, expiry));

            log.info("Bakong token renewed successfully for email={}, expiresAt={}", email, expiry);
            persistTokenLog(email, newToken, expiry, "ACTIVE", "RENEW_TOKEN", null);

            return newToken;
        } catch (Exception ex) {
            return handleRenewalFailure(ex, renewUrl, email);
        }
    }

    private String handleRenewalFailure(Exception ex, String renewUrl, String email) {
        String cleanMsg = (ex instanceof RestClientResponseException rce)
                ? ("Bakong upstream server returned HTTP " + rce.getStatusCode().value() + " (" + rce.getStatusText() + ")")
                : ex.getMessage();

        log.error("Failed to renew Bakong token for email={}: {}", email, cleanMsg);
        persistTokenLog(email, null, null, "FAILED", "RENEW_TOKEN_ERROR", cleanMsg);

        Optional<String> dbFallback = findLatestActiveDatabaseToken(email);
        if (dbFallback.isPresent()) {
            log.warn("Bakong renew_token failed for email={}, falling back to latest active token from database table", email);
            String fallbackToken = dbFallback.get();
            Instant expiry = BakongJwtUtils.extractExpiry(fallbackToken);
            tokenCacheMap.put(email, new CachedTokenInfo(fallbackToken, expiry));
            return fallbackToken;
        }

        telegramNotifier.notifyIssue("Bakong token renewal failed", renewUrl, Map.of("email", email), ex);
        throw new RuntimeException("Failed to obtain Bakong token for email=" + email + ": " + cleanMsg, ex);
    }

    private Optional<String> findLatestActiveDatabaseToken(String email) {
        try {
            return bakongTokenRepository.findTopByEmailAndStatusOrderByCreatedAtDesc(email, "ACTIVE")
                    .map(BakongTokenLog::getToken)
                    .filter(token -> token != null && !token.isBlank());
        } catch (Exception ex) {
            log.warn("Failed to query fallback token from database for email={}: {}", email, ex.getMessage());
            return Optional.empty();
        }
    }

    private void initializeFromDatabaseIfNeeded(String email) {
        CachedTokenInfo cached = tokenCacheMap.get(email);
        if (cached != null && cached.isValid()) {
            return;
        }

        try {
            bakongTokenRepository.findTopByEmailAndStatusOrderByCreatedAtDesc(email, "ACTIVE")
                    .ifPresent(dbToken -> {
                        if (dbToken.getToken() != null && !dbToken.getToken().isBlank()
                                && dbToken.getExpiresAt() != null
                                && Instant.now().plus(SAFETY_BUFFER).isBefore(dbToken.getExpiresAt())) {
                            tokenCacheMap.put(email, new CachedTokenInfo(dbToken.getToken(), dbToken.getExpiresAt()));
                            log.info("Loaded active Bakong token from database table for email={}, expiresAt={}", email, dbToken.getExpiresAt());
                        }
                    });
        } catch (Exception ex) {
            log.warn("Failed to load active Bakong token from database table for email={}: {}", email, ex.getMessage());
        }
    }

    private void persistTokenLog(String email, String token, Instant expiresAt, String status, String action, String errorMessage) {
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
            log.info("Persisted BakongTokenLog entry id={} action={} status={} email={}", tokenLog.getId(), action, status, email);
        } catch (Exception ex) {
            log.warn("Failed to persist BakongTokenLog entry for email={}: {}", email, ex.getMessage());
        }
    }

    @Override
    public synchronized TokenStatusInfo getTokenStatusInfo() {
        String email = getBakongEmail();
        CachedTokenInfo cached = tokenCacheMap.get(email);
        boolean memoryValid = cached != null && cached.isValid();
        String source = memoryValid ? "MEMORY" : "NOT_INITIALIZED";
        Instant exp = cached != null ? cached.expiry : null;

        if (!memoryValid) {
            initializeFromDatabaseIfNeeded(email);
            cached = tokenCacheMap.get(email);
            if (cached != null && cached.isValid()) {
                source = "DATABASE";
                exp = cached.expiry;
            } else {
                source = "EXPIRED_OR_NONE";
            }
        }

        boolean isActive = exp != null && Instant.now().isBefore(exp);
        Long remainingSeconds = exp != null ? Math.max(0, Duration.between(Instant.now(), exp).getSeconds()) : null;

        return TokenStatusInfo.builder()
                .email(email)
                .active(isActive)
                .expiresAt(exp)
                .remainingSeconds(remainingSeconds)
                .tokenSource(source)
                .build();
    }
}


