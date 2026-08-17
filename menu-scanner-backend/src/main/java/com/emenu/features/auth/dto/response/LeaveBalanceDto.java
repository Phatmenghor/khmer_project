package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceDto {
    private Double annualLeaveQuota;
    private Double usedAnnualLeave;
    private Double remainingAnnualLeave;

    private Double sickLeaveQuota;
    private Double usedSickLeave;
    private Double remainingSickLeave;

    private Double specialLeaveQuota;
    private Double usedSpecialLeave;
    private Double remainingSpecialLeave;

    private Integer targetYear;
    private Boolean isProRated;
}
