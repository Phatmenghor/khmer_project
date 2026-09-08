package com.emenu.features.bakong.common.util;

public final class TextUtils {

    private TextUtils() {
    }

    public static String abbreviate(String value, int maxLength) {
        if (value == null) {
            return null;
        }

        if (value.length() <= maxLength) {
            return value;
        }

        return value.substring(0, Math.max(0, maxLength - 3)) + "...";
    }
}
