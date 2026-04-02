package com.emenu.features.auth.constants;

/**
 * Business Settings Constants
 * Default values used when business settings are null or not provided
 */
public class BusinessSettingConstants {

    // Default business name
    public static final String DEFAULT_BUSINESS_NAME = "Emenu Scanner";

    // Default brand colors (hex format)
    public static final String DEFAULT_PRIMARY_COLOR = "#57823D";
    public static final String DEFAULT_SECONDARY_COLOR = "#404040";
    public static final String DEFAULT_ACCENT_COLOR = "#2E74D0";

    // Default tax percentage
    public static final Double DEFAULT_TAX_PERCENTAGE = 0.0;

    // Private constructor to prevent instantiation
    private BusinessSettingConstants() {
        throw new AssertionError("Cannot instantiate BusinessSettingConstants");
    }
}
