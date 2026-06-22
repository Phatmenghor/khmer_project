package com.emenu.features.spaces.util;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    /**
     * Build the resolved path.
     */
    public static String resolvePath(String keyPath, String customPath) {
        if (keyPath == null || keyPath.isBlank()) {
            return (customPath == null || customPath.isBlank()) ? null : customPath;
        }
        if (customPath == null || customPath.isBlank()) {
            return keyPath;
        }
        return keyPath.replaceAll("/+$", "") + "/" + customPath.replaceAll("^/+", "");
    }

    /**
     * Build a full storage key from projectCode, resolved path, and filename.
     */
    public static String key(String projectCode, String resolvedPath, String name) {
        if (resolvedPath != null && !resolvedPath.isBlank()) {
            return projectCode + "/" + resolvedPath + "/" + StorageNameUtil.dateFolder() + "/" + name;
        }
        return projectCode + "/" + StorageNameUtil.dateFolder() + "/" + name;
    }

    /**
     * The folder prefix for all objects stored under this key's context.
     * Used for bulk-delete operations.
     */
    public static String prefix(String projectCode, String resolvedPath) {
        if (resolvedPath != null && !resolvedPath.isBlank()) {
            return projectCode + "/" + resolvedPath + "/";
        }
        return projectCode + "/";
    }
}
