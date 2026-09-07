package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record TransactionSocketRequest(
        @NotBlank
        String md5,
        @Min(1)
        @Max(30)
        Integer intervalSeconds
) {

    public TransactionSocketRequest {
        intervalSeconds = intervalSeconds == null ? 3 : intervalSeconds;
    }
}
