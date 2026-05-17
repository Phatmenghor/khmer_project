package com.emenu.shared.utils;

import com.emenu.shared.constants.AuthConstants;
import lombok.experimental.UtilityClass;

@UtilityClass
public class TokenUtils {

    public static String extractTokenFromAuthHeader(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith(AuthConstants.JWT_BEARER_PREFIX)) {
            return null;
        }
        return authorizationHeader.substring(AuthConstants.JWT_BEARER_PREFIX.length()).trim();
    }

    public static String buildAuthorizationHeader(String token) {
        return AuthConstants.JWT_BEARER_PREFIX + token;
    }

    public static boolean isValidAuthHeader(String authorizationHeader) {
        return authorizationHeader != null && authorizationHeader.startsWith(AuthConstants.JWT_BEARER_PREFIX);
    }
}
