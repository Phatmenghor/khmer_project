package com.emenu.features.audit.filter;

import com.emenu.features.audit.service.AuditLogService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@RequiredArgsConstructor
@Slf4j
public class AuditLogFilter extends OncePerRequestFilter {

    private final AuditLogService auditLogService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        if (shouldSkipLogging(uri)) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        long startTime = System.currentTimeMillis();
        Exception exception = null;

        // Capture security context BEFORE endpoint executes (while it's still available)
        var securityContextBeforeEndpoint = SecurityContextHolder.getContext().getAuthentication();

        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            long responseTimeMs = System.currentTimeMillis() - startTime;
            int statusCode = wrappedResponse.getStatus();

            String errorMessage = null;
            if (exception != null) {
                errorMessage = exception.getMessage();
            } else if (statusCode >= 400) {
                errorMessage = "HTTP " + statusCode + " error";
            }

            String requestBody = null;
            if (shouldLogBodies(request.getMethod())) {
                requestBody = getContentAsString(wrappedRequest.getContentAsByteArray());
            }

            try {
                // Restore security context so audit logging can access it
                if (securityContextBeforeEndpoint != null) {
                    SecurityContextHolder.getContext().setAuthentication(securityContextBeforeEndpoint);
                }

                auditLogService.logAccessWithBodies(
                    wrappedRequest,
                    statusCode,
                    responseTimeMs,
                    errorMessage,
                    requestBody
                );
            } catch (Exception e) {
                log.error("Failed to log audit entry: endpoint={}, error={}", uri, e.getMessage());
            } finally {
                // Clear security context after audit logging
                SecurityContextHolder.clearContext();
            }

            wrappedResponse.copyBodyToResponse();
        }
    }

    private boolean shouldSkipLogging(String uri) {
        return uri.startsWith("/api/images/") ||
               uri.startsWith("/swagger-ui/") ||
               uri.startsWith("/v3/api-docs") ||
               uri.startsWith("/actuator/") ||
               uri.equals("/health") ||
               uri.equals("/favicon.ico") ||
               uri.endsWith(".css") ||
               uri.endsWith(".js") ||
               uri.endsWith(".png") ||
               uri.endsWith(".jpg") ||
               uri.endsWith(".ico");
    }

    private boolean shouldLogBodies(String httpMethod) {
        return "POST".equalsIgnoreCase(httpMethod) ||
               "PUT".equalsIgnoreCase(httpMethod) ||
               "PATCH".equalsIgnoreCase(httpMethod) ||
               "DELETE".equalsIgnoreCase(httpMethod);
    }

    private String getContentAsString(byte[] content) {
        if (content == null || content.length == 0) {
            return null;
        }
        return new String(content, StandardCharsets.UTF_8);
    }
}
