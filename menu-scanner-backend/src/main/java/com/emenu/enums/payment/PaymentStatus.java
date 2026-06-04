package com.emenu.enums.payment;

import lombok.Getter;

@Getter
public enum PaymentStatus {

    PAID("Paid"),
    UNPAID("Unpaid"),
    REFUNDED("Refunded");

    private final String description;

    PaymentStatus(String description) {
        this.description = description;
    }

    public boolean isPaid() {
        return this == PAID;
    }

    public boolean isUnpaid() {
        return this == UNPAID;
    }

    public boolean isRefunded() {
        return this == REFUNDED;
    }
}