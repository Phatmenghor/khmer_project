package com.emenu.shared.validation;

import com.emenu.exception.custom.ValidationException;
import java.util.UUID;
import java.util.function.Supplier;
import lombok.experimental.UtilityClass;

@UtilityClass
public class ValidationUtils {

    public static <T> T requireNonNull(T value, String fieldName) {
        if (value == null) {
            throw new ValidationException(fieldName + " cannot be null");
        }
        return value;
    }

    public static <T> T requireNonNull(T value, Supplier<String> messageSupplier) {
        if (value == null) {
            throw new ValidationException(messageSupplier.get());
        }
        return value;
    }

    public static String requireNonEmpty(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(fieldName + " cannot be empty");
        }
        return value.trim();
    }

    public static <T> T requireNonNull(T value, String fieldName, String customMessage) {
        if (value == null) {
            throw new ValidationException(customMessage);
        }
        return value;
    }

    public static UUID parseUUID(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ValidationException(fieldName + " cannot be empty");
        }

        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid " + fieldName + " format");
        }
    }

    public static void validateNotEqual(Object value1, Object value2, String message) {
        if (value1 != null && value1.equals(value2)) {
            throw new ValidationException(message);
        }
    }

    public static void validateEqual(Object value1, Object value2, String message) {
        if (value1 == null || !value1.equals(value2)) {
            throw new ValidationException(message);
        }
    }
}
