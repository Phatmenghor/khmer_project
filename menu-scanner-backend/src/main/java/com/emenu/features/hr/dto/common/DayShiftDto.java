package com.emenu.features.hr.dto.common;

import com.emenu.enums.hr.ScanModeEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DayShiftDto {
    private DayOfWeek dayOfWeek;
    private Boolean enabled;

    @Schema(type = "string", pattern = "HH:mm", example = "09:00", description = "Start time in HH:mm format")
    private LocalTime startTime;

    @Schema(type = "string", pattern = "HH:mm", example = "17:30", description = "End time in HH:mm format")
    private LocalTime endTime;

    @Schema(type = "string", pattern = "HH:mm", example = "12:00", description = "Break start time in HH:mm format")
    private LocalTime breakStartTime;

    @Schema(type = "string", pattern = "HH:mm", example = "13:00", description = "Break end time in HH:mm format")
    private LocalTime breakEndTime;

    private Boolean enableCheckIn;
    private ScanModeEnum scanMode;
}
