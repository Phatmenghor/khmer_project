package com.emenu.features.dashboard.service;

import com.emenu.features.dashboard.dto.response.OwnerDashboardDailyTrendsResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardPlanBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardRecentOwnersResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardStatusBreakdownResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardSummaryResponse;
import com.emenu.features.dashboard.dto.response.OwnerDashboardTrendsResponse;

public interface OwnerDashboardService {
    OwnerDashboardSummaryResponse getSummary();
    OwnerDashboardTrendsResponse getTrends();
    OwnerDashboardStatusBreakdownResponse getStatusBreakdown();
    OwnerDashboardRecentOwnersResponse getRecentOwners();
    OwnerDashboardPlanBreakdownResponse getPlanBreakdown();
    OwnerDashboardDailyTrendsResponse getCustomerTrends();
    OwnerDashboardDailyTrendsResponse getUserTrends();
    OwnerDashboardDailyTrendsResponse getPaymentTrends();
}
