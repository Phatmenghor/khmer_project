package com.emenu.features.spaces.util;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

public final class StorageNameUtil {

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss").withZone(ZoneOffset.UTC);

    private StorageNameUtil() {}

    /**
     * Generate a datetime-based unique name.
     * Format: yyyyMMddTHHmmss-{4 hex}
     * Example: 20240607T143022-a3f2
     *
     * Sortable by time, unique enough for concurrent uploads,
     * and human-readable.
     */
    public static String generate() {
        String ts = FMT.format(Instant.now());
        String rand = String.format("%04x", ThreadLocalRandom.current().nextInt(0xFFFF));
        return ts + "-" + rand;
    }

    /**
     * Generate with a size suffix appended.
     * Example: 20240607T143022-a3f2-sm.webp
     */
    public static String generate(String suffix) {
        return generate() + "-" + suffix + ".webp";
    }
}
