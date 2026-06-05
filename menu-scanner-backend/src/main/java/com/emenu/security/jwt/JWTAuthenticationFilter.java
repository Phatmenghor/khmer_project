package com.emenu.security.jwt;

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
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

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
        try {
            String token = extractBearerToken(request);
            if (StringUtils.hasText(token)) {
                authenticateFromToken(request, response, token);
                if (response.isCommitted()) return;
            }
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
            filterChain.doFilter(request, response);
        } finally {
            AUTHENTICATED_USER.remove(); // prevent ThreadLocal memory leak
        }
    }

    private void authenticateFromToken(HttpServletRequest request,
                                       HttpServletResponse response,
                                       String token) throws IOException {
        if (tokenBlacklistService.isTokenBlacklisted(token)) {
            log.warn("Blacklisted token attempted from ip={}", request.getRemoteAddr());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token has been revoked");
            return;
        }

        if (!jwtGenerator.validateToken(token)) {
            return;
        }

        String username = jwtGenerator.getUsernameFromJWT(token);
        String userType = jwtGenerator.getUserTypeFromJWT(token);

        UserDetails userDetails = (userType != null)
                ? customUserDetailsService.loadUserByUsernameAndUserType(username, userType)
                : customUserDetailsService.loadUserByUsername(username);

        var authToken = new UsernamePasswordAuthenticationToken(
                userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);

        populateThreadLocalContext(token, userType);
    }

    private void populateThreadLocalContext(String token, String userType) {
        try {
            Map<String, String> ctx = AUTHENTICATED_USER.get();
            String userId = jwtGenerator.getUserIdFromJWT(token);
            String userIdentifier = jwtGenerator.getUserIdentifierFromJWT(token);
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
