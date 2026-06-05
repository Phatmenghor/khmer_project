package com.emenu.shared.ratelimit;

import com.emenu.shared.utils.ClientIpUtils;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(2)
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int GENERAL_LIMIT = 50;
    private static final int AUTH_LIMIT    = 10;

    private final Map<String, Bucket> generalBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> authBuckets    = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {
        String key = resolveKey(request);
        boolean isAuthPath = request.getRequestURI().startsWith("/api/v1/auth/");

        Bucket bucket = isAuthPath
                ? authBuckets.computeIfAbsent(key, k -> buildBucket(AUTH_LIMIT))
                : generalBuckets.computeIfAbsent(key, k -> buildBucket(GENERAL_LIMIT));

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded: key={}, path={}", key, request.getRequestURI());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"status\":\"error\",\"message\":\"Too many requests. Please slow down.\",\"timestamp\":\"" + Instant.now() + "\"}");
        }
    }

    private String resolveKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return "user:" + auth.getName();
        }
        return "ip:" + ClientIpUtils.getClientIp(request);
    }

    private Bucket buildBucket(int requestsPerMinute) {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(requestsPerMinute)
                        .refillGreedy(requestsPerMinute, Duration.ofMinutes(1))
                        .build())
                .build();
    }
}
