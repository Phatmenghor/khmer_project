package com.emenu.features.auth.dto.request;

import com.emenu.enums.user.*;
import com.emenu.shared.dto.ImageUrls;
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

    @NotBlank(message = "Password is required")
    @Size(min = 4, max = 100)
    private String password;

    @NotNull(message = "User type is required")
    private UserType userType;

    private AccountStatus accountStatus = AccountStatus.ACTIVE;
    private UUID businessId;

    @NotNull(message = "At least one role is required")
    private List<String> roles;

    private String remark;

    private String email;
    private String firstName;
    private String lastName;
    private String nickname;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private ImageUrls profileImage;

    private String employeeId;
    private String position;
    private String department;
    private EmploymentType employmentType;
    private LocalDate joinDate;
    private LocalDate leaveDate;
    private String shift;

    private List<AddressRequest> addresses;
    private List<EmergencyContactRequest> emergencyContacts;
    private List<DocumentRequest> documents;
    private List<EducationRequest> educations;
}
