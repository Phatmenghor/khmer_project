package com.emenu.features.bakong.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckAccountRequest {

    /**
     * Bakong Account ID to verify.
     * Optional: defaults to configured active account if null or blank.
     */
    private String accountId;
}
