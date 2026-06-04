package com.emenu.security.scheduler;

import com.emenu.security.jwt.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(value = "app.security.token-cleanup.enabled", havingValue = "true", matchIfMissing = true)
public class TokenCleanupScheduler {

    private final TokenBlacklistService tokenBlacklistService;

    /**
     * Runs daily at 03:00 to purge expired tokens from the blacklist table.
     * Keeps the blacklist lean and prevents unbounded table growth.
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupExpiredBlacklistedTokens() {
        log.info("[Scheduler] Starting expired token blacklist cleanup...");
        try {
            int deleted = tokenBlacklistService.cleanupExpiredTokens();
            TokenBlacklistService.BlacklistStats stats = tokenBlacklistService.getBlacklistStats();
            log.info("[Scheduler] Token cleanup done. removed={}, remaining={}, active={}",
                    deleted, stats.totalTokens, stats.activeTokens);
        } catch (Exception e) {
            log.error("[Scheduler] Token cleanup failed: {}", e.getMessage(), e);
        }
    }
}
