package com.emenu.features.order.dto;

import java.util.UUID;

public interface CartQuantityProjection {
    UUID getProductId();
    Long getTotalQuantity();
}

