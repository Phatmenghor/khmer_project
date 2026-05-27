package com.emenu.enums.sub_scription;

import lombok.Getter;

@Getter
public enum SubscriptionPaymentType {

    SUBSCRIPTION("Initial subscription payment"),
    RENEWAL("Subscription renewal payment"),
    PLAN_CHANGE("Plan upgrade or downgrade payment"),
    REFUND("Subscription refund");

    private final String description;

    SubscriptionPaymentType(String description) {
        this.description = description;
    }
}
