package com.emenu.enums.payment;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    CASH("Cash Payment");

    private final String description;

    PaymentMethod(String description) {
        this.description = description;
    }
}