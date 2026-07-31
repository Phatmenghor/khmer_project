package com.emenu.features.storage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorageUploadResponse {
    private String key;
    private String baseUrl;
    private String relativePath;
    private String url;
}
