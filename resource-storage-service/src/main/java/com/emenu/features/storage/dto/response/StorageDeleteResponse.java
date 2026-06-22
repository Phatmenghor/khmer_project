package com.emenu.features.storage.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StorageDeleteResponse {
    private String path;
    private int deletedCount;
}
