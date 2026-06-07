package com.emenu.features.spaces.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

public final class StorageNameUtil {

    private static final DateTimeFormatter DATETIME_FMT =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss").withZone(ZoneOffset.UTC);

    private StorageNameUtil() {}

    /**
     * Current date folder.
     * Example: 2024-06-07
     */
    public static String dateFolder() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        return today.getYear()
                + "-" + String.format("%02d", today.getMonthValue())
                + "-" + String.format("%02d", today.getDayOfMonth());
    }

    /**
     * Datetime-based unique base name.
     * Example: 20240607T143022-a3f2
     */
    public static String generate() {
        String ts   = DATETIME_FMT.format(Instant.now());
        String rand = String.format("%04x", ThreadLocalRandom.current().nextInt(0xFFFF));
        return ts + "-" + rand;
    }

    /** 20240607T143022-a3f2.jpg */
    public static String generateName() {
        return generate() + ".jpg";
    }

    /** 20240607T143022-a3f2-sm.jpg */
    public static String generateName(String suffix) {
        return generate() + "-" + suffix + ".jpg";
    }

    /** Base without extension — 20240607T143022-a3f2 */
    public static String generateBase() {
        return generate();
    }
}
