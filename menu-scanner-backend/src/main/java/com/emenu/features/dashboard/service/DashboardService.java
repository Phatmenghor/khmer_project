package com.emenu.features.dashboard.service;

import com.emenu.features.dashboard.dto.response.*;

import java.util.UUID;

public interface DashboardService {

    DashboardSummaryResponse     getSummary(UUID businessId, String period);
    DashboardSalesResponse       getSales(UUID businessId, String period);
    DashboardPaymentsResponse    getPayments(UUID businessId, String period);
    DashboardStockResponse       getStock(UUID businessId);
    DashboardOrdersResponse      getRecentOrders(UUID businessId, String period);
    DashboardTopProductsResponse getTopProducts(UUID businessId, String period);
    DashboardHourlySalesResponse getHourlySales(UUID businessId, String period);
    DashboardCustomerStatsResponse getCustomerStats(UUID businessId, String period);
}
