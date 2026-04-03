package com.emenu.features.auth.constants;

/**
 * Business Settings Constants
 * Default values used when business settings are null or not provided
 */
public class BusinessSettingConstants {

    // Default business name
    public static final String DEFAULT_BUSINESS_NAME = "Emenu Scanner";

    // Default brand colors (hex format)
    // Primary: Green #57823D, Secondary: Golden Yellow #F4C430, Accent: Light Grey #F2F3F7
    public static final String DEFAULT_PRIMARY_COLOR = "#57823D";    // Green - brand color
    public static final String DEFAULT_SECONDARY_COLOR = "#F4C430";  // Golden Yellow - highlights & CTAs
    public static final String DEFAULT_ACCENT_COLOR = "#F2F3F7";     // Light Grey - subtle backgrounds

    // Default tax percentage
    public static final Double DEFAULT_TAX_PERCENTAGE = 0.0;

    // Private constructor to prevent instantiation
    private BusinessSettingConstants() {
        throw new AssertionError("Cannot instantiate BusinessSettingConstants");
    }
}
