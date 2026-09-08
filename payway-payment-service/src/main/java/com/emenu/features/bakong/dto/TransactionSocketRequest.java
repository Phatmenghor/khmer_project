package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TransactionSocketRequest(
        @NotBlank(message = "MD5 is required")
        @Size(min = 32, max = 32, message = "MD5 must be exactly 32 characters")
        String md5,

        @NotNull(message = "Interval seconds is required")
        @Min(value = 1, message = "Interval must be at least 1 second")
        @Max(value = 30, message = "Interval must not exceed 30 seconds")
        Integer intervalSeconds
) {

    public TransactionSocketRequest {
        intervalSeconds = intervalSeconds == null ? 3 : intervalSeconds;
    }
}
