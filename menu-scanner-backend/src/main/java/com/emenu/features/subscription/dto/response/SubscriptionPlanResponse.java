package com.emenu.features.subscription.dto.response;

import com.emenu.enums.sub_scription.SubscriptionPlanStatus;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@EqualsAndHashCode(callSuper = true)
@Data
public class SubscriptionPlanResponse extends BaseAuditResponse {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationDays;
    private SubscriptionPlanStatus status;
    private Long activeSubscriptionsCount;
}