/**
 * Centralized alert and warning messages for the client frontend
 */

export const AlertMessages = {
  // Account Status
  account: {
    inactive: "Your account is inactive. Please contact the system owner for assistance.",
    locked: "Your account is locked. Please contact support to resolve this issue.",
    ended: "Your account employment has ended. Please contact support for more information.",
    deleted: "Your account has been deleted. If you believe this is an error, please contact support.",
    disabledPlatform: "Account has been disabled by the platform administrator.",
  },

  // Subscription Warnings & Errors
  subscription: {
    active: "Your business subscription is active.",
    expired: "Your business subscription has expired. Please renew your subscription to continue using the platform.",
    expiringSoon: "Your business subscription is expiring soon. Please renew to avoid service interruption.",
    gracePeriod: (expirationDate: string, daysRemaining: number) =>
      `Your subscription expired on ${expirationDate}. You have ${daysRemaining} days remaining in the grace period to renew your subscription.`,
    gracePeriodExpired: "Your subscription grace period has expired. Please renew your subscription to regain access.",
  },

  // Business Status
  business: {
    inactive: "Your business account is currently inactive. Please contact support.",
    suspended: "Your business account is currently suspended. Please contact support.",
    notFound: "Business account not found. Please check your account details.",
  },

  // Stock Warnings
  stock: {
    low: (itemName: string) => `Stock is running low for ${itemName}`,
    outOfStock: (itemName: string) => `${itemName} is out of stock`,
    unavailable: (itemName: string) => `${itemName} is currently unavailable`,
  },

  // Auth Error Messages
  auth: {
    invalidPassword: "Your password is incorrect. Please try again or reset your password if you've forgotten it.",
    accountNotFound: "Account not found. Please check your user identifier.",
    invalidRefreshToken: "Invalid or expired refresh token. Please log in again.",
    userTypeRequired: "User type is required. Please specify your account type.",
  },
} as const;

/**
 * Alert types for UI component styling
 */
export type AlertType = 'error' | 'warning' | 'info' | 'success';

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  ERROR = 'error',      // Blocking issue - user cannot proceed
  WARNING = 'warning',  // Non-blocking warning - user can proceed but should be aware
  INFO = 'info',        // Informational message
  SUCCESS = 'success',  // Success confirmation
}

/**
 * Subscription alert categories
 */
export enum SubscriptionAlertCategory {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  GRACE_PERIOD = 'grace_period',
  GRACE_PERIOD_EXPIRED = 'grace_period_expired',
  EXPIRING_SOON = 'expiring_soon',
}

/**
 * Helper function to determine alert severity based on subscription status
 */
export const getSubscriptionAlertSeverity = (category: SubscriptionAlertCategory): AlertSeverity => {
  switch (category) {
    case SubscriptionAlertCategory.ACTIVE:
      return AlertSeverity.SUCCESS;
    case SubscriptionAlertCategory.GRACE_PERIOD:
    case SubscriptionAlertCategory.EXPIRING_SOON:
      return AlertSeverity.WARNING;
    case SubscriptionAlertCategory.EXPIRED:
    case SubscriptionAlertCategory.GRACE_PERIOD_EXPIRED:
      return AlertSeverity.ERROR;
    default:
      return AlertSeverity.INFO;
  }
};
