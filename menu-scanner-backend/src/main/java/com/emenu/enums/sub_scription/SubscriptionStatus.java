package com.emenu.enums.sub_scription;

import lombok.Getter;

@Getter
public enum SubscriptionStatus {
    ACTIVE("Active", "Subscription is currently active"),
    EXPIRED("Expired", "Subscription has expired"),
    EXPIRING_SOON("Expiring Soon", "Subscription expiring within specified days"),
    CANCELLED("Cancelled", "Subscription has been cancelled");

    private final String displayName;
    private final String description;

    SubscriptionStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public boolean isActive() {
        return this == ACTIVE;
    }

    public boolean isExpired() {
        return this == EXPIRED;
    }

    public boolean isExpiringSoon() {
        return this == EXPIRING_SOON;
    }

    public boolean isCancelled() {
        return this == CANCELLED;
    }
}