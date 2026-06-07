package com.emenu.features.spaces.enums;

public enum ImageVariant {
    SM("sm"),
    MD("md"),
    LG("lg"),
    ORIGINAL("o");

    private final String code;

    ImageVariant(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
