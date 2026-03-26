package com.emenu.enums.payment;

public enum PaymentOptionType {
    CASH("Cash");

    private final String displayName;

    PaymentOptionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
