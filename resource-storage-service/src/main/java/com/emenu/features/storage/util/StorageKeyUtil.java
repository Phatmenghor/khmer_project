package com.emenu.features.storage.util;

public final class StorageKeyUtil {

    private StorageKeyUtil() {}

    public static String resolvePath(String keyPath, String customPath) {
        return keyPath.replaceAll("/+$", "") + "/" + customPath.replaceAll("^/+", "");
    }

    public static String key(String resolvedPath, String name) {
        return resolvedPath + "/" + StorageNameUtil.dateFolder() + "/" + name;
    }

    public static String prefix(String resolvedPath) {
        return resolvedPath + "/";
    }
}
