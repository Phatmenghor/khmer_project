package com.emenu.shared.logging;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Arrays;
import java.util.stream.Collectors;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void controllerPointcut() {}

    @Pointcut("within(@org.springframework.stereotype.Service *)")
    public void servicePointcut() {}

    @Around("controllerPointcut()")
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = getRequest();
        String method = request != null ? request.getMethod() : "UNKNOWN";
        String uri = request != null ? request.getRequestURI() : "UNKNOWN";
        String methodName = joinPoint.getSignature().toShortString();
        String apiKeyPrefix = request != null ? prefixOf(request.getHeader("X-API-Key")) : "none";

        log.info("Received {} request to endpoint={} [apiKey={}, method={}]", method, uri, apiKeyPrefix, methodName);

        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            log.info("Request completed successfully endpoint={} [duration={}ms]", uri, duration);
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - start;
            log.error("Request failed endpoint={} [duration={}ms] with message={}", uri, duration, ex.getMessage());
            throw ex;
        }
    }

    @Around("servicePointcut()")
    public Object logService(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        String sanitizedArgs = sanitizeArgs(joinPoint.getArgs());

        log.debug("Entering service method: {} with args={}", methodName, sanitizedArgs);

        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            log.debug("Exiting service method: {} [duration={}ms, success=true]", methodName, duration);
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - start;
            log.error("Service method failed: {} [duration={}ms] with error={}", methodName, duration, ex.getMessage());
            throw ex;
        }
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }

    private String prefixOf(String apiKey) {
        if (apiKey == null || apiKey.length() < 8) return "none";
        return apiKey.substring(0, 8) + "...";
    }

    private String sanitizeArgs(Object[] args) {
        if (args == null || args.length == 0) return "[]";
        return Arrays.stream(args)
                .map(arg -> arg == null ? "null" : arg.getClass().getSimpleName())
                .collect(Collectors.joining(", ", "[", "]"));
    }
}
