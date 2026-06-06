package com.emenu.security.jwt;

import com.emenu.security.CustomUserDetailsService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JWTGenerator jwtGenerator;
    private final CustomUserDetailsService customUserDetailsService;
    private final TokenBlacklistService tokenBlacklistService;

    public static final ThreadLocal<Map<String, String>> AUTHENTICATED_USER =
            ThreadLocal.withInitial(HashMap::new);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        MDC.put("requestId", UUID.randomUUID().toString());
        try {
            String token = extractBearerToken(request);
            if (StringUtils.hasText(token)) {
                authenticateFromToken(request, response, token);
                if (response.isCommitted()) return;
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        } finally {
            MDC.remove("requestId");
        }
        filterChain.doFilter(request, response);
    }

    private void authenticateFromToken(HttpServletRequest request,
                                       HttpServletResponse response,
                                       String token) throws IOException {
        if (tokenBlacklistService.isTokenBlacklisted(token)) {
            log.warn("Blacklisted token attempted from ip={}", request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been revoked");
            return;
        }

        // Parse JWT exactly once — all claims extracted from this single result
        Claims claims = jwtGenerator.parseClaimsQuietly(token).orElse(null);
        if (claims == null) {
            return;
        }

        String tokenType = claims.get("type", String.class);
        if (!"access".equals(tokenType)) {
            log.warn("Rejected non-access token (type={}) from ip={}", tokenType, request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token type");
            return;
        }

        String username = claims.getSubject();
        String userType = claims.get("userType", String.class);

        UserDetails userDetails = (userType != null)
                ? customUserDetailsService.loadUserByUsernameAndUserType(username, userType)
                : customUserDetailsService.loadUserByUsername(username);

        var authToken = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        populateThreadLocalContext(claims, userType);
    }

    private void populateThreadLocalContext(Claims claims, String userType) {
        try {
            Map<String, String> ctx = AUTHENTICATED_USER.get();
            String userId = claims.get("userId", String.class);
            String userIdentifier = claims.get("userIdentifier", String.class);
            if (userId != null) ctx.put("userId", userId);
            if (userIdentifier != null) ctx.put("userIdentifier", userIdentifier);
            if (userType != null) ctx.put("userType", userType);
        } catch (Exception e) {
            log.debug("Could not populate auth context: {}", e.getMessage());
        }
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
