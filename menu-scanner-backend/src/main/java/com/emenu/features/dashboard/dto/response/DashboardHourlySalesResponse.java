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
public class DashboardHourlySalesResponse {

    private List<HourlySalesPoint> data;
    private int peakHour;
    private int currentHour;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlySalesPoint {
        private int        hour;       // 0–23
        private BigDecimal revenue;
        private long       orders;
    }
}
