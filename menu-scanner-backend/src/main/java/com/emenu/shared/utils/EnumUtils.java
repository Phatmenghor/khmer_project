package com.emenu.shared.utils;

import com.emenu.exception.custom.ValidationException;
import lombok.experimental.UtilityClass;

@UtilityClass
public class EnumUtils {

    public static <T extends Enum<T>> T parseEnum(String value, Class<T> enumType, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName + " cannot be null");
        }

        try {
            String normalized = normalize(value);
            return Enum.valueOf(enumType, normalized);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid " + fieldName + ": " + value);
        }
    }

    public static <T extends Enum<T>> T parseEnumOrNull(String value, Class<T> enumType) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        try {
            String normalized = normalize(value);
            return Enum.valueOf(enumType, normalized);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public static String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.toUpperCase()
                .trim()
                .replace(" ", "_")
                .replace("-", "_");
    }

    public static String normalizeOrThrow(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(fieldName + " cannot be empty");
        }
        return normalize(value);
    }
}
