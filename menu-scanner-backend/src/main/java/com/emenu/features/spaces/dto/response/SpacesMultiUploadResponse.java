package com.emenu.features.spaces.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpacesMultiUploadResponse {
    private String key;
    private String baseUrl;
    private String relativePath;
    private String url;

    private SpacesUploadResponse sm;
    private SpacesUploadResponse md;
    private SpacesUploadResponse o;
}
