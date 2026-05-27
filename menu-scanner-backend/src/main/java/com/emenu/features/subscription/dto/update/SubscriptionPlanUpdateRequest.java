package com.emenu.features.subscription.dto.update;

import com.emenu.enums.sub_scription.SubscriptionPlanDurationType;
import com.emenu.enums.sub_scription.SubscriptionPlanStatus;
import lombok.Data;

import java.math.BigDecimal;


@Data
public class SubscriptionPlanUpdateRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private SubscriptionPlanDurationType durationType;
    private SubscriptionPlanStatus status;
}