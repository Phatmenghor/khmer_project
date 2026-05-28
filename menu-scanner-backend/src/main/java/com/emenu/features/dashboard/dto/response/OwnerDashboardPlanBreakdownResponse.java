package com.emenu.features.dashboard.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerDashboardPlanBreakdownResponse {
    private List<PlanStat> data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlanStat {
        private String planName;
        private long activeCount;
        private long totalCount;
        private double percentage;
    }
}
