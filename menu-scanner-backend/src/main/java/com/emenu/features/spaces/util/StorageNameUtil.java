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
     * Current date folder — nested yyyy/MM/dd.
     * Example: 2024/06/07
     *
     * Allows prefix-delete by year (2024/), month (2024/06/), or day (2024/06/07/).
     */
    public static String dateFolder() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        return today.getYear()
                + "/" + String.format("%02d", today.getMonthValue())
                + "/" + String.format("%02d", today.getDayOfMonth());
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
