package com.emenu.config.security.dto;

import lombok.Data;

@Data
public class ApiKeyCreateRequest {
    /** e.g. "emenu", "ab", "xyz-app" */
    private String projectCode;
    /**
     * Sub-folder / path prefix this key should store files under.
     * e.g. "b/abc-123", "owner", "customer", "shared"
     * If null, files go under projectCode/yyyy-MM-dd/
     */
    private String path;
    /** Human-readable label, e.g. "Menu Scanner backend production key" */
    private String label;
}
