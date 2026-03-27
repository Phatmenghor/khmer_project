package com.emenu.features.auth.util;

import com.emenu.enums.user.UserType;
import com.emenu.exception.custom.ValidationException;
import lombok.experimental.UtilityClass;

@UtilityClass
public class EnumNormalizer {

    public static UserType normalizeUserType(UserType userType) {
        if (userType == null) {
            throw new ValidationException("User type cannot be null");
        }
        try {
            String normalized = userType.toString()
                    .toUpperCase()
                    .trim()
                    .replace(" ", "_");
            return UserType.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid user type: " + userType);
        }
    }

    public static String normalizeString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.toUpperCase()
                .trim()
                .replace(" ", "_");
    }
}
