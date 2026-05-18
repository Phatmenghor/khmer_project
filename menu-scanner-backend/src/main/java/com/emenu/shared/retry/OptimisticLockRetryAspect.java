package com.emenu.shared.retry;

import jakarta.persistence.OptimisticLockException;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.hibernate.StaleStateException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Order(Ordered.LOWEST_PRECEDENCE - 1)
@Slf4j
public class OptimisticLockRetryAspect {

    @Around("@annotation(retryAnnotation)")
    public Object retryOnOptimisticLock(ProceedingJoinPoint joinPoint,
                                         RetryOnOptimisticLock retryAnnotation) throws Throwable {
        int maxRetries = retryAnnotation.maxRetries();
        String methodName = joinPoint.getSignature().toShortString();

        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return joinPoint.proceed();
            } catch (OptimisticLockException | StaleStateException |
                     ObjectOptimisticLockingFailureException ex) {
                if (attempt >= maxRetries) {
                    log.warn("OptimisticLockException in {} after {} retries, giving up",
                            methodName, maxRetries);
                    throw ex;
                }
                log.info("OptimisticLockException in {}, retrying ({}/{})",
                        methodName, attempt + 1, maxRetries);
            }
        }
        return joinPoint.proceed();
    }
}
