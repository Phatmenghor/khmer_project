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
 * First filter in the chain. Responsible for:
 *  - Generating / propagating X-Request-ID
 *  - Populating MDC with: requestId, method, path
 *  - Measuring request duration
 *  - Logging structured access log entry at INFO level
 *  - Clearing ALL MDC keys at the end of the request
 *
 * JWTAuthenticationFilter adds userId/userType to MDC after this runs.
 * MDC.clear() in the finally block cleans up all keys.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestIdFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";

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

        String requestId = resolveOrGenerate(request);
        long start = System.currentTimeMillis();

        // Populate MDC — JWTAuthFilter will add userId/userType after authentication
        MDC.put("requestId", requestId);
        MDC.put("method",    request.getMethod());
        MDC.put("path",      path);

        // Echo back to caller so they can correlate with their logs
        response.setHeader(REQUEST_ID_HEADER, requestId);

        try {
            chain.doFilter(request, response);
        } finally {
            long duration = System.currentTimeMillis() - start;
            MDC.put("statusCode", String.valueOf(response.getStatus()));
            MDC.put("duration",   String.valueOf(duration));

            log.info("{} {} → {} ({}ms)", request.getMethod(), path, response.getStatus(), duration);

            // Single authoritative MDC.clear() — covers all keys set by this filter and by JWTAuthFilter
            MDC.clear();
        }
    }

    private String resolveOrGenerate(HttpServletRequest request) {
        String incoming = request.getHeader(REQUEST_ID_HEADER);
        return (incoming != null && !incoming.isBlank()) ? incoming : UUID.randomUUID().toString();
    }
}
