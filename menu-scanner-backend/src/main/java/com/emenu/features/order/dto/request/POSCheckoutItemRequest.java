package com.emenu.features.order.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Item in POS checkout with full price history and audit trail
 * Captures: original → override → final price for accountability
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class POSCheckoutItemRequest {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    private UUID productSizeId;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be greater than 0")
    private Integer quantity;

    // Display fields
    private String productName;
    private String productImageUrl;
    private String sizeName;
    private String status; // ACTIVE

    // Price history for audit trail
    private BigDecimal originalPrice;      // Product original price
    private BigDecimal currentPrice;       // After admin override (if any)
    private BigDecimal finalPrice;         // After promotions
    private Boolean hasActivePromotion;    // Has promotion applied

    // Admin override price (optional - if not provided, use product price)
    private BigDecimal overridePrice;

    // Promotion override (optional)
    private String promotionType;         // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal promotionValue;    // The discount amount or percentage

    // Totals for each item
    private BigDecimal totalBeforeDiscount; // quantity * originalPrice
    private BigDecimal discountAmount;     // quantity * (originalPrice - finalPrice)
    private BigDecimal totalPrice;         // quantity * finalPrice

    // Audit trail - shows single modification snapshot (original → final)
    // Contains: originalPrice, currentPrice, finalPrice, promotionType, promotionValue, reason
    @SuppressWarnings("all")
    private Map<String, Object> auditTrail;
}
