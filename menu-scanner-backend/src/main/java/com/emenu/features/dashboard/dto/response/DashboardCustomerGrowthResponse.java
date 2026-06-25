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
public class DashboardCustomerGrowthResponse {

    private List<CustomerGrowthPoint> data;
    private long                      totalCustomers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerGrowthPoint {
        private String date;       // "yyyy-MM-dd"
        private long   newCustomers;
        private long   totalCustomers;
    }
}
