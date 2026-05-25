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
public class DashboardSummaryResponse {

    private BigDecimal totalSalesToday;
    private long      totalOrdersToday;

    /** % change vs yesterday (positive = up). */
    private double totalSalesChange;
    private double totalOrdersChange;

    private long   lowStockItems;
    private long   systemAlerts;     // out-of-stock count
    private long   activeStaff;      // placeholder — extend when HR data is wired
    private BigDecimal avgOrderValue;
}
