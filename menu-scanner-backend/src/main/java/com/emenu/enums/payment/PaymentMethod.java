package com.emenu.enums.payment;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    CASH("Cash Payment"),
    BANK("Bank Transfer");

    private final String description;

    PaymentMethod(String description) {
        this.description = description;
    }
}