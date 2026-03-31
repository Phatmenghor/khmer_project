package com.emenu.enums.product;

import lombok.Getter;

@Getter
public enum StockStatus {
    ENABLED("Enabled - Stock tracking active"),
    DISABLED("Disabled - Stock tracking inactive");

    private final String description;

    StockStatus(String description) {
        this.description = description;
    }

    public boolean isEnabled() {
        return this == ENABLED;
    }
}
