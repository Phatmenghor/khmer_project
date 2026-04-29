package com.emenu.features.order.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CartItemResponse {
    private UUID id;

    // Product information (flattened for frontend)
    private UUID productId;
    private String productName;
    private String productImageUrl;
    private UUID productSizeId;        // null for products without sizes
    private String sizeName;           // "Standard" for products without sizes
    private String status;             // ProductStatus: ACTIVE, INACTIVE, OUT_OF_STOCK

    // SKU and barcode from product master data
    private String sku;
    private String barcode;

    // Current pricing (always real-time from product)
    private BigDecimal currentPrice;           // Base price
    private BigDecimal finalPrice;             // Price with active promotions
    private Boolean hasActivePromotion;        // Whether has active promotion

    private Integer quantity;

    // Customizations (add-ons)
    private List<CartItemCustomizationResponse> customizations;

    // Pricing
    private BigDecimal totalPrice;             // finalPrice * quantity
}