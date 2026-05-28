package com.emenu.features.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardStatusBreakdownResponse {
    private long active;
    private long expiringSoon;
    private long expired;
    private long total;
    private double activePercent;
    private double expiringSoonPercent;
    private double expiredPercent;
}
