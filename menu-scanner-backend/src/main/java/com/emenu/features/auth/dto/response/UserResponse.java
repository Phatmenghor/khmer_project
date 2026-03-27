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

    // ── Account ────────────────────────────────────────────────────────────
    private String userIdentifier;
    private UserType userType;
    private AccountStatus accountStatus;
    private List<String> roles;
    private UUID businessId;
    private String businessName;
    private String remark;

    // ── Personal (from user_profiles) ─────────────────────────────────────
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String nickname;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String profileImageUrl;

    // ── Employment (from user_employments) ────────────────────────────────
    private String employeeId;
    private String position;
    private String department;
    private EmploymentType employmentType;
    private LocalDate joinDate;
    private LocalDate leaveDate;
    private String shift;

    // ── Telegram (from user_telegrams) ────────────────────────────────────
    private Long telegramId;
    private String telegramUsername;
    private String telegramFirstName;
    private String telegramLastName;
    private String telegramPhotoUrl;
    private LocalDateTime telegramSyncedAt;
    private boolean telegramSynced;

    // ── Related ────────────────────────────────────────────────────────────
    private List<AddressResponse> addresses;
    private List<EmergencyContactResponse> emergencyContacts;
    private List<DocumentResponse> documents;
    private List<EducationResponse> educations;

    // ── Session ────────────────────────────────────────────────────────────
    private LocalDateTime lastLoginAt;
}
