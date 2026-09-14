package com.emenu.config.security;

import com.emenu.config.security.model.ApiKeyContext;
import com.emenu.features.apikey.model.ApiKey;
import com.emenu.features.apikey.repository.ApiKeyRepository;
import com.emenu.shared.dto.ApiResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Enumeration;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private final ApiKeyRepository apiKeyRepository;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilterAsyncDispatch() {
        return false;
    }

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

        String rawKey = extractApiKeyHeader(request);

        if (rawKey == null || rawKey.isBlank()) {
            reject(response, "Missing X-Api-Key header. Please click 'Authorize' in Swagger and enter your API Key.", HttpStatus.UNAUTHORIZED);
            return;
        }

        Optional<ApiKey> found = apiKeyRepository.findByApiKeyAndActiveTrue(rawKey.trim());
        if (found.isEmpty()) {
            reject(response, "Unauthorized: Invalid or revoked API Key.", HttpStatus.UNAUTHORIZED);
            return;
        }

        ApiKey apiKeyEntity = found.get();
        String projectCode = apiKeyEntity.getProjectCode() != null && !apiKeyEntity.getProjectCode().isBlank()
                ? apiKeyEntity.getProjectCode()
                : "UNKNOWN_PROJECT";

        ApiKeyContext ctx = new ApiKeyContext(projectCode, rawKey);
        request.setAttribute(ApiKeyContext.REQUEST_ATTR, ctx);
        org.slf4j.MDC.put("apiKey", rawKey.trim());
        org.slf4j.MDC.put("projectCode", projectCode);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                rawKey, null, List.of(new SimpleGrantedAuthority("ROLE_ADMIN"), new SimpleGrantedAuthority("ROLE_API_CLIENT"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        filterChain.doFilter(request, response);
    }

    private String extractApiKeyHeader(HttpServletRequest request) {
        String key = request.getHeader("X-Api-Key");
        if (key != null && !key.isBlank()) return key;

        key = request.getHeader("X-API-Key");
        if (key != null && !key.isBlank()) return key;

        key = request.getHeader("x-api-key");
        if (key != null && !key.isBlank()) return key;

        Enumeration<String> headerNames = request.getHeaderNames();
        if (headerNames != null) {
            while (headerNames.hasMoreElements()) {
                String name = headerNames.nextElement();
                if ("x-api-key".equalsIgnoreCase(name)) {
                    return request.getHeader(name);
                }
            }
        }

        return null;
    }

    private void reject(HttpServletResponse response, String message, HttpStatus status) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ApiResponse<Void> apiResponse = ApiResponse.error(message);
        objectMapper.writeValue(response.getWriter(), apiResponse);
    }
}
