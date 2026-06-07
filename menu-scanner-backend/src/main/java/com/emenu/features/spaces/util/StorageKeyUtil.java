package com.emenu.features.spaces.util;

import java.util.UUID;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    /**
     * Full object key.
     * Pattern: b/{businessId}/yyyy-MM-dd/{name}
     * Example: b/uuid/2024-06-07/20240607T143022-a3f2-sm.webp
     */
    public static String key(UUID businessId, String name) {
        return "b/" + businessId + "/" + StorageNameUtil.dateFolder() + "/" + name;
    }

    /** b/{businessId}/ */
    public static String businessPrefix(UUID businessId) {
        return "b/" + businessId + "/";
    }

    /** b/{businessId}/yyyy- — matches all dates in that year */
    public static String yearPrefix(UUID businessId, int year) {
        return "b/" + businessId + "/" + year + "-";
    }

    /** b/{businessId}/yyyy-MM- — matches all dates in that month */
    public static String monthPrefix(UUID businessId, int year, int month) {
        return "b/" + businessId + "/" + year + "-" + String.format("%02d", month) + "-";
    }

    /** b/{businessId}/yyyy-MM-dd/ — matches exactly that day */
    public static String dayPrefix(UUID businessId, int year, int month, int day) {
        return "b/" + businessId + "/" + year
                + "-" + String.format("%02d", month)
                + "-" + String.format("%02d", day) + "/";
    }
}
