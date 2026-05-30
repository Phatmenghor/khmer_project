package com.emenu.features.auth.repository;

import com.emenu.features.auth.models.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID>, JpaSpecificationExecutor<RefreshToken> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByTokenAndIsValidTrue(String token);

    @Modifying
    @Query("UPDATE RefreshToken rt SET rt.isRevoked = true, rt.revokedAt = :revokedAt, rt.revocationReason = :reason WHERE rt.userId = :userId AND rt.isRevoked = false")
    int revokeAllByUserId(@Param("userId") UUID userId, @Param("revokedAt") LocalDateTime revokedAt, @Param("reason") String reason);

    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.expiryDate < :now OR (rt.isRevoked = true AND rt.revokedAt < :cutoffDate)")
    int deleteExpiredAndRevokedTokens(@Param("now") LocalDateTime now, @Param("cutoffDate") LocalDateTime cutoffDate);
}
