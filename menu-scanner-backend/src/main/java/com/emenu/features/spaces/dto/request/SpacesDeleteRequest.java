package com.emenu.features.spaces.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SpacesDeleteRequest {

    @NotBlank
    private String path;
}
