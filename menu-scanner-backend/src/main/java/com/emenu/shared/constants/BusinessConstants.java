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

    // Default Contact & Store Info
    public static final String DEFAULT_CONTACT_ADDRESS = "Phnom Penh, Cambodia";
    public static final String DEFAULT_CONTACT_PHONE = "+855 12 345 678";
    public static final String DEFAULT_CONTACT_EMAIL = "contact@emenu.kh";
    public static final String DEFAULT_STORE_DESCRIPTION =
        "Welcome to our storefront. Explore our full digital menu, enjoy seamless online ordering, and discover daily featured specials.";

    // Default Operating Hours configuration: { Day, OpeningTime, ClosingTime }
    public static final String[][] DEFAULT_BUSINESS_HOURS_CONFIG = {
        {"Monday", "08:00", "21:00"},
        {"Tuesday", "08:00", "21:00"},
        {"Wednesday", "08:00", "21:00"},
        {"Thursday", "08:00", "21:00"},
        {"Friday", "08:00", "22:00"},
        {"Saturday", "08:00", "22:00"},
        {"Sunday", "08:00", "21:00"}
    };

    // Default Social Media configuration: { PlatformName, LinkUrl }
    public static final String[][] DEFAULT_SOCIAL_MEDIA_CONFIG = {
        {"Facebook", "https://facebook.com"},
        {"TikTok", "https://tiktok.com"},
        {"Instagram", "https://instagram.com"},
        {"Telegram", "https://t.me"}
    };

    // Business Status
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";
    public static final String STATUS_SUSPENDED = "SUSPENDED";
    public static final String STATUS_CLOSED = "CLOSED";
}
