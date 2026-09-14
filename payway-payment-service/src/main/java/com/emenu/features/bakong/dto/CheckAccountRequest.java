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
     * Bakong Account ID to verify (e.g. phat_menghor@bkrt).
     * Optional: defaults to configured bakong.account-id if null or blank.
     */
    private String accountId;
}
