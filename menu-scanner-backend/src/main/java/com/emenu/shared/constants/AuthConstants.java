package com.emenu.shared.constants;

public final class AuthConstants {

    private AuthConstants() {
        throw new AssertionError("Cannot instantiate AuthConstants");
    }

    // JWT and Token
    public static final String JWT_BEARER_PREFIX = "Bearer ";
    public static final String JWT_BEARER_SCHEME = "Bearer";

    // System Roles
    public static final String ROLE_PLATFORM_OWNER = "PLATFORM_OWNER";
    public static final String ROLE_BUSINESS_OWNER = "BUSINESS_OWNER";
    public static final String ROLE_BUSINESS_USER = "BUSINESS_USER";
    public static final String ROLE_CUSTOMER = "CUSTOMER";
    public static final String ROLE_ADMIN = "ADMIN";

    // Session Operations
    public static final String SESSION_REASON_LOGOUT = "LOGOUT";
    public static final String SESSION_REASON_PASSWORD_CHANGE = "PASSWORD_CHANGE";
    public static final String SESSION_REASON_ADMIN_PASSWORD_RESET = "ADMIN_PASSWORD_RESET";
    public static final String SESSION_REASON_TOKEN_REFRESH = "TOKEN_REFRESH";
    public static final String SESSION_REASON_INVALID_TOKEN = "INVALID_TOKEN";
    public static final String SESSION_REASON_MANUAL_REVOKE = "MANUAL_REVOKE";

    // Default Business Settings
    public static final String DEFAULT_BUSINESS_NAME = "Emenu Scanner";
    public static final String DEFAULT_PRIMARY_COLOR = "#57823D";
    public static final String DEFAULT_SECONDARY_COLOR = "#F4C430";
    public static final String DEFAULT_ACCENT_COLOR = "#F2F3F7";
    public static final Double DEFAULT_TAX_PERCENTAGE = 0.0;

    // Device Types
    public static final String DEVICE_TYPE_MOBILE = "MOBILE";
    public static final String DEVICE_TYPE_TABLET = "TABLET";
    public static final String DEVICE_TYPE_DESKTOP = "DESKTOP";

    // Session Statuses
    public static final String SESSION_STATUS_ACTIVE = "ACTIVE";
    public static final String SESSION_STATUS_EXPIRED = "EXPIRED";
    public static final String SESSION_STATUS_REVOKED = "REVOKED";

    // Default Values
    public static final String UNKNOWN_IP = "Unknown";
    public static final String UNKNOWN_DEVICE = "Unknown";
    public static final long TOKEN_EXPIRATION_MS = 3600000; // 1 hour
}
