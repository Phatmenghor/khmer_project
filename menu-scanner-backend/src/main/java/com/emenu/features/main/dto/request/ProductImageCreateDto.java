package com.emenu.features.main.dto.request;

import com.emenu.shared.dto.ImageUrls;
import lombok.Data;

import java.util.UUID;

@Data
public class ProductImageCreateDto {
    private UUID id;
    private ImageUrls image;
}