package com.emenu.config.security;

import com.emenu.config.security.model.ApiKey;
import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.config.security.repository.ApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-Key";

    private final ApiKeyRepository apiKeyRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        // Skip auth for Actuator and Swagger
        if (path.startsWith("/actuator") || path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs")) {
            filterChain.doFilter(request, response);
            return;
        }

        String rawKey = request.getHeader(API_KEY_HEADER);
        if (rawKey == null || rawKey.isBlank()) {
            reject(response, "Missing X-API-Key header.");
            return;
        }

        Optional<ApiKey> found = apiKeyRepository.findByApiKeyAndActiveTrue(rawKey);
        if (found.isEmpty()) {
            reject(response, "Unauthorized: Invalid or revoked API Key.");
            return;
        }

        ApiKey key = found.get();

        // Inject resolved context into request so controllers can read it
        ApiKeyContext ctx = new ApiKeyContext(key.getProjectCode(), key.getPath());
        request.setAttribute(ApiKeyContext.REQUEST_ATTR, ctx);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                key.getProjectCode(), null, List.of(new SimpleGrantedAuthority("ROLE_API_CLIENT"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }

    private void reject(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
