package com.emenu.features.auth.service.impl;

import com.emenu.features.auth.dto.helper.RefreshTokenCreateHelper;
import com.emenu.features.auth.mapper.RefreshTokenMapper;
import com.emenu.features.auth.models.RefreshToken;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.RefreshTokenRepository;
import com.emenu.features.auth.service.RefreshTokenService;
import com.emenu.security.jwt.JWTGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JWTGenerator jwtGenerator;
    private final RefreshTokenMapper refreshTokenMapper;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User userEntity, String ipAddress, String deviceInfo) {
        log.info("REFRESH_TOKEN_CREATE_INITIATED: user_id={}, type={}, business_id={}",
                userEntity.getId(), userEntity.getUserType(), userEntity.getBusinessId());

        String tokenString = jwtGenerator.generateRefreshToken(
                userEntity.getUserIdentifier(),
                userEntity.getUserType().name(),
                userEntity.getBusinessId() != null ? userEntity.getBusinessId().toString() : null
        );

        RefreshTokenCreateHelper tokenCreateHelper = RefreshTokenCreateHelper.builder()
                .token(tokenString)
                .userId(userEntity.getId())
                .expiryDate(LocalDateTime.ofInstant(
                        jwtGenerator.getRefreshTokenExpiryDate().toInstant(),
                        ZoneId.systemDefault()))
                .isRevoked(false)
                .ipAddress(ipAddress)
                .deviceInfo(deviceInfo)
                .build();

        RefreshToken refreshTokenEntity = refreshTokenMapper.createFromHelper(tokenCreateHelper);
        RefreshToken savedRefreshToken = refreshTokenRepository.save(refreshTokenEntity);
        log.info("REFRESH_TOKEN_CREATE_SUCCESS: user_id={}", userEntity.getId());

        return savedRefreshToken;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RefreshToken> verifyRefreshToken(String token) {
        if (!jwtGenerator.validateToken(token)) {
            log.warn("REFRESH_TOKEN_VERIFY_FAILED_INVALID_JWT");
            return Optional.empty();
        }

        if (jwtGenerator.isTokenExpired(token)) {
            log.warn("REFRESH_TOKEN_VERIFY_FAILED_EXPIRED_JWT");
            return Optional.empty();
        }

        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByTokenAndIsValidTrue(token);

        if (refreshTokenOpt.isEmpty()) {
            log.warn("REFRESH_TOKEN_VERIFY_FAILED_NOT_FOUND_IN_DB");
            return Optional.empty();
        }

        RefreshToken refreshTokenEntity = refreshTokenOpt.get();

        if (!refreshTokenEntity.isValid()) {
            log.warn("REFRESH_TOKEN_VERIFY_FAILED_INVALID_STATE: expired={}, revoked={}, deleted={}",
                    refreshTokenEntity.isExpired(), refreshTokenEntity.getIsRevoked(), refreshTokenEntity.getIsDeleted());
            return Optional.empty();
        }

        log.info("REFRESH_TOKEN_VERIFY_SUCCESS");
        return Optional.of(refreshTokenEntity);
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String token, String revocationReason) {
        log.info("REFRESH_TOKEN_REVOKE_INITIATED: reason={}", revocationReason);

        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByToken(token);

        if (refreshTokenOpt.isPresent()) {
            RefreshToken refreshTokenEntity = refreshTokenOpt.get();
            refreshTokenEntity.revoke(revocationReason);
            refreshTokenRepository.save(refreshTokenEntity);
            log.info("REFRESH_TOKEN_REVOKE_SUCCESS");
        } else {
            log.warn("REFRESH_TOKEN_REVOKE_FAILED_NOT_FOUND");
        }
    }

    @Override
    @Transactional
    public void revokeAllUserTokens(UUID userId, String revocationReason) {
        log.info("REFRESH_TOKENS_REVOKE_ALL_INITIATED: user_id={}, reason={}", userId, revocationReason);

        int revokedTokenCount = refreshTokenRepository.revokeAllByUserId(
                userId,
                LocalDateTime.now(),
                revocationReason
        );

        log.info("REFRESH_TOKENS_REVOKE_ALL_SUCCESS: user_id={}, revoked_count={}", userId, revokedTokenCount);
    }
}
