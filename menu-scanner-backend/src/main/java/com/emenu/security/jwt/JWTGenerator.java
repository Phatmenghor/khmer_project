package com.emenu.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@Slf4j
public class JWTGenerator {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    private SecretKey signingKey;

    @PostConstruct
    private void init() {
        // Guard: prevent startup with an unset or weak JWT secret
        if (jwtSecret == null || jwtSecret.startsWith("${") || jwtSecret.length() < 64) {
            throw new IllegalStateException(
                "JWT_SECRET is not configured or is too short (minimum 64 characters). " +
                "Set JWT_SECRET environment variable before starting."
            );
        }
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        log.info("JWT signing key initialized (algorithm=HS512)");
    }

    // ─── Core signing key ──────────────────────────────────────────────────────

    private SecretKey getSigningKey() {
        return signingKey;
    }

    // ─── Access token generation ────────────────────────────────────────────────

    public String generateAccessToken(Authentication authentication, String userType) {
        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        return buildAccessToken(authentication.getName(), roles, userType, null, null);
    }

    public String generateAccessTokenFromUsername(String username, List<String> roles, String userType) {
        return buildAccessToken(username, String.join(",", roles), userType, null, null);
    }

    public String generateAccessTokenFromUsername(String username, List<String> roles, String userType,
                                                   String userIdentifier) {
        return buildAccessToken(username, String.join(",", roles), userType, null, userIdentifier);
    }

    public String generateAccessTokenFromUsername(String username, List<String> roles, String userType,
                                                   String userId, String userIdentifier) {
        return buildAccessToken(username, String.join(",", roles), userType, userId, userIdentifier);
    }

    private String buildAccessToken(String username, String roles, String userType,
                                    String userId, String userIdentifier) {
        Date now = new Date();
        JwtBuilder builder = Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .claim("type", "access")
                .claim("userType", userType)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + jwtExpiration));

        if (userId != null) builder.claim("userId", userId);
        if (userIdentifier != null) builder.claim("userIdentifier", userIdentifier);

        return builder.signWith(getSigningKey(), Jwts.SIG.HS512).compact();
    }

    // ─── Refresh token generation ───────────────────────────────────────────────

    public String generateRefreshToken(String username, String userType, String businessId) {
        return buildRefreshToken(username, userType, businessId, null, null);
    }

    public String generateRefreshToken(String username, String userType, String businessId,
                                       String userIdentifier) {
        return buildRefreshToken(username, userType, businessId, null, userIdentifier);
    }

    public String generateRefreshToken(String username, String userType, String businessId,
                                       String userId, String userIdentifier) {
        return buildRefreshToken(username, userType, businessId, userId, userIdentifier);
    }

    private String buildRefreshToken(String username, String userType, String businessId,
                                     String userId, String userIdentifier) {
        Date now = new Date();
        JwtBuilder builder = Jwts.builder()
                .subject(username)
                .claim("type", "refresh")
                .claim("userType", userType)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + refreshTokenExpiration));

        if (businessId != null) builder.claim("businessId", businessId);
        if (userId != null) builder.claim("userId", userId);
        if (userIdentifier != null) builder.claim("userIdentifier", userIdentifier);

        return builder.signWith(getSigningKey(), Jwts.SIG.HS512).compact();
    }

    public Date getRefreshTokenExpiryDate() {
        return new Date(System.currentTimeMillis() + refreshTokenExpiration);
    }

    // ─── Token parsing ──────────────────────────────────────────────────────────

    public String getUsernameFromJWT(String token) {
        return parseClaims(token).getSubject();
    }

    public String getUserTypeFromJWT(String token) {
        return parseClaims(token).get("userType", String.class);
    }

    public String getBusinessIdFromJWT(String token) {
        return parseClaims(token).get("businessId", String.class);
    }

    public String getUserIdFromJWT(String token) {
        return parseClaims(token).get("userId", String.class);
    }

    public String getUserIdentifierFromJWT(String token) {
        return parseClaims(token).get("userIdentifier", String.class);
    }

    public String getTokenTypeFromJWT(String token) {
        return parseClaims(token).get("type", String.class);
    }

    public Date getExpirationDateFromJWT(String token) {
        return parseClaims(token).getExpiration();
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ─── Token validation ───────────────────────────────────────────────────────

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        try {
            return getExpirationDateFromJWT(token).before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Parse the token exactly once and return all claims.
     * Returns empty Optional if the token is invalid or expired.
     * Use this in the authentication filter to avoid redundant parses.
     */
    public Optional<Claims> parseClaimsQuietly(String token) {
        try {
            return Optional.of(parseClaims(token));
        } catch (Exception e) {
            log.warn("JWT parsing failed: {}", e.getMessage());
            return Optional.empty();
        }
    }
}
