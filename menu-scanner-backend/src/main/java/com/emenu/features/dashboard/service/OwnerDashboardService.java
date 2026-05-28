package com.emenu.features.dashboard.service;

import com.emenu.features.dashboard.dto.response.OwnerDashboardPlanBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardRecentOwnersResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardStatusBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardSummaryResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardTrendsResponse;

public interface OwnerDashboardService {
    OwnerDashboardSummaryResponse getSummary(String period);
    OwnerDashboardTrendsResponse getTrends(String period);
    OwnerDashboardStatusBreakdownResponse getStatusBreakdown();
    OwnerDashboardRecentOwnersResponse getRecentOwners();
    OwnerDashboardPlanBreakdownResponse getPlanBreakdown();
}
