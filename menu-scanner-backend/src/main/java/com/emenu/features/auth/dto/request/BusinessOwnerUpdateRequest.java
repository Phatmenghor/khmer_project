package com.emenu.features.auth.dto.request;

import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.BusinessStatus;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class BusinessOwnerUpdateRequest {

    // Owner fields
    private String ownerFullName;

    @Email(message = "Owner email must be valid")
    private String ownerEmail;

    private String ownerPhone;

    private AccountStatus ownerAccountStatus;

    // Business fields
    private String businessName;

    @Email(message = "Business email must be valid")
    private String businessEmail;

    private String businessPhone;

    private String businessAddress;

    private String businessDescription;

    private BusinessStatus businessStatus;
}
