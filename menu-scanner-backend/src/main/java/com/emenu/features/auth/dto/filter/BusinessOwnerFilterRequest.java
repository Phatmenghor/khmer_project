package com.emenu.features.auth.dto.filter;

import com.emenu.enums.sub_scription.SubscriptionStatus;
import com.emenu.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class BusinessOwnerFilterRequest extends BaseFilterRequest {
    private List<SubscriptionStatus> subscriptionStatuses;
    private Boolean autoRenew;
    private Integer expiringSoonDays = 7;
}
