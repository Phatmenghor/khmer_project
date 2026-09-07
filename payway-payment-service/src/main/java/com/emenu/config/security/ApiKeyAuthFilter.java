package com.emenu.config.security;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.apikey.model.ApiKey;
import com.emenu.features.apikey.repository.ApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-Api-Key";
    private static final String API_KEY_HEADER_ALT = "X-API-Key";

    private final ApiKeyRepository apiKeyRepository;

    @Value("${bakong.service.api-keys:sk_payway_default_secret_key_123456789}")
    private String apiKeys;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/ws/bakong") ||
            path.startsWith("/ws/") ||
            path.startsWith("/actuator") ||
            path.startsWith("/v3/api-docs") ||
            path.startsWith("/swagger-ui") ||
            path.startsWith("/swagger-resources") ||
            path.startsWith("/webjars") ||
            path.startsWith("/api/v1/admin/keys")) {
            filterChain.doFilter(request, response);
            return;
        }

        String rawKey = request.getHeader(API_KEY_HEADER);
        if (rawKey == null || rawKey.isBlank()) {
            rawKey = request.getHeader(API_KEY_HEADER_ALT);
        }

        if (rawKey == null || rawKey.isBlank()) {
            reject(response, "Missing X-Api-Key header.");
            return;
        }

        List<String> configuredApiKeys = Arrays.asList(apiKeys.split(","));

        Optional<ApiKey> found = apiKeyRepository.findByApiKeyAndActiveTrue(rawKey);
        String projectCode = "menu-scanner";

        if (found.isPresent()) {
            projectCode = found.get().getProjectCode();
        } else {
            if (!configuredApiKeys.contains(rawKey) && !configuredApiKeys.contains("*")) {
                reject(response, "Unauthorized: Invalid or revoked API Key.");
                return;
            }
        }

        ApiKeyContext ctx = new ApiKeyContext(projectCode, rawKey);
        request.setAttribute(ApiKeyContext.REQUEST_ATTR, ctx);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                rawKey, null, List.of(new SimpleGrantedAuthority("ROLE_API_CLIENT"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }

    private void reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\",\"data\":null}");
    }
}
