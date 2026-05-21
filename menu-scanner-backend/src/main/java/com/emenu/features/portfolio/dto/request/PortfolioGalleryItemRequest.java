package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PortfolioGalleryItemRequest {

    @NotBlank
    private String url;

    private String title;

    private String description;

    private Integer displayOrder = 0;
}
