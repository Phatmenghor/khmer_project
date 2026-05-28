package com.emenu.features.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardSummaryResponse {
    private long totalBusinessOwners;
    private long newOwnersThisPeriod;
    private double newOwnersChange;
    private long activeSubscriptions;
    private long expiringSoonSubscriptions;
    private long expiredSubscriptions;
    private BigDecimal totalRevenue;
    private double revenueChange;
}
