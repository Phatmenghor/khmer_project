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
public class DashboardPromotionsResponse {

    private List<DashboardPromotion> data;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardPromotion {
        private String     id;
        private String     name;           // discount_type (PERCENTAGE / FIXED_AMOUNT)
        private String     type;
        private long       timesUsed;
        private BigDecimal revenueGenerated;
        private BigDecimal discountGiven;
        private String     status;
    }
}
