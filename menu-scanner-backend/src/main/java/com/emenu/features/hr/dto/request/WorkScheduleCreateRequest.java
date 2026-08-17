package com.emenu.features.hr.dto.request;

import com.emenu.features.hr.dto.common.DayShiftDto;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleCreateRequest {
    @NotNull(message = "User ID required")
    private UUID userId;

    @NotNull(message = "Business ID required")
    private UUID businessId;

    @NotBlank(message = "Name required")
    private String name;

    @NotEmpty(message = "Day shifts required")
    private List<DayShiftDto> dayShifts;
}
