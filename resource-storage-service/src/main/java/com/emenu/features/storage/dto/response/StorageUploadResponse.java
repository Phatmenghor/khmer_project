package com.emenu.features.storage.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StorageUploadResponse {
    private String key;
    private String url;
}
