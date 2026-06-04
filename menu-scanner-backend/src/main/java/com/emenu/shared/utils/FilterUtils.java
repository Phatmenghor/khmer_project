package com.emenu.shared.utils;

import java.util.Collection;
import java.util.List;
import lombok.experimental.UtilityClass;

@UtilityClass
public final class FilterUtils {

    private FilterUtils() {}

    public static <T> List<T> nullIfEmpty(Collection<T> collection) {
        if (collection == null || collection.isEmpty()) {
            return null;
        }
        return collection instanceof List ? (List<T>) collection : List.copyOf(collection);
    }

    public static <T> boolean isNotEmpty(Collection<T> collection) {
        return collection != null && !collection.isEmpty();
    }

    public static <T> boolean isEmpty(Collection<T> collection) {
        return collection == null || collection.isEmpty();
    }
}
