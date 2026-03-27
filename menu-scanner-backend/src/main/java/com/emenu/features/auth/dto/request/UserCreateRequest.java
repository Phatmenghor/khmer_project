package com.emenu.features.auth.dto.request;

import com.emenu.enums.user.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class UserCreateRequest {

    @NotBlank(message = "User identifier is required")
    private String userIdentifier;

    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 4, max = 100)
    private String password;

    // Personal
    private String firstName;
    private String lastName;
    private String nickname;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String profileImageUrl;

    // Account
    @NotNull(message = "User type is required")
    private UserType userType;
    private AccountStatus accountStatus = AccountStatus.ACTIVE;
    private UUID businessId;

    @NotNull(message = "At least one role is required")
    private List<String> roles;

    // Employment
    private String employeeId;
    private String position;
    private String department;
    private EmploymentType employmentType;
    private LocalDate joinDate;
    private LocalDate leaveDate;
    private String shift;

    // Address & Related
    private AddressRequest address;
    private List<EmergencyContactRequest> emergencyContacts;
    private List<DocumentRequest> documents;
    private List<EducationRequest> educations;

    // Misc
    private String notes;
    private String remark;
}
