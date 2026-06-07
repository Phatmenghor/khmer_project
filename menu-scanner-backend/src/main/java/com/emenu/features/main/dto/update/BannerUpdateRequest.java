package com.emenu.features.main.dto.update;

import com.emenu.enums.common.Status;
import com.emenu.shared.dto.ImageUrls;
import lombok.Data;

@Data
public class BannerUpdateRequest {
    private ImageUrls image;
    private String description;
    private Status status;
}
