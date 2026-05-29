package com.emenu.shared.constants;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class AuthStatusMessages {

    private AuthStatusMessages() {
        throw new AssertionError("Cannot instantiate AuthStatusMessages");
    }

    // ================================
    // ACCOUNT STATUS MESSAGES
    // ================================
    public static final String ACCOUNT_INACTIVE = "Your account is inactive. Please contact the system owner for assistance.";
    public static final String ACCOUNT_LOCKED = "Your account is locked. Please contact support to resolve this issue.";
    public static final String ACCOUNT_ENDED = "Your account employment has ended. Please contact support for more information.";
    public static final String ACCOUNT_DELETED = "Your account has been deleted. If you believe this is an error, please contact support.";
    public static final String ACCOUNT_DISABLED_PLATFORM = "Account has been disabled by the platform administrator.";

    // ================================
    // SUBSCRIPTION MESSAGES (BUSINESS_USER ONLY)
    // ================================
    public static final String SUBSCRIPTION_ACTIVE = "Your business subscription is active.";
    public static final String SUBSCRIPTION_EXPIRED = "Your business subscription has expired. Please renew your subscription to continue using the platform.";
    public static final String SUBSCRIPTION_EXPIRING_SOON = "Your business subscription is expiring soon. Please renew to avoid service interruption.";
    public static final String SUBSCRIPTION_GRACE_PERIOD = "Your subscription expired on %s. You have %d days remaining in the grace period to renew your subscription.";
    public static final String SUBSCRIPTION_GRACE_PERIOD_EXPIRED = "Your subscription grace period has expired. Please renew your subscription to regain access.";

    // ================================
    // BUSINESS STATUS MESSAGES
    // ================================
    public static final String BUSINESS_INACTIVE = "Your business account is currently inactive. Please contact support.";
    public static final String BUSINESS_SUSPENDED = "Your business account is currently suspended. Please contact support.";
    public static final String BUSINESS_NOT_FOUND = "Business account not found. Please check your account details.";

    // ================================
    // AVAILABILITY/STOCK MESSAGES
    // ================================
    public static final String LOW_STOCK = "Stock is running low for %s";
    public static final String OUT_OF_STOCK = "%s is out of stock";
    public static final String ITEM_UNAVAILABLE = "%s is currently unavailable";

    // ================================
    // GRACE PERIOD CONFIGURATION
    // ================================
    public static final int SUBSCRIPTION_GRACE_PERIOD_DAYS = 7;

    // ================================
    // USER TYPE SPECIFIC NOTES
    // ================================
    // PLATFORM_USER: Only checks account status (no subscription)
    // BUSINESS_USER: Checks account status + subscription with grace period
    // CUSTOMER: Only checks account status (no subscription)

    /**
     * Format grace period message with expiration date and remaining days
     */
    public static String formatGracePeriodMessage(LocalDateTime expirationDate, long daysRemaining) {
        String dateStr = expirationDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        return String.format(SUBSCRIPTION_GRACE_PERIOD, dateStr, daysRemaining);
    }
}
