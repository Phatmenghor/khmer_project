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
public class OwnerDashboardDailyTrendsResponse {

    private List<DailyPoint> data;
    private long totalCount;
    private BigDecimal totalAmount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyPoint {
        private String date;
        private long count;
        private BigDecimal amount;
    }
}
