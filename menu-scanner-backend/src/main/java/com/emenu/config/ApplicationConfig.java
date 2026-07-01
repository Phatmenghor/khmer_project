package com.emenu.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalTimeSerializer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.AuditorAware;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestTemplate;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@RequiredArgsConstructor
@Slf4j
public class ApplicationConfig {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        JavaTimeModule javaTimeModule = new JavaTimeModule();
        javaTimeModule.addSerializer(LocalTime.class, new LocalTimeSerializer(TIME_FORMATTER));
        javaTimeModule.addDeserializer(LocalTime.class, new LocalTimeDeserializer(TIME_FORMATTER));

        // Global String trim: strips leading/trailing whitespace from every JSON String field.
        // Blank strings ("   ") are normalised to null.
        com.fasterxml.jackson.databind.module.SimpleModule trimModule =
                new com.fasterxml.jackson.databind.module.SimpleModule("StringTrimModule");
        trimModule.addDeserializer(String.class, new StringTrimDeserializer());

        return Jackson2ObjectMapperBuilder.json()
                .modules(javaTimeModule, trimModule)
                .featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
                .build();
    }

    @Bean
    public RestTemplate restTemplate(com.emenu.shared.logging.RestTemplateLoggingInterceptor loggingInterceptor) {
        // Always set timeouts — an unconfigured RestTemplate blocks the thread indefinitely
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(15_000);
        RestTemplate restTemplate = new RestTemplate(factory);
        restTemplate.setInterceptors(java.util.List.of(loggingInterceptor));
        return restTemplate;
    }

    @Bean(name = "telegramRestTemplate")
    public RestTemplate telegramRestTemplate(com.emenu.shared.logging.RestTemplateLoggingInterceptor loggingInterceptor) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);
        factory.setReadTimeout(10_000);
        RestTemplate restTemplate = new RestTemplate(factory);
        restTemplate.setInterceptors(java.util.List.of(loggingInterceptor));
        return restTemplate;
    }

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        log.info("Async task executor initialized: core={}, max={}, queue={}", 5, 20, 100);
        return executor;
    }

    @Bean
    public AuditorAware<String> auditorProvider() {
        return new SpringSecurityAuditorAware();
    }

    static class SpringSecurityAuditorAware implements AuditorAware<String> {
        @Override
        public Optional<String> getCurrentAuditor() {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return Optional.empty();
            }
            return Optional.of(auth.getName());
        }
    }
}
