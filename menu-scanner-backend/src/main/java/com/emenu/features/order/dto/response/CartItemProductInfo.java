package com.emenu.features.order.dto.response;

import com.emenu.shared.dto.ImageUrls;
import lombok.Data;

import java.util.UUID;

@Data
public class CartItemProductInfo {
    private UUID id;
    private String name;
    private ImageUrls imageUrl;
    private UUID sizeId;      // null for products without sizes
    private String sizeName;  // "Standard" for products without sizes
    private String status;    // ProductStatus: ACTIVE, INACTIVE, OUT_OF_STOCK
}
