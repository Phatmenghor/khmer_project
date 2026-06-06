package com.emenu.features.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessOwnerPublicRegisterRequest {

    @NotBlank(message = "Owner user identifier is required")
    private String ownerUserIdentifier;

    @NotBlank(message = "Owner email is required")
    @Email(message = "Invalid email format")
    private String ownerEmail;

    @NotBlank(message = "Owner password is required")
    @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
    private String ownerPassword;

    @NotBlank(message = "Owner full name is required")
    private String ownerFullName;

    private String ownerPhone;

    @NotBlank(message = "Business name is required")
    private String businessName;

    @NotBlank(message = "Business email is required")
    @Email(message = "Invalid business email format")
    private String businessEmail;

    private String businessPhone;

    private String businessAddress;

    private UUID planId;

    private Boolean enableStockManagement;

    private String primaryColor;
}
