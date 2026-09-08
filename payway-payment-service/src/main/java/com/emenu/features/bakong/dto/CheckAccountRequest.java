package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckAccountRequest {

    @NotBlank(message = "Account ID is required")
    private String accountId;
}
