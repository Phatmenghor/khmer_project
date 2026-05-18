package com.emenu.features.order.dto;

import java.util.UUID;

public interface SizeCartQuantityProjection {
    UUID getProductSizeId();
    Integer getQuantity();
}

