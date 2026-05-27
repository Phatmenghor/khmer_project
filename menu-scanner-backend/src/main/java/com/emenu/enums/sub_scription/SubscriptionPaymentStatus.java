package com.emenu.enums.sub_scription;

import lombok.Getter;

@Getter
public enum SubscriptionPaymentStatus {

    PENDING("Pending - awaiting payment confirmation"),
    COMPLETED("Completed - payment received"),
    FAILED("Failed - payment attempt unsuccessful"),
    CANCELLED("Cancelled - payment cancelled"),
    REFUNDED("Refunded - payment returned to payer");

    private final String description;

    SubscriptionPaymentStatus(String description) {
        this.description = description;
    }

    public boolean isCompleted() {
        return this == COMPLETED;
    }

    public boolean isPending() {
        return this == PENDING;
    }
}
