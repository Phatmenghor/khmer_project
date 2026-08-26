package com.emenu.features.hr.dto.response;

import com.emenu.enums.hr.CheckInType;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.*;

import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCheckInResponse extends BaseAuditResponse {
    private String referenceNumber;
    private CheckInType checkInType;
    private LocalDateTime checkInTime;
    private Double latitude;
    private Double longitude;
    private Long lateMinutes;
    private Long earlyLeaveMinutes;
    private Long overtimeMinutes;
    private Boolean isLate;
    private Boolean isEarly;
    private Boolean isOvertime;
}
