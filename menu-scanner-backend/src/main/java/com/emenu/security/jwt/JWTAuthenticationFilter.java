package com.emenu.security.jwt;

import com.emenu.features.auth.models.User;
import com.emenu.features.auth.repository.UserRepository;
import com.emenu.security.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JWTGenerator jwtGenerator;
    private final CustomUserDetailsService customUserDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserRepository userRepository;

    // ThreadLocal to store authenticated user info for audit logging
    public static final ThreadLocal<Map<String, String>> AUTHENTICATED_USER = ThreadLocal.withInitial(HashMap::new);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = getJWTFromRequest(request);
            String endpoint = request.getRequestURI();

            if (StringUtils.hasText(token)) {
                log.debug("[JWT] Token found for endpoint: {}", endpoint);

                if (tokenBlacklistService.isTokenBlacklisted(token)) {
                    log.warn("Blacklisted token attempted: {}", token.substring(0, 20));
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token is blacklisted");
                    return;
                }

                if (jwtGenerator.validateToken(token)) {
                    String username = jwtGenerator.getUsernameFromJWT(token);
                    String userType = jwtGenerator.getUserTypeFromJWT(token);
                    log.debug("[JWT] Token validated - username: {}, userType: {}, endpoint: {}", username, userType, endpoint);

                    UserDetails userDetails;
                    if (userType != null) {
                        userDetails = customUserDetailsService.loadUserByUsernameAndUserType(username, userType);
                    } else {
                        userDetails = customUserDetailsService.loadUserByUsername(username);
                    }

                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);

                    // Extract full user info and store in ThreadLocal for audit logging
                    try {
                        Optional<User> userOpt = null;
                        if (userType != null) {
                            var userTypeEnum = com.emenu.enums.user.UserType.valueOf(userType);
                            userOpt = userRepository.findByUserIdentifierAndUserTypeAndIsDeletedFalse(username, userTypeEnum);
                        } else {
                            userOpt = userRepository.findByUserIdentifierAndIsDeletedFalse(username);
                        }

                        if (userOpt != null && userOpt.isPresent()) {
                            User user = userOpt.get();
                            var authMap = AUTHENTICATED_USER.get();
                            authMap.put("username", username);
                            authMap.put("userType", userType);
                            authMap.put("userId", user.getId().toString());
                            authMap.put("userIdentifier", user.getUserIdentifier());
                        }
                    } catch (Exception e) {
                        log.debug("[JWT] Failed to extract user from database: {}", e.getMessage());
                    }

                    log.debug("[JWT] Authentication set in SecurityContext for user: {}", username);
                } else {
                    log.debug("[JWT] Token validation failed for endpoint: {}", endpoint);
                }
            } else {
                log.debug("[JWT] No token found in request for endpoint: {}", endpoint);
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }

    private String getJWTFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}