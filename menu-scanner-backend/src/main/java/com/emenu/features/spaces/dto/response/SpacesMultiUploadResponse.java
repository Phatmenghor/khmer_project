package com.emenu.features.spaces.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpacesMultiUploadResponse {
    private SpacesUploadResponse sm;
    private SpacesUploadResponse md;
    private SpacesUploadResponse lg;
    private SpacesUploadResponse o;
}
