package com.emenu.features.apikey.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApiKeyCreateRequest {
    /** e.g. "emenu", "ab", "xyz-app" */
    @NotBlank
    private String projectCode;
    /**
     * Sub-folder / path prefix this key should store files under.
     * e.g. "b/abc-123", "owner", "customer", "shared"
     */
    @NotBlank
    private String path;
    /** Human-readable label, e.g. "Menu Scanner backend production key" */
    @NotBlank
    private String label;
}
