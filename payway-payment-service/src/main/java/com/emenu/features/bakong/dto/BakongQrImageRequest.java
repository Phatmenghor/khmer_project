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
public class BakongQrImageRequest {

    @NotBlank(message = "QR payload string is required")
    private String qr;
}
