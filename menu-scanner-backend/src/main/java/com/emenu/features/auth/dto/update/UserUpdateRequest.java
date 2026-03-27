package com.emenu.features.auth.dto.update;

import com.emenu.enums.user.*;
import com.emenu.features.auth.dto.request.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class UserUpdateRequest {

    // Personal
    private String firstName;
    private String lastName;
    private String nickname;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String profileImageUrl;

    // Account
    private AccountStatus accountStatus;
    private UUID businessId;
    private List<String> roles;

    // Employment
    private String employeeId;
    private String position;
    private String department;
    private EmploymentType employmentType;
    private LocalDate joinDate;
    private LocalDate leaveDate;
    private String shift;

    // Address & Related (null = no change, empty list = clear all)
    private AddressRequest address;
    private List<EmergencyContactRequest> emergencyContacts;
    private List<DocumentRequest> documents;
    private List<EducationRequest> educations;

    // Misc
    private String notes;
    private String remark;
}
