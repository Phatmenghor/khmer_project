package com.emenu.shared.ratelimit;

import com.emenu.shared.utils.ClientIpUtils;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
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

/**
 * Per-IP/user rate limiter using Bucket4j with Caffeine-backed bucket storage.
 * Caffeine auto-expires idle buckets after 2 minutes, preventing memory leaks
 * from unique IP addresses accumulating in a plain ConcurrentHashMap.
 *
 * Limits:
 *   - Auth endpoints (/api/v1/auth/**): 10 requests / minute
 *   - All other endpoints:              50 requests / minute
 */
@Component
@Order(2)
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int GENERAL_LIMIT = 50;
    private static final int AUTH_LIMIT    = 10;
    private static final Duration WINDOW   = Duration.ofMinutes(1);
    // Expire bucket entries 2 min after last access → memory-safe for high-IP-churn
    private static final Duration BUCKET_IDLE_TTL = Duration.ofMinutes(2);

    private final Cache<String, Bucket> generalBuckets = Caffeine.newBuilder()
            .expireAfterAccess(BUCKET_IDLE_TTL)
            .maximumSize(50_000)
            .build();

    private final Cache<String, Bucket> authBuckets = Caffeine.newBuilder()
            .expireAfterAccess(BUCKET_IDLE_TTL)
            .maximumSize(10_000)
            .build();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {
        String key = resolveKey(request);
        boolean isAuthPath = request.getRequestURI().startsWith("/api/v1/auth/");

        Bucket bucket = isAuthPath
                ? authBuckets.get(key, k -> buildBucket(AUTH_LIMIT))
                : generalBuckets.get(key, k -> buildBucket(GENERAL_LIMIT));

        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded: key={}, path={}", key, request.getRequestURI());
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"status\":\"error\",\"message\":\"Too many requests. Please slow down and try again.\",\"timestamp\":\"" + Instant.now() + "\"}");
        }
    }

    private String resolveKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return "user:" + auth.getName();
        }
        return "ip:" + ClientIpUtils.getClientIp(request);
    }

    private Bucket buildBucket(int requestsPerWindow) {
        return Bucket.builder()
                .addLimit(Bandwidth.builder()
                        .capacity(requestsPerWindow)
                        .refillGreedy(requestsPerWindow, WINDOW)
                        .build())
                .build();
    }
}
