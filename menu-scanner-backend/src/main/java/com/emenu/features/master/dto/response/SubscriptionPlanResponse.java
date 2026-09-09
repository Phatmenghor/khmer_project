package com.emenu.features.master.dto.response;

import com.emenu.enums.sub_scription.SubscriptionPlanDurationType;
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
    private SubscriptionPlanStatus status;
    private SubscriptionPlanDurationType durationType;
    private String periodLabel;
    private Long activeSubscriptionsCount;
}