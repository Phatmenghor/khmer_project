package com.emenu.features.bakong.util;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class TransactionIdGenerator {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static String lastTimestamp = "";

    /**
     * Generates a unique system transaction ID.
     * Format: TXN-YYYYMMDDHHMMSS (e.g. TXN-20260915114600)
     */
    public static synchronized String generateTransactionId() {
        String timestamp = LocalDateTime.now().format(DATE_FORMATTER);
        if (timestamp.equals(lastTimestamp)) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            timestamp = LocalDateTime.now().format(DATE_FORMATTER);
        }
        lastTimestamp = timestamp;
        return "TXN-" + timestamp;
    }
}
