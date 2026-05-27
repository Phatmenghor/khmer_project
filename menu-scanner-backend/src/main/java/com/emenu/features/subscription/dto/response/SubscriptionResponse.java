package com.emenu.features.subscription.dto.response;

import com.emenu.enums.sub_scription.SubscriptionPlanDurationType;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class SubscriptionResponse extends BaseAuditResponse {
    private UUID businessId;
    private String businessName;
    private UUID planId;
    private String planName;
    private Double planPrice;
    private SubscriptionPlanDurationType planDurationType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long daysRemaining;
    private Boolean autoRenew;
    private String status;
}