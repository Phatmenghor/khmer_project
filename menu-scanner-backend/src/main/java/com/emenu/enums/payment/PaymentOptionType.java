package com.emenu.enums.payment;

public enum PaymentOptionType {
    CASH("Cash"),
    BANK_TRANSFER("Bank Transfer"),
    CREDIT_CARD("Credit Card"),
    DEBIT_CARD("Debit Card"),
    MOBILE_WALLET("Mobile Wallet"),
    CRYPTO("Cryptocurrency"),
    CHECK("Check"),
    OTHER("Other");

    private final String displayName;

    PaymentOptionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
