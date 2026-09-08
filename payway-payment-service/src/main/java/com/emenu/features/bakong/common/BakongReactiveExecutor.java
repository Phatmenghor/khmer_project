package com.emenu.features.bakong.common;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Component
@Slf4j
public class BakongReactiveExecutor {

    private final ExecutorService bakongExecutorService = Executors.newCachedThreadPool();

    public <T> Mono<T> executeReactive(String operation, Callable<T> task) {
        Map<String, String> contextMap = MDC.getCopyOfContextMap();
        return Mono.create(sink -> {
            Future<?> future = bakongExecutorService.submit(() -> {
                if (contextMap != null) {
                    MDC.setContextMap(contextMap);
                }
                try {
                    sink.success(task.call());
                } catch (Throwable throwable) {
                    log.error("Reactive task [{}] failed: {}", operation, throwable.getMessage());
                    sink.error(throwable);
                } finally {
                    MDC.clear();
                }
            });

            sink.onCancel(() -> future.cancel(true));
            sink.onDispose(() -> {
                if (!future.isDone()) {
                    future.cancel(true);
                }
            });
        });
    }
}
