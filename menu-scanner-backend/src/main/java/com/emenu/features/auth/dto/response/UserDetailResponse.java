package com.emenu.features.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponse extends UserResponse {

    private List<AddressResponse> addresses;
    private List<EmergencyContactResponse> emergencyContacts;
    private List<DocumentResponse> documents;
    private List<EducationResponse> educations;

    private String employeeId;
    private String position;
    private String department;
    private LocalDate joinDate;
    private LocalDate leaveDate;

    // Staff Leave Entitlement & Balance calculated by Backend
    private LeaveBalanceDto leaveBalance;

    private Long telegramId;
    private String telegramUsername;
    private String telegramFirstName;
    private String telegramLastName;
    private String telegramPhotoUrl;
    private LocalDateTime telegramSyncedAt;
    private boolean telegramSynced;
}
