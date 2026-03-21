package com.emenu.enums.order;

import lombok.Getter;

@Getter
public enum OrderStatus {
    // Order lifecycle statuses
    PENDING("Pending", "Order placed, awaiting business confirmation"),
    CONFIRMED("Confirmed", "Business confirmed the order"),
    PREPARING("Preparing", "Staff is preparing the order"),
    READY("Ready", "Order ready for pickup or delivery"),
    IN_TRANSIT("In Transit", "Order is on the way to customer"),
    COMPLETED("Completed", "Order delivered/completed"),
    CANCELLED("Cancelled", "Order cancelled"),
    FAILED("Failed", "Order failed");

    private final String displayName;
    private final String description;

    OrderStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    // Helper methods
    public boolean isPending() {
        return this == PENDING;
    }

    public boolean isConfirmed() {
        return this == CONFIRMED;
    }

    public boolean isPreparing() {
        return this == PREPARING;
    }

    public boolean isReady() {
        return this == READY;
    }

    public boolean isInTransit() {
        return this == IN_TRANSIT;
    }

    public boolean isCompleted() {
        return this == COMPLETED;
    }

    public boolean isCancelled() {
        return this == CANCELLED;
    }

    public boolean isFailed() {
        return this == FAILED;
    }

    public boolean isActive() {
        return this != CANCELLED && this != COMPLETED && this != FAILED;
    }

    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED || this == FAILED;
    }
}
