package com.emenu.features.order.dto.response;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
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

    // Current pricing (always real-time from product)
    private BigDecimal currentPrice;           // Base price
    private BigDecimal finalPrice;             // Price with active promotions
    private Boolean hasActivePromotion;        // Whether has active promotion

    private Integer quantity;

    // Detailed pricing breakdown (standardized across cart/checkout/order)
    private BigDecimal totalBeforeDiscount;    // currentPrice * quantity
    private BigDecimal discountAmount;         // totalBeforeDiscount - totalPrice (discount for this item)
    private BigDecimal totalPrice;             // finalPrice * quantity (final total after discount)

    // Promotion details (for display)
    private String promotionType;              // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;

    // ===== AUDIT TRAIL: Before/After snapshots for POS orders =====
    // Snapshot BEFORE any POS modifications (original product price)
    private OrderItemPricingSnapshot before;

    // Was the item modified from POS?
    private Boolean hadChangeFromPOS;

    // Snapshot AFTER POS modifications
    private OrderItemPricingSnapshot after;

    // Detailed audit metadata (if changed)
    private Map<String, Object> auditMetadata;
}