package com.emenu.features.auth.dto.response;

import com.emenu.enums.common.Status;
import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.Gender;
import com.emenu.enums.user.UserType;
import com.emenu.shared.dto.BaseAuditResponse;
import com.emenu.shared.dto.ImageUrls;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
public class CustomerUserResponse extends BaseAuditResponse {

    private String userIdentifier;
    private UserType userType;
    private AccountStatus accountStatus;
    private Status status;
    private List<String> roles;
    private String remark;

    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String nickname;
    private Gender gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private ImageUrls profileImage;

    private Long telegramId;
    private String telegramUsername;
    private String telegramFirstName;
    private String telegramLastName;
    private String telegramPhotoUrl;
    private LocalDateTime telegramSyncedAt;
    private boolean telegramSynced;

    private LocalDateTime lastLoginAt;
}
