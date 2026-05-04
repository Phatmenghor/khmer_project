package com.emenu.features.order.enums;

/**
 * Enum to identify the source of the order
 * CUSTOMER: Order created from public checkout page
 * BUSINESS: Order created from admin/POS system
 */
public enum OrderFromEnum {
    CUSTOMER("Customer"),      // From public checkout page
    BUSINESS("Business");      // From admin/POS system

    private final String displayName;

    OrderFromEnum(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static OrderFromEnum fromString(String value) {
        if (value == null || value.isEmpty()) {
            return CUSTOMER; // Default to CUSTOMER if not specified
        }
        try {
            return OrderFromEnum.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return CUSTOMER; // Default to CUSTOMER if invalid
        }
    }
}
