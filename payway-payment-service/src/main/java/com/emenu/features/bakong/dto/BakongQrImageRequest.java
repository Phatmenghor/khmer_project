package com.emenu.features.bakong.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Bakong QR Code PNG Image Generation Payload")
public class BakongQrImageRequest {

    @NotBlank(message = "QR payload string is required")
    @Schema(description = "Bakong KHQR string generated from /generate-qr", example = "00020101021238580016phatmenghor@bkrt52045999530384054045.005802KH5916eMenu Restaurant6010Phnom Penh6304ABCD", requiredMode = Schema.RequiredMode.REQUIRED)
    private String qr;
}
