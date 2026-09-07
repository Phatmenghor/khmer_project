package com.emenu.features.apikey.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiKeyCreateRequest {

    @NotBlank(message = "Project code is required")
    private String projectCode;

    @NotBlank(message = "Label is required")
    private String label;
}
