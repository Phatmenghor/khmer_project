package com.emenu.features.spaces.util;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    /** {projectCode}/{businessId}/yyyy-MM-dd/20240607T143022-a3f2.webp */
    public static String key(String projectCode, String businessId, String name) {
        return projectCode + "/" + businessId + "/" + StorageNameUtil.dateFolder() + "/" + name;
    }

    /** Legacy: b/{businessId}/yyyy-MM-dd/filename — kept for backward-compatible callers */
    public static String key(String businessId, String name) {
        return "b/" + businessId + "/" + StorageNameUtil.dateFolder() + "/" + name;
    }

    /** {projectCode}/{businessId}/ */
    public static String businessPrefix(String projectCode, String businessId) {
        return projectCode + "/" + businessId + "/";
    }

    /** Legacy: b/{businessId}/ — backward compat */
    public static String businessPrefix(String businessId) {
        return "b/" + businessId + "/";
    }

    /** owner/yyyy-MM-dd/filename — shared owner path, no id needed */
    public static String ownerKey(String name) {
        return "owner/" + StorageNameUtil.dateFolder() + "/" + name;
    }

    /** customer/yyyy-MM-dd/filename — shared customer path, no id needed */
    public static String customerKey(String name) {
        return "customer/" + StorageNameUtil.dateFolder() + "/" + name;
    }
}
