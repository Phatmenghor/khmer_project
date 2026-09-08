package com.emenu.features.bakong.common.component;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

@Component
@Slf4j
public class BakongReactiveExecutor {

    private final ExecutorService bakongExecutorService = Executors.newCachedThreadPool();

    public <T> Mono<T> executeReactive(String operation, Callable<T> task) {
        return Mono.create(sink -> {
            Future<?> future = bakongExecutorService.submit(() -> {
                try {
                    sink.success(task.call());
                } catch (Throwable throwable) {
                    log.error("Reactive task [{}] failed: {}", operation, throwable.getMessage());
                    sink.error(throwable);
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
