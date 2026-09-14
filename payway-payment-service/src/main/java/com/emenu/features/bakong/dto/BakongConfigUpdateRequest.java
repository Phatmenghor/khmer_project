package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BakongConfigUpdateRequest {

    @NotNull(message = "ID is required")
    private UUID id;

    @NotBlank(message = "Config name is required")
    private String configName;

    @NotBlank(message = "API URL is required")
    private String apiUrl;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @Min(value = 1, message = "Daily rate limit must be at least 1")
    private int dailyRateLimit;

    private boolean enabled;
}
