package com.emenu.features.hr.dto.response;

import com.emenu.enums.hr.LeaveSessionEnum;
import com.emenu.enums.hr.LeaveStatusEnum;
import com.emenu.features.auth.dto.response.UserBasicInfo;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponse extends BaseAuditResponse {
    private UserBasicInfo userInfo;
    private UUID businessId;
    private String referenceNumber;
    private String leaveTypeEnum;
    private LeaveSessionEnum leaveSession;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalDays;
    private String reason;
    private LeaveStatusEnum status;
    private UUID actionBy;
    private UserBasicInfo actionUserInfo;
    private LocalDateTime actionAt;
    private String actionNote;
    private List<LeaveStatusHistoryResponse> statusHistory;
}