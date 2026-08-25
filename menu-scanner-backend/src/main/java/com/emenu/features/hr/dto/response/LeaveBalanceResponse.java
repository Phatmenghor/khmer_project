package com.emenu.features.hr.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceResponse {
    private UUID userId;
    private UUID businessId;
    private Boolean enableLeaveManagement;

    // Annual Leave
    private Double annualEntitlement;
    private Double annualUsedAndPending;
    private Double annualAvailable;

    // Sick Leave
    private Double sickEntitlement;
    private Double sickUsedAndPending;
    private Double sickAvailable;

    // Special Leave
    private Double specialEntitlement;
    private Double specialUsedAndPending;
    private Double specialAvailable;
}
