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
import org.springframework.web.multipart.MultipartFile;

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
            log.error("Exception in service method: {} [duration={}ms] with message={}", methodName, duration, ex.getMessage());
            throw ex;
        }
    }

    private HttpServletRequest getRequest() {
        var attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }

    private String prefixOf(String apiKey) {
        if (apiKey == null || apiKey.length() < 12) return "***";
        return apiKey.substring(0, 12) + "***";
    }

    private String sanitizeArgs(Object[] args) {
        if (args == null || args.length == 0) {
            return "[]";
        }
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < args.length; i++) {
            if (i > 0) sb.append(", ");
            Object arg = args[i];
            if (arg == null) {
                sb.append("null");
            } else if (arg instanceof MultipartFile file) {
                sb.append("MultipartFile(name=").append(file.getOriginalFilename())
                        .append(", size=").append(file.getSize()).append("B)");
            } else {
                String argStr = arg.toString();
                sb.append(argStr.length() > 100 ? argStr.substring(0, 97) + "..." : argStr);
            }
        }
        sb.append("]");
        return sb.toString();
    }
}
