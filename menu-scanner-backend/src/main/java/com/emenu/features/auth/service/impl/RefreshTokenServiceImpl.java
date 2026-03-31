package com.emenu.features.auth.service.impl;

import com.emenu.features.auth.dto.helper.RefreshTokenCreateHelper;
import com.emenu.features.auth.mapper.RefreshTokenMapper;
import com.emenu.features.auth.models.RefreshToken;
import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.RefreshTokenRepository;
import com.emenu.features.auth.service.RefreshTokenService;
import com.emenu.security.jwt.JWTGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JWTGenerator jwtGenerator;
    private final RefreshTokenMapper refreshTokenMapper;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user, String ipAddress, String deviceInfo) {
                user.getUserIdentifier(), user.getUserType(), user.getBusinessId());

        // Generate JWT refresh token with userType and businessId
        String tokenString = jwtGenerator.generateRefreshToken(
                user.getUserIdentifier(),
                user.getUserType().name(),
                user.getBusinessId() != null ? user.getBusinessId().toString() : null
        );

        // Build helper DTO, then use pure MapStruct mapping
        RefreshTokenCreateHelper helper = RefreshTokenCreateHelper.builder()
                .token(tokenString)
                .userId(user.getId())
                .expiryDate(LocalDateTime.ofInstant(
                        jwtGenerator.getRefreshTokenExpiryDate().toInstant(),
                        ZoneId.systemDefault()))
                .isRevoked(false)
                .ipAddress(ipAddress)
                .deviceInfo(deviceInfo)
                .build();

        RefreshToken refreshToken = refreshTokenMapper.createFromHelper(helper);
        RefreshToken saved = refreshTokenRepository.save(refreshToken);

        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RefreshToken> verifyRefreshToken(String token) {

        // Validate JWT structure
        if (!jwtGenerator.validateToken(token)) {
            return Optional.empty();
        }

        // Check if token is expired in JWT
        if (jwtGenerator.isTokenExpired(token)) {
            return Optional.empty();
        }

        // Find token in database
        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByTokenAndIsValidTrue(token);

        if (refreshTokenOpt.isEmpty()) {
            return Optional.empty();
        }

        RefreshToken refreshToken = refreshTokenOpt.get();

        // Additional validation
        if (!refreshToken.isValid()) {
                    refreshToken.isExpired(), refreshToken.getIsRevoked(), refreshToken.getIsDeleted());
            return Optional.empty();
        }

        return Optional.of(refreshToken);
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String token, String reason) {

        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByToken(token);

        if (refreshTokenOpt.isPresent()) {
            RefreshToken refreshToken = refreshTokenOpt.get();
            refreshToken.revoke(reason);
            refreshTokenRepository.save(refreshToken);
        } else {
        }
    }

    @Override
    @Transactional
    public void revokeAllUserTokens(UUID userId, String reason) {

        int revokedCount = refreshTokenRepository.revokeAllByUserId(
                userId,
                LocalDateTime.now(),
                reason
        );

    }
}
