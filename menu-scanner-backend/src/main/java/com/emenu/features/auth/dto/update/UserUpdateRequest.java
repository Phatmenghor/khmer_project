package com.emenu.features.auth.dto.update;

import com.emenu.enums.common.Status;
import com.emenu.enums.user.*;
import com.emenu.features.auth.dto.request.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class UserUpdateRequest {

    private AccountStatus accountStatus;
    private Status status;
    private UUID businessId;
    private List<String> roles;
    private String remark;

    private String email;
    private String firstName;
    private String lastName;
    private String nickname;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String profileImageUrl;

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
