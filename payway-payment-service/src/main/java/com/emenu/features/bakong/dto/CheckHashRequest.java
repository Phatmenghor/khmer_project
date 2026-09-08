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
public class CheckHashRequest {

    @NotBlank(message = "Hash is required")
    @Size(min = 64, max = 64, message = "Full hash must be 64 hexadecimal characters")
    private String hash;
}
