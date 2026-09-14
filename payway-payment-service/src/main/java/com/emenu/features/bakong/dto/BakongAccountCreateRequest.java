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
public class BakongAccountCreateRequest {

    @NotBlank(message = "Bakong Account ID is required (e.g. username@bkrt)")
    private String accountId;

    @NotBlank(message = "Merchant Name is required")
    private String merchantName;

    private String merchantCity;
    private String acquiringBank;
    private String currency;

    private boolean isDefault;
    private boolean enabled;
}
