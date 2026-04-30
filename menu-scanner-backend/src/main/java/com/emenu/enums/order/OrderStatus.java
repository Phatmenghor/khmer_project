package com.emenu.enums.order;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING("Pending"),
    CONFIRMED("Confirmed"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String displayName;

    OrderStatus(String displayName) {
        this.displayName = displayName;
    }

    public boolean isPending() {
        return this == PENDING;
    }

    public boolean isConfirmed() {
        return this == CONFIRMED;
    }

    public boolean isCompleted() {
        return this == COMPLETED;
    }

    public boolean isCancelled() {
        return this == CANCELLED;
    }

    public boolean isActive() {
        return this == PENDING || this == CONFIRMED;
    }

    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED;
    }
}
