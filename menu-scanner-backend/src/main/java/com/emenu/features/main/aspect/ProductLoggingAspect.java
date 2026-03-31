package com.emenu.features.main.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.UUID;

/**
 * AOP Aspect for comprehensive logging of all Product-related operations.
 * Automatically logs method entry, exit, execution time, and errors for:
 * - ProductController (all endpoints)
 * - PublicProductController (all endpoints)
 * - ProductServiceImpl (all business logic)
 */
@Aspect
@Component
@Slf4j
public class ProductLoggingAspect {

    /**
     * Log all Product Controller methods
     */
    @Around("execution(* com.emenu.features.main.controller.ProductController.*(..))")
    public Object logProductController(ProceedingJoinPoint joinPoint) throws Throwable {
        return logOperation("CONTROLLER", joinPoint);
    }

    /**
     * Log all Public Product Controller methods
     */
    @Around("execution(* com.emenu.features.main.controller.PublicProductController.*(..))")
    public Object logPublicProductController(ProceedingJoinPoint joinPoint) throws Throwable {
        return logOperation("PUBLIC_CONTROLLER", joinPoint);
    }

    /**
     * Log all Product Service Implementation methods (excluding internal helpers)
     */
    @Around("execution(public * com.emenu.features.main.service.impl.ProductServiceImpl.*(..))")
    public Object logProductService(ProceedingJoinPoint joinPoint) throws Throwable {
        return logOperation("SERVICE", joinPoint);
    }

    /**
     * Main logging logic
     */
    private Object logOperation(String layer, ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String methodName = signature.getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String[] paramNames = signature.getParameterNames();
        Object[] paramValues = joinPoint.getArgs();

        // Build operation identifier
        String operationId = buildOperationId(methodName, paramValues);
        String params = buildParamString(paramNames, paramValues);

        // Log method entry
        log.info("[{}_ENTRY] {}#{} | Operation={} | Params={}",
            layer, className, methodName, operationId, params);

        long startTime = System.currentTimeMillis();
        Object result = null;
        Exception caughtException = null;

        try {
            // Execute the actual method
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            caughtException = e;
            long duration = System.currentTimeMillis() - startTime;
            log.error("[{}_ERROR] {}#{} | Operation={} | Error={} | Duration={}ms",
                layer, className, methodName, operationId, e.getMessage(), duration, e);
            throw e;
        } finally {
            // Log method exit (even if exception occurred)
            if (caughtException == null) {
                long duration = System.currentTimeMillis() - startTime;
                String resultInfo = buildResultInfo(result);
                log.info("[{}_EXIT] {}#{} | Operation={} | Result={} | Duration={}ms",
                    layer, className, methodName, operationId, resultInfo, duration);
            }
        }
    }

    /**
     * Build operation identifier from method name and parameters
     */
    private String buildOperationId(String methodName, Object[] paramValues) {
        // For methods with UUID parameter (usually first parameter)
        if (paramValues.length > 0 && paramValues[0] instanceof UUID) {
            return methodName + ":" + paramValues[0];
        }

        // For bulk operations
        if (methodName.contains("Bulk") && paramValues.length > 0) {
            Object param = paramValues[0];
            if (param != null && param.toString().contains("ProductIds")) {
                return methodName + ":multiProduct";
            }
        }

        return methodName;
    }

    /**
     * Build parameter string for logging
     */
    private String buildParamString(String[] paramNames, Object[] paramValues) {
        if (paramNames == null || paramNames.length == 0) {
            return "NONE";
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < paramNames.length; i++) {
            if (i > 0) sb.append(", ");

            String paramName = paramNames[i];
            Object paramValue = paramValues[i];

            // Handle different parameter types
            if (paramValue instanceof UUID) {
                sb.append(paramName).append("=").append(paramValue);
            } else if (paramValue instanceof String) {
                sb.append(paramName).append("=").append(paramValue);
            } else if (paramValue instanceof Boolean) {
                sb.append(paramName).append("=").append(paramValue);
            } else if (paramValue instanceof Number) {
                sb.append(paramName).append("=").append(paramValue);
            } else if (paramValue != null) {
                // For complex objects, just show class name and toString summary
                String className = paramValue.getClass().getSimpleName();
                String summary = getSummaryOfObject(paramValue);
                sb.append(paramName).append("=").append(className).append(summary);
            } else {
                sb.append(paramName).append("=null");
            }
        }
        return sb.toString();
    }

    /**
     * Get summary of complex objects for logging
     */
    private String getSummaryOfObject(Object obj) {
        try {
            String str = obj.toString();
            if (str.length() > 100) {
                return "{" + str.substring(0, 100) + "...}";
            }
            return "{" + str + "}";
        } catch (Exception e) {
            return "{object}";
        }
    }

    /**
     * Build result information for logging
     */
    private String buildResultInfo(Object result) {
        if (result == null) {
            return "null";
        }

        try {
            String className = result.getClass().getSimpleName();

            // For DTOs, try to extract ID
            if (className.contains("Dto")) {
                try {
                    Object id = result.getClass().getMethod("getId").invoke(result);
                    return className + "[id=" + id + "]";
                } catch (Exception e) {
                    // ID extraction failed, just return class name
                }
            }

            // For response objects
            if (className.contains("Response")) {
                return className;
            }

            // For maps/collections
            if (result instanceof java.util.Map) {
                java.util.Map<?, ?> map = (java.util.Map<?, ?>) result;
                return className + "[size=" + map.size() + "]";
            }

            if (result instanceof java.util.Collection) {
                java.util.Collection<?> col = (java.util.Collection<?>) result;
                return className + "[size=" + col.size() + "]";
            }

            return className;
        } catch (Exception e) {
            return result.getClass().getSimpleName();
        }
    }
}
