package com.emenu.features.portfolio.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class PortfolioGalleryItemRequest {

    private UUID id;

    @NotBlank
    private String url;

    private String title;
}
