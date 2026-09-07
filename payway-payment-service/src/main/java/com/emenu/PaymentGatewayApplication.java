package com.emenu;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.TimeZone;

@SpringBootApplication
@Slf4j
public class PaymentGatewayApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Phnom_Penh"));
        SpringApplication.run(PaymentGatewayApplication.class, args);

        ZonedDateTime cambodiaTime = ZonedDateTime.now(ZoneId.of("Asia/Phnom_Penh"));
        LocalDateTime jvmNow = LocalDateTime.now();

        log.info("Bakong Payment Service started. timezone={}, time={}, hour={}",
                TimeZone.getDefault().getID(), jvmNow, jvmNow.getHour());
        log.info("Swagger UI: http://localhost:7073/swagger-ui/index.html");
        log.info("Health check: http://localhost:7073/actuator/health");
    }
}
