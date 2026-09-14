package com.emenu;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.LocalDateTime;
import java.util.TimeZone;

@SpringBootApplication
@Slf4j
public class PaymentGatewayApplication {

    public static final String CAMBODIA_TIMEZONE = "Asia/Phnom_Penh";

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone(CAMBODIA_TIMEZONE));
    }

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone(CAMBODIA_TIMEZONE));
        SpringApplication.run(PaymentGatewayApplication.class, args);

        LocalDateTime jvmNow = LocalDateTime.now();

        log.info("Bakong Payment Service started. timezone={}, time={}, hour={}",
                TimeZone.getDefault().getID(), jvmNow, jvmNow.getHour());
        log.info("Swagger UI: http://localhost:7073/swagger-ui/index.html");
        log.info("Health check: http://localhost:7073/actuator/health");
    }
}
