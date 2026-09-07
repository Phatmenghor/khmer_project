package com.emenu.enums.sub_scription;

import lombok.Getter;

@Getter
public enum SubscriptionPlanDurationType {
    FREE_TRIAL("/ 7 days"),
    DAILY("/ day"),
    WEEKLY("/ week"),
    MONTHLY("/ month"),
    SIX_MONTHS("/ 6 months"),
    YEARLY("/ year");

    private final String periodLabel;

    SubscriptionPlanDurationType(String periodLabel) {
        this.periodLabel = periodLabel;
    }
}
