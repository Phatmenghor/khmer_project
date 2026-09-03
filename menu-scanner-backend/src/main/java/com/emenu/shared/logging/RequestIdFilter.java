package com.emenu.shared.logging;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;

/**
 * Global HTTP Request Logging Filter (Single authoritative logging entrypoint).
 * Responsible for:
 *  - Generating / propagating X-Request-ID
 *  - MDC population and cleanup
 *  - Centralized request entry and completion logging for monitoring
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestIdFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String TRACE_ID_HEADER   = "X-Trace-ID";

    // Skip noisy health/metrics probes from access logs
    private static final Set<String> SKIP_PATHS = Set.of(
            "/actuator/health",
            "/actuator/health/liveness",
            "/actuator/health/readiness",
            "/actuator/prometheus"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {

        String path = request.getRequestURI();

        // Pass through silently for probe paths
        if (SKIP_PATHS.contains(path)) {
            chain.doFilter(request, response);
            return;
        }

        String traceId = resolveOrGenerate(request);
        long start = System.currentTimeMillis();

        // Populate MDC
        MDC.put("traceId", traceId);
        MDC.put("method",  request.getMethod());
        MDC.put("path",    path);

        // Echo back to caller for correlation
        response.setHeader(REQUEST_ID_HEADER, traceId);
        response.setHeader(TRACE_ID_HEADER,   traceId);

        // Log request entry
        log.info("Endpoint Request: {} {}", request.getMethod(), path);

        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            int status = response.getStatus();
            MDC.put("statusCode", String.valueOf(status));
            MDC.put("duration",   String.valueOf(duration));

            String responseMessage = MDC.get("responseMessage");

            if (status >= 400 && responseMessage != null && !responseMessage.isBlank()) {
                if (status >= 500) {
                    log.error("Endpoint Error: {} {} → {} in {}ms — {}",
                            request.getMethod(), path, status, duration, responseMessage);
                } else {
                    log.warn("Endpoint Warning: {} {} → {} in {}ms — {}",
                            request.getMethod(), path, status, duration, responseMessage);
                }
            } else {
                log.info("Endpoint Response: {} {} → {} in {}ms",
                        request.getMethod(), path, status, duration);
            }

            // Single authoritative MDC.clear()
            MDC.clear();
        }
    }

    private String resolveOrGenerate(HttpServletRequest request) {
        String incoming = request.getHeader(REQUEST_ID_HEADER);
        return (incoming != null && !incoming.isBlank()) ? incoming : UUID.randomUUID().toString();
    }
}
