package com.emenu.enums.hr;

import lombok.Getter;

@Getter
public enum ScanModeEnum {
    FULL_TIME("Full Time", "Scan/check-in twice per day: Check-in, Check-out"),
    FOUR_TIMES("4 Times", "Scan 4 times per day: Check-in, Break-out, Break-in, Check-out"),
    HALF_TIME("Half Time", "Scan twice according to half-day schedule configuration");

    private final String displayName;
    private final String description;

    ScanModeEnum(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
}
