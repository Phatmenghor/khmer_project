package com.emenu.features.apikey.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiKeyResponse {

    private UUID id;
    private String apiKey;
    private String projectCode;
    private String pathStore;
    private String label;
    private boolean active;
    private LocalDateTime createdAt;
}
