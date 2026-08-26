package com.emenu.enums.hr;

import lombok.Getter;

@Getter
public enum LeaveSessionEnum {
    FULL_DAY("Full Day", "Full Day (1.0 Day)"),
    MORNING_SESSION("Section 1 (Morning)", "Section 1 - Morning (0.5 Day)"),
    AFTERNOON_SESSION("Section 2 (Afternoon)", "Section 2 - Afternoon (0.5 Day)");

    private final String displayName;
    private final String description;

    LeaveSessionEnum(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }
}
