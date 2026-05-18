package com.emenu.shared.logging;

import org.springframework.stereotype.Component;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class RequestIdGenerator {

    private static final AtomicLong sequence = new AtomicLong(0);
    private static final long START_TIME = System.currentTimeMillis();

    public String generateRequestId() {
        long timestamp = System.currentTimeMillis() - START_TIME;
        long seq = sequence.incrementAndGet() % 10000;
        String uuid = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return String.format("REQ-%d-%04d-%s", timestamp, seq, uuid);
    }
}
