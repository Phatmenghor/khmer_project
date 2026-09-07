package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.NotBlank;

public record CheckTransactionRequest(
        @NotBlank
        String md5
) {
}
