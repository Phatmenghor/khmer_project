package com.emenu.features.subscription.dto.filter;

import com.emenu.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class SubscriptionHistoryFilterRequest extends BaseFilterRequest {
    private UUID businessId;
    private UUID planId;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String status;
}
