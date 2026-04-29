package com.emenu.features.order.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class OrderItemResponse {
    private UUID id;

    // Product info grouped for easy identification
    private OrderItemProductInfo product;

    // Pricing
    private Integer quantity;
    private BigDecimal finalPrice;
    private BigDecimal totalPrice;

    @Data
    public static class OrderItemProductInfo {
        private UUID id;
        private String name;
        private String imageUrl;
        private String sku;
        private String barcode;
        private UUID sizeId;
        private String sizeName;
        private String status;
    }
}
