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
public class GenerateDeeplinkRequest {

    @NotBlank(message = "QR string is required")
    private String qr;

    private String appIconUrl;
    private String appName;
    private String appDeepLinkCallback;
}
