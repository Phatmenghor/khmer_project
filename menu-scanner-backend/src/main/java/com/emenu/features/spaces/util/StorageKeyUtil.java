package com.emenu.features.spaces.util;

import java.util.UUID;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    /** b/{businessId}/yyyy-MM-dd/20240607T143022-a3f2.webp */
    public static String key(UUID businessId, String name) {
        return "b/" + businessId + "/" + StorageNameUtil.dateFolder() + "/" + name;
    }

    /** b/{businessId}/ */
    public static String businessPrefix(UUID businessId) {
        return "b/" + businessId + "/";
    }

    /** owner/yyyy-MM-dd/20240607T143022-a3f2.webp — shared owner path, no id needed */
    public static String ownerKey(String name) {
        return "owner/" + StorageNameUtil.dateFolder() + "/" + name;
    }
}
