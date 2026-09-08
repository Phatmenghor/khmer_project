package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CheckTransactionRequest(
        @NotBlank(message = "MD5 is required")
        @Size(min = 32, max = 32, message = "MD5 must be exactly 32 characters")
        String md5
) {
}
