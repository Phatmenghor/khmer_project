package com.emenu.features.apikey.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApiKeyResponse {
    private String id;
    private String apiKey;
    private String projectCode;
    private String pathStore;
    private String label;
    private boolean active;
    private LocalDateTime createdAt;
}
