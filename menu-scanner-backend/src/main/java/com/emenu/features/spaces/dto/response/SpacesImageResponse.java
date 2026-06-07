package com.emenu.features.spaces.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class SpacesImageResponse {
    private UUID id;
    private UUID businessId;
    private String objectKey;
    private String url;
    private String size;
    private String entityType;
    private String entityId;
    private String originalFilename;
    private Long fileSize;
    private LocalDateTime createdAt;
}
