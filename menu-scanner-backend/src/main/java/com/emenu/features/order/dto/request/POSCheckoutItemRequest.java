package com.emenu.features.order.dto.request;

import com.emenu.features.order.dto.response.OrderItemPricingSnapshot;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Item in POS checkout with complete before/after audit trail
 * Captures: before snapshot → after snapshot with detailed metadata
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

    // SKU and barcode (optional - from request, fallback if not in product master data)
    private String sku;
    private String barcode;

    // ===== AUDIT TRAIL: Before/After snapshots =====
    // Snapshot BEFORE any POS modifications
    @Valid
    private OrderItemPricingSnapshot before;

    // Was the item modified?
    private Boolean hadChangeFromPOS;

    // Snapshot AFTER POS modifications
    @Valid
    private OrderItemPricingSnapshot after;

    // ===== DEPRECATED - Kept for backward compatibility =====
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

}
