package com.emenu.features.spaces.util;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.time.LocalDate;
import java.util.concurrent.ThreadLocalRandom;

public final class StorageNameUtil {

    private static final DateTimeFormatter DATETIME_FMT =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss").withZone(ZoneOffset.UTC);

    private StorageNameUtil() {}

    /**
     * Current ISO week folder.
     * Example: 2024-W23
     */
    public static String weekFolder() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        int week = today.get(WeekFields.ISO.weekOfWeekBasedYear());
        int year = today.get(WeekFields.ISO.weekBasedYear());
        return year + "-W" + String.format("%02d", week);
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

    /**
     * Full filename with size suffix.
     * Example: 20240607T143022-a3f2-sm.webp
     */
    public static String generate(String size) {
        return generate() + "-" + size + ".webp";
    }
}
