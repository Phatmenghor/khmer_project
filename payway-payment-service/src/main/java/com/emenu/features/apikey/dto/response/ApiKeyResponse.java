package com.emenu.features.apikey.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiKeyResponse {

    private UUID id;
    private String apiKey;
    private String projectCode;
    private String label;
    private boolean active;
    private ZonedDateTime createdAt;
}
