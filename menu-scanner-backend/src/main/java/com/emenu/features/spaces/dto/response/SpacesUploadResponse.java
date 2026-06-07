package com.emenu.features.spaces.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpacesUploadResponse {
    private String key;
    private String url;
}
