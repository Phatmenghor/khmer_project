package com.emenu.features.main.dto.request;

import com.emenu.shared.dto.ImageUrls;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

import java.util.UUID;

@Data
public class ProductImageCreateDto {
    private UUID id;

    @JsonAlias({"imageUrl", "image"})
    private ImageUrls image;

    private Boolean isPrimary;
    private Integer displayOrder;
}