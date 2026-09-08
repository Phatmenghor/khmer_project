package com.emenu.features.apikey.dto.request;

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
public class ApiKeyCreateRequest {

    @NotBlank(message = "Project code is required")
    @Size(min = 2, max = 50, message = "Project code must be between 2 and 50 characters")
    private String projectCode;

    @NotBlank(message = "Label is required")
    @Size(min = 2, max = 100, message = "Label must be between 2 and 100 characters")
    private String label;
}
