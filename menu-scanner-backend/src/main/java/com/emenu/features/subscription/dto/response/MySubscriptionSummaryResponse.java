package com.emenu.features.subscription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MySubscriptionSummaryResponse {

    private UUID currentSubscriptionId;
    private String planName;
    private String billingCycle;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    private Long daysRemaining;
    private String daysRemainingText;
    private Integer progressPercent;
    private Boolean isSubscriptionActive;
    private String subscriptionStatus;

    private List<SubscriptionHistoryResponse> history;
}
