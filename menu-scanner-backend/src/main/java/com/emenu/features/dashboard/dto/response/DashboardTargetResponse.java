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
public class DashboardTargetResponse {

    /** Monthly target = last 30-day avg daily revenue × days-in-month. */
    private BigDecimal targetRevenue;
    private BigDecimal currentRevenue;
    private double     percentage;
    private String     period;
    private int        daysRemaining;
}
