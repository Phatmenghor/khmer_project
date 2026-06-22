package com.emenu.features.spaces.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SpacesDeleteResponse {
    private String path;
    private int deletedCount;
}
