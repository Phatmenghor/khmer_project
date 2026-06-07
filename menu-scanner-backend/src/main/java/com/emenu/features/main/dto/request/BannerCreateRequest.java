package com.emenu.features.main.dto.request;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.ImageUrls;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BannerCreateRequest {

    @NotNull(message = "Image is required")
    private ImageUrls image;

    private String description;
    private Status status = Status.ACTIVE;
}
