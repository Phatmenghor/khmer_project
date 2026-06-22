package com.emenu.features.storage.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorageMultiUploadResponse {
    private String key;
    private String url;

    private StorageUploadResponse sm;
    private StorageUploadResponse md;
    private StorageUploadResponse o;
}
