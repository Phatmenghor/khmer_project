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
    // Single size compatibility (points to original size o)
    private String key;
    private String url;

    private SpacesUploadResponse sm;
    private SpacesUploadResponse md;
    private SpacesUploadResponse o;
}
