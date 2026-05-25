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
public class DashboardBranchesResponse {

    /** Branches = order sources (POS, PUBLIC/Online) in this single-business system. */
    private List<BranchPerformance> data;
    private String topBranchId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchPerformance {
        private String     id;
        private String     name;
        private String     location;
        private BigDecimal revenue;
        private long       orders;
        private int        rank;
        private double     revenueChange;
    }
}
