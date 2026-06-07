package com.emenu.features.main.dto.response;

import com.emenu.shared.dto.ImageUrls;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ProductImageDto {
    private UUID id;
    private ImageUrls image;
    private LocalDateTime createdAt;
}