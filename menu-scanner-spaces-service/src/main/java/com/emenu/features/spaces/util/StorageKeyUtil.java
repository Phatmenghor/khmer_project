package com.emenu.features.spaces.util;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    /**
     * Build the resolved path: the API key's pathStore with customPath appended.
     */
    public static String resolvePath(String keyPath, String customPath) {
        return keyPath.replaceAll("/+$", "") + "/" + customPath.replaceAll("^/+", "");
    }

    /**
     * Build a full storage key from the resolved path and filename.
     */
    public static String key(String resolvedPath, String name) {
        return resolvedPath + "/" + StorageNameUtil.dateFolder() + "/" + name;
    }

    /**
     * The folder prefix for all objects stored under this key's context.
     * Used for bulk-delete operations.
     */
    public static String prefix(String resolvedPath) {
        return resolvedPath + "/";
    }
}
