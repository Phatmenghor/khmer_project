package com.emenu.features.hr.dto.update;

import com.emenu.features.hr.dto.common.DayShiftDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleUpdateRequest {
    private String name;
    private List<DayShiftDto> dayShifts;
}