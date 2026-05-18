package com.emenu.shared.logging;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class RequestIdFilter implements Filter {

    private final RequestIdGenerator requestIdGenerator;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        String requestId = requestIdGenerator.generateRequestId();
        MDC.put("requestId", requestId);

        if (request instanceof HttpServletRequest httpRequest) {
            String method = httpRequest.getMethod();
            String path = httpRequest.getRequestURI();
            log.info("API Request [{}]: {} {}", requestId, method, path);
        }

        try {
            chain.doFilter(request, response);
        } finally {
            MDC.remove("requestId");
        }
    }
}
