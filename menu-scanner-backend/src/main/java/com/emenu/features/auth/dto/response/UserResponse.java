package com.emenu.features.auth.dto.response;

import com.emenu.enums.user.*;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserResponse extends BaseAuditResponse {

    // Identity
    private String userIdentifier;
    private String email;

    // Personal
    private String firstName;
    private String lastName;
    private String fullName;
    private String nickname;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String profileImageUrl;

    // Account
    private UserType userType;
    private AccountStatus accountStatus;
    private List<String> roles;
    private UUID businessId;
    private String businessName;

    // Employment
    private String employeeId;
    private String position;
    private String department;
    private EmploymentType employmentType;
    private LocalDate joinDate;
    private LocalDate leaveDate;
    private String shift;

    // Address & Related
    private AddressResponse address;
    private List<EmergencyContactResponse> emergencyContacts;
    private List<DocumentResponse> documents;
    private List<EducationResponse> educations;

    // Misc
    private String notes;
    private String remark;

    // Telegram
    private Long telegramId;
    private String telegramUsername;
    private String telegramFirstName;
    private String telegramLastName;
    private String telegramPhotoUrl;
    private LocalDateTime telegramSyncedAt;
    private boolean telegramSynced;

    // Session
    private LocalDateTime lastLoginAt;
}
