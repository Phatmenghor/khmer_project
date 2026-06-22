package com.emenu.features.storage.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StorageDeleteRequest {

    @NotBlank
    private String path;
}
