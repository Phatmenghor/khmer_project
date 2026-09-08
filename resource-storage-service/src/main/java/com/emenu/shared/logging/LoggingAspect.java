package com.emenu.shared.logging;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.stream.Collectors;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingAspect {

    private final ObjectMapper objectMapper;

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void controllerPointcut() {}

    @Pointcut("within(@org.springframework.stereotype.Service *)")
    public void servicePointcut() {}

    @Around("controllerPointcut()")
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = getRequest();
        String method = request != null ? request.getMethod() : "UNKNOWN";
        String uri = request != null ? request.getRequestURI() : "UNKNOWN";
        String queryString = (request != null && request.getQueryString() != null) ? "?" + request.getQueryString() : "";
        String remoteAddr = request != null ? getClientIp(request) : "UNKNOWN";
        String methodName = joinPoint.getSignature().toShortString();
        String apiKeyPrefix = request != null ? prefixOf(request.getHeader("X-API-Key")) : "none";

        String reqArgs = formatArgs(joinPoint.getArgs());

        log.info("--> AUDIT REQUEST [{} {}{}] ip={} [apiKey={}, handler={}] payload={}",
                method, uri, queryString, remoteAddr, apiKeyPrefix, methodName, reqArgs);

        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;

            if (result instanceof Mono<?> mono) {
                return mono.doOnNext(val -> {
                    long execTime = System.currentTimeMillis() - start;
                    log.info("<-- AUDIT RESPONSE [{} {}{}] [duration={}ms] payload={}",
                            method, uri, queryString, execTime, formatResult(val));
                }).doOnError(err -> {
                    long execTime = System.currentTimeMillis() - start;
                    log.error("<-- AUDIT RESPONSE ERROR [{} {}{}] [duration={}ms] error={}",
                            method, uri, queryString, execTime, err.getMessage());
                });
            } else if (result instanceof Flux<?> flux) {
                return flux.doOnNext(val -> {
                    log.info("<-- AUDIT STREAM EVENT [{} {}{}] payload={}",
                            method, uri, queryString, formatResult(val));
                }).doOnError(err -> {
                    long execTime = System.currentTimeMillis() - start;
                    log.error("<-- AUDIT STREAM ERROR [{} {}{}] [duration={}ms] error={}",
                            method, uri, queryString, execTime, err.getMessage());
                });
            }

            String resBody = formatResult(result);
            log.info("<-- AUDIT RESPONSE [{} {}{}] [duration={}ms] payload={}",
                    method, uri, queryString, duration, resBody);
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - start;
            log.error("<-- AUDIT RESPONSE ERROR [{} {}{}] [duration={}ms] error={}",
                    method, uri, queryString, duration, ex.getMessage());
            throw ex;
        }
    }

    @Around("servicePointcut()")
    public Object logService(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        String sanitizedArgs = formatArgs(joinPoint.getArgs());

        log.debug("Entering service method: {} with args={}", methodName, sanitizedArgs);

        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            if (result instanceof Mono<?> mono) {
                return mono.doOnNext(val -> {
                    long execTime = System.currentTimeMillis() - start;
                    log.debug("Exiting service reactive method: {} [duration={}ms, success=true] result={}",
                            methodName, execTime, formatResult(val));
                }).doOnError(err -> {
                    long execTime = System.currentTimeMillis() - start;
                    log.error("Service reactive method failed: {} [duration={}ms] error={}",
                            methodName, execTime, err.getMessage());
                });
            } else if (result instanceof Flux<?> flux) {
                return flux.doOnNext(val -> {
                    log.debug("Service reactive stream item: {} result={}", methodName, formatResult(val));
                }).doOnError(err -> {
                    long execTime = System.currentTimeMillis() - start;
                    log.error("Service reactive stream failed: {} [duration={}ms] error={}",
                            methodName, execTime, err.getMessage());
                });
            }
            log.debug("Exiting service method: {} [duration={}ms, success=true] result={}",
                    methodName, duration, formatResult(result));
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - start;
            log.error("Service method failed: {} [duration={}ms] error={}", methodName, duration, ex.getMessage());
            throw ex;
        }
    }

    private HttpServletRequest getRequest() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attrs != null ? attrs.getRequest() : null;
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String prefixOf(String apiKey) {
        if (apiKey == null || apiKey.length() < 8) return "none";
        return apiKey.substring(0, 8) + "...";
    }

    private String formatArgs(Object[] args) {
        if (args == null || args.length == 0) return "[]";
        return Arrays.stream(args)
                .filter(arg -> !(arg instanceof ServletRequest) && !(arg instanceof ServletResponse))
                .map(this::safeSerialize)
                .collect(Collectors.joining(", ", "[", "]"));
    }

    private String formatResult(Object result) {
        if (result == null) return "null";
        if (result instanceof ResponseEntity<?> re) {
            return "ResponseEntity(status=" + re.getStatusCode() + ", body=" + safeSerialize(re.getBody()) + ")";
        }
        return safeSerialize(result);
    }

    private String safeSerialize(Object obj) {
        if (obj == null) return "null";
        if (obj instanceof byte[] bytes) {
            return "byte[" + bytes.length + "]";
        }
        if (obj instanceof MultipartFile file) {
            return "MultipartFile(name=" + file.getOriginalFilename() + ", size=" + file.getSize() + "B)";
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }
}
