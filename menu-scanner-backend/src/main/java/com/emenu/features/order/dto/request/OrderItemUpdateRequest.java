package com.emenu.features.order.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Item update for order update request - clean payload for modifying order items
 * Follows the same structure as response for consistency
 */
@Data
public class OrderItemUpdateRequest {
    private UUID productId;
    private UUID productSizeId;
    private String productName;
    private String productImageUrl;
    private String sizeName;

    // Pricing
    private BigDecimal currentPrice;  // Base price
    private BigDecimal finalPrice;    // Price after discount
    private BigDecimal unitPrice;     // Same as finalPrice for compat
    private Boolean hasPromotion;

    // Promotion details
    private String promotionType;
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;

    private Integer quantity;
    private String specialInstructions;
}
