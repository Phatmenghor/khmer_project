package com.emenu.features.bakong.component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Future;

@Component
@RequiredArgsConstructor
@Slf4j
public class BakongReactiveExecutor {

    private final ExecutorService bakongExecutorService;

    public <T> Mono<T> executeReactive(String operation, Callable<T> task) {
        return Mono.create(sink -> {
            Future<?> future = bakongExecutorService.submit(() -> {
                try {
                    log.debug("Executing Bakong reactive task for operation=[{}]", operation);
                    sink.success(task.call());
                } catch (Throwable throwable) {
                    log.error("Error executing Bakong reactive operation=[{}]: {}", operation, throwable.getMessage(), throwable);
                    sink.error(throwable);
                }
            });

            sink.onCancel(() -> {
                log.debug("Cancelling Bakong reactive operation=[{}]", operation);
                future.cancel(true);
            });
            sink.onDispose(() -> {
                if (!future.isDone()) {
                    log.debug("Disposing Bakong reactive operation=[{}]", operation);
                    future.cancel(true);
                }
            });
        });
    }
}
