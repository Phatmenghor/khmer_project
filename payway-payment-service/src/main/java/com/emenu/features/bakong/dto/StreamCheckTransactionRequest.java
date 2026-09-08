package com.emenu.features.bakong.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
@Schema(description = "Bakong Stream Check Transaction Request Payload")
public class StreamCheckTransactionRequest {

    @NotBlank(message = "MD5 is required")
    @Size(min = 32, max = 32, message = "MD5 must be exactly 32 characters")
    @Schema(description = "32-character MD5 hash of the generated KHQR", example = "e10adc3949ba59abbe56e057f20f883e", requiredMode = Schema.RequiredMode.REQUIRED)
    private String md5;

    @Builder.Default
    @Min(value = 1, message = "Interval seconds must be at least 1")
    @Max(value = 30, message = "Interval seconds cannot exceed 30")
    @Schema(description = "Polling interval in seconds (1 to 30)", example = "3")
    private Integer intervalSeconds = 3;
}
