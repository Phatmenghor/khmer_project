package com.emenu.features.hr.dto.update;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveUpdateRequest {
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
}