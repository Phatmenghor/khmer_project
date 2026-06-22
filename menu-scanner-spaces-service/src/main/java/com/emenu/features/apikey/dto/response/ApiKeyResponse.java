package com.emenu.features.apikey.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ApiKeyResponse {
    private UUID id;
    private String apiKey;
    private String projectCode;
    private String path;
    private String label;
    private boolean active;
    private LocalDateTime createdAt;
}
