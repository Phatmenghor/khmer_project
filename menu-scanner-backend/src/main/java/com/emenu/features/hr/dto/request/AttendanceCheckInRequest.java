package com.emenu.features.hr.dto.request;

import com.emenu.enums.hr.CheckInType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCheckInRequest {
    private UUID userId;
    private UUID businessId;
    private UUID workScheduleId;
    private CheckInType checkInType; // Optional; if null, backend automatically infers START (1st scan) or END (2nd scan)
    private Double latitude;
    private Double longitude;
    private String remarks;
}