package com.emenu.features.portfolio.dto.request;

import com.emenu.shared.dto.ImageUrls;
import lombok.Data;

import java.util.UUID;

@Data
public class PortfolioGalleryItemRequest {

    private UUID id;

    private ImageUrls image;

    private String title;
}
