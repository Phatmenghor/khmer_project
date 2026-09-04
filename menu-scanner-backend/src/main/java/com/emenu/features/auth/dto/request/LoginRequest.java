package com.emenu.features.auth.dto.request;

import com.emenu.enums.user.UserType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class LoginRequest {

    @NotBlank(message = "User identifier is required")
    @Size(max = 255, message = "User identifier must not exceed 255 characters")
    private String userIdentifier;

    @NotBlank(message = "Password is required")
    @Size(max = 72, message = "Password must not exceed 72 characters")
    private String password;

    private UserType userType;

    private UUID businessId;
}