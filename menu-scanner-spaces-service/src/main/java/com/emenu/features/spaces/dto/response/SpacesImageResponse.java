package com.emenu.features.spaces.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SpacesImageResponse {
    private UUID id;
    private String projectCode;
    /** The path segment from the API key — e.g. "b/abc-123", "owner", "customer" */
    private String path;
    private String objectKey;
    private String url;
    private String originalFilename;
    private Long fileSize;
    private LocalDateTime createdAt;
}
