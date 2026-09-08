package com.emenu.features.apikey.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "API Key Creation Payload")
public class ApiKeyCreateRequest {

    @NotBlank(message = "Label is required")
    @Size(min = 2, max = 100, message = "Label must be between 2 and 100 characters")
    @Schema(description = "Label or system name using this API key", example = "eMenu POS Service", requiredMode = Schema.RequiredMode.REQUIRED)
    private String label;
}

