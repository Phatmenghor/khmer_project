package com.emenu.security.jwt.impl;

import com.emenu.features.auth.models.BlacklistedToken;
import com.emenu.features.auth.repository.BlacklistedTokenRepository;
import com.emenu.security.jwt.JWTGenerator;
import com.emenu.security.jwt.TokenBlacklistService;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

    private final BlacklistedTokenRepository blacklistedTokenRepository;
    private final JWTGenerator jwtGenerator;

    // Local write-through cache: avoids a DB round-trip on every authenticated request.
    // Only stores confirmed-blacklisted (true) entries; non-blacklisted tokens are not cached
    // here, so a subsequent blacklistToken() call is always visible immediately.
    private final Cache<String, Boolean> blacklistCache = Caffeine.newBuilder()
            .maximumSize(10_000)
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .build();

    @Override
    public void blacklistToken(String token, String userIdentifier, String reason) {
        if (Boolean.TRUE.equals(blacklistCache.getIfPresent(token))
                || blacklistedTokenRepository.existsByToken(token)) {
            log.warn("Token already blacklisted for user: {}", userIdentifier);
            return;
        }

        try {
            Date expirationDate = jwtGenerator.getExpirationDateFromJWT(token);
            LocalDateTime expiryDateTime = convertToLocalDateTime(expirationDate);

            BlacklistedToken blacklistedToken = new BlacklistedToken(
                    token,
                    userIdentifier,
                    expiryDateTime,
                    reason
            );

            blacklistedTokenRepository.save(blacklistedToken);
            blacklistCache.put(token, Boolean.TRUE);
            log.info("Token blacklisted for user: {} - Reason: {}", userIdentifier, reason);

        } catch (Exception e) {
            log.error("Failed to blacklist token for user {}: {}", userIdentifier, e.getMessage());
        }
    }

    @Override
    public void blacklistAllUserTokens(String userIdentifier, String reason) {
        try {
            blacklistedTokenRepository.deleteByUserIdentifier(userIdentifier);
            log.info("All tokens invalidated for user: {} - Reason: {}", userIdentifier, reason);
        } catch (Exception e) {
            log.error("Failed to blacklist all user tokens: {}", e.getMessage());
        }
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        if (Boolean.TRUE.equals(blacklistCache.getIfPresent(token))) {
            return true;
        }
        boolean blacklisted = blacklistedTokenRepository.existsByToken(token);
        if (blacklisted) {
            blacklistCache.put(token, Boolean.TRUE);
        }
        return blacklisted;
    }

    @Override
    public int cleanupExpiredTokens() {
        try {
            LocalDateTime now = LocalDateTime.now();
            int deletedCount = blacklistedTokenRepository.deleteExpiredTokens(now);
            
            if (deletedCount > 0) {
                log.info("Cleaned up {} expired tokens", deletedCount);
            }
            
            return deletedCount;
        } catch (Exception e) {
            log.error("Failed to cleanup expired tokens: {}", e.getMessage());
            return 0;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public BlacklistStats getBlacklistStats() {
        try {
            long totalTokens = blacklistedTokenRepository.count();
            long expiredTokens = blacklistedTokenRepository.countExpiredTokens(LocalDateTime.now());
            long activeTokens = totalTokens - expiredTokens;

            return new BlacklistStats(totalTokens, expiredTokens, activeTokens);
        } catch (Exception e) {
            log.error("Failed to get blacklist stats: {}", e.getMessage());
            return new BlacklistStats(0, 0, 0);
        }
    }

    private LocalDateTime convertToLocalDateTime(Date date) {
        return date.toInstant()
                .atZone(java.time.ZoneId.systemDefault())
                .toLocalDateTime();
    }
}
