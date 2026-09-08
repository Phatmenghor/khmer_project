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

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class RequestIdFilter extends OncePerRequestFilter {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";
    private static final String TRACE_ID_HEADER   = "X-Trace-ID";

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

        if (SKIP_PATHS.contains(path)) {
            chain.doFilter(request, response);
            return;
        }

        String traceId = resolveOrGenerate(request);
        long start = System.currentTimeMillis();

        MDC.put("traceId", traceId);
        MDC.put("method",  request.getMethod());
        MDC.put("path",    path);

        response.setHeader(REQUEST_ID_HEADER, traceId);

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }

    private String resolveOrGenerate(HttpServletRequest req) {
        String reqId = req.getHeader(REQUEST_ID_HEADER);
        if (reqId != null && !reqId.isBlank()) return reqId.trim();
        String traceId = req.getHeader(TRACE_ID_HEADER);
        if (traceId != null && !traceId.isBlank()) return traceId.trim();
        return UUID.randomUUID().toString();
    }
}
