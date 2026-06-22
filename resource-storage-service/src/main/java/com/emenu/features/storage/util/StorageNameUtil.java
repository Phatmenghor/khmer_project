package com.emenu.features.storage.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

public final class StorageNameUtil {

    private static final DateTimeFormatter DATETIME_FMT =
            DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss").withZone(ZoneOffset.UTC);

    private StorageNameUtil() {}

    public static String dateFolder() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        return today.getYear()
                + "-" + String.format("%02d", today.getMonthValue())
                + "-" + String.format("%02d", today.getDayOfMonth());
    }

    public static String generate() {
        String ts   = DATETIME_FMT.format(Instant.now());
        String rand = String.format("%04x", ThreadLocalRandom.current().nextInt(0xFFFF));
        return ts + "-" + rand;
    }

    public static String generateName() {
        return generate() + ".jpg";
    }

    public static String generateName(String suffix) {
        return generate() + "-" + suffix + ".jpg";
    }

    public static String generateBase() {
        return generate();
    }
}
