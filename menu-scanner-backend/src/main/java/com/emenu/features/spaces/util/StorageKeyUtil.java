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
}
