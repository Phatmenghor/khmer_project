package com.emenu.features.bakong.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckTransactionRequest {

    @NotBlank(message = "MD5 is required")
    @Size(min = 32, max = 32, message = "MD5 must be exactly 32 characters")
    private String md5;
}
