package com.emenu;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableTransactionManagement
@Slf4j
public class StorageApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Phnom_Penh"));
        SpringApplication.run(StorageApplication.class, args);

        ZonedDateTime cambodiaTime = ZonedDateTime.now(ZoneId.of("Asia/Phnom_Penh"));
        LocalDateTime jvmNow = LocalDateTime.now();

        log.info("Resource Storage Service started. timezone={}, time={}, hour={}",
                TimeZone.getDefault().getID(), jvmNow, jvmNow.getHour());
        log.info("Swagger UI: http://localhost:7072/swagger-ui/index.html");
        log.info("Health check: http://localhost:7072/actuator/health");
    }
}
