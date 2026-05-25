package com.emenu.features.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSalesResponse {

    private List<SalesDataPoint> data;
    private BigDecimal totalRevenue;
    private long       totalOrders;
    private String     period;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesDataPoint {
        private String     date;       // "yyyy-MM-dd"
        private BigDecimal revenue;
        private long       orders;
    }
}
