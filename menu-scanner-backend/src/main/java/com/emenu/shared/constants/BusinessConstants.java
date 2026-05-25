package com.emenu.shared.constants;

public final class BusinessConstants {

    private BusinessConstants() {
        throw new AssertionError("Cannot instantiate BusinessConstants");
    }

    // Default Business Settings
    public static final String DEFAULT_BUSINESS_NAME = "Emenu Scanner";
    public static final String DEFAULT_PRIMARY_COLOR = "#57823D";
    public static final String DEFAULT_SECONDARY_COLOR = "#F4C430";
    public static final String DEFAULT_ACCENT_COLOR = "#F2F3F7";
    public static final Double DEFAULT_TAX_PERCENTAGE = 0.0;
    public static final Integer DEFAULT_LOW_STOCK_THRESHOLD = 5;

    // Business Status
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";
    public static final String STATUS_SUSPENDED = "SUSPENDED";
    public static final String STATUS_CLOSED = "CLOSED";
}
