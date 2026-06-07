package com.emenu.features.spaces.util;

import java.util.UUID;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    /** Full object key: b/{businessId}/{subPath} */
    public static String key(UUID businessId, String subPath) {
        return "b/" + businessId + "/" + subPath;
    }

    /** Prefix for deleting everything under a business: b/{businessId}/ */
    public static String businessPrefix(UUID businessId) {
        return "b/" + businessId + "/";
    }
}
