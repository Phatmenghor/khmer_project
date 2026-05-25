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
public class DashboardCustomerStatsResponse {

    private long       newCustomers;
    private long       returningCustomers;
    private double     returnRate;
    private long       totalCustomers;
    private BigDecimal avgOrderValue;
}
