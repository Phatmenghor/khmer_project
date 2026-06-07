package com.emenu.features.spaces.util;

import java.util.UUID;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    /**
     * Full object key.
     * Pattern: b/{businessId}/{week}/{name}
     * Example: b/uuid/2024-W23/20240607T143022-a3f2-sm.webp
     */
    public static String key(UUID businessId, String name) {
        return "b/" + businessId + "/" + StorageNameUtil.weekFolder() + "/" + name;
    }

    /**
     * Business-level prefix — wipes everything for a business.
     * b/{businessId}/
     */
    public static String businessPrefix(UUID businessId) {
        return "b/" + businessId + "/";
    }

    /**
     * Week-level prefix — wipes one week of uploads for a business.
     * b/{businessId}/{week}/
     */
    public static String weekPrefix(UUID businessId, String week) {
        return "b/" + businessId + "/" + week + "/";
    }
}
