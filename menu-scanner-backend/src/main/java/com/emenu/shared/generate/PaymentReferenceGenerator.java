package com.emenu.shared.generate;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

@Component
@Slf4j
public class PaymentReferenceGenerator {

    private final AtomicLong counter = new AtomicLong(System.currentTimeMillis() % 10000);

    public String generateUniqueReference() {
        String reference = generateReference();
        log.info("Generated reference: {}", reference);
        return reference;
    }

    private String generateReference() {
        LocalDateTime now = LocalDateTime.now();
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String time = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        String millis = String.format("%03d", now.getNano() / 1000000);
        long counterValue = counter.incrementAndGet() % 10000;
        int random = ThreadLocalRandom.current().nextInt(1000, 9999);
        return String.format("PAY-%s-%s%s-%04d-%04d",
                date, time, millis, counterValue, random);
    }
}