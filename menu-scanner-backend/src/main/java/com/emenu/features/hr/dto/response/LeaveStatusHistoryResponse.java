package com.emenu.features.hr.dto.response;

import com.emenu.enums.hr.LeaveStatusEnum;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveStatusHistoryResponse {
    private UUID id;
    private LeaveStatusEnum status;
    private String note;
    private UUID changedByUserId;
    private String changedByName;
    private LocalDateTime changedAt;
}
