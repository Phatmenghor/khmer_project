package com.emenu.shared.logging;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *) || within(@org.springframework.stereotype.Controller *)")
    public void controllerPointcut() {}

    @Pointcut("within(@org.springframework.stereotype.Service *)")
    public void servicePointcut() {}

    @Around("controllerPointcut()")
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = getRequest();
        String method = request != null ? request.getMethod() : "UNKNOWN";
        String uri = request != null ? request.getRequestURI() : "UNKNOWN";
        String username = getUsername();
        String methodName = joinPoint.getSignature().toShortString();

        log.debug("Received {} request to endpoint={} [user={}, method={}]", method, uri, username, methodName);

        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long duration = System.currentTimeMillis() - start;
            log.debug("Request completed successfully endpoint={} [duration={}ms, user={}]", uri, duration, username);
            return result;
        } catch (Throwable ex) {
            long duration = System.currentTimeMillis() - start;
            log.error("Request failed endpoint={} [duration={}ms, user={}] with message={}", uri, duration, username, ex.getMessage());
            throw ex;
        }
    }

    @Around("servicePointcut()")
    public Object logService(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        Object[] args = joinPoint.getArgs();
        String sanitizedArgs = sanitizeArgs(args);

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

    private String getUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return "anonymous";
        }
        return auth.getName();
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
            } else {
                String className = arg.getClass().getSimpleName();
                String argStr = arg.toString();

                if (lowerContains(className, "LoginRequest")) {
                    sb.append("LoginRequest(userIdentifier=***, userType=***)");
                } else if (lowerContains(className, "RegisterRequest")) {
                    sb.append("RegisterRequest(email=***, userType=***)");
                } else if (lowerContains(className, "PasswordChangeRequest", "AdminPasswordResetRequest", "RefreshTokenRequest", "SocialAuthRequest")) {
                    sb.append(className).append("(***sensitive data hidden***)");
                } else {
                    String lower = argStr.toLowerCase();
                    if (lowerContains(lower, "password", "token", "secret", "jwt", "credential", "otp", "auth", "privatekey", "apikey")) {
                        sb.append(className).append("(***sensitive data hidden***)");
                    } else {
                        if (argStr.length() > 100) {
                            sb.append(argStr, 0, 97).append("...");
                        } else {
                            sb.append(argStr);
                        }
                    }
                }
            }
        }
        sb.append("]");
        return sb.toString();
    }

    private boolean lowerContains(String str, String... patterns) {
        String lowerStr = str.toLowerCase();
        for (String p : patterns) {
            if (lowerStr.contains(p.toLowerCase())) return true;
        }
        return false;
    }
}
