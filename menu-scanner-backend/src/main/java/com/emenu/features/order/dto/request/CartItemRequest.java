package com.emenu.features.order.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Cart item for order creation request - clean payload without audit trail fields
 */
@Data
public class CartItemRequest {
    private UUID id;

    // Product information
    private UUID productId;
    private String productName;
    private String productImageUrl;
    private UUID productSizeId;
    private String sizeName;
    private String status;

    // Pricing
    private BigDecimal currentPrice;
    private BigDecimal finalPrice;
    private Boolean hasActivePromotion;

    private Integer quantity;

    // Pricing breakdown
    private BigDecimal totalBeforeDiscount;
    private BigDecimal discountAmount;
    private BigDecimal totalPrice;

    // Promotion details
    private String promotionType;
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;
}
