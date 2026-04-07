package com.emenu.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Single pricing snapshot for an order item at a point in time (before or after modifications)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemPricingSnapshot {
    private BigDecimal currentPrice;        // Base price per unit (before promotion/discount)
    private BigDecimal finalPrice;          // Unit price after all adjustments
    private Integer quantity;               // Item quantity
    private BigDecimal discountAmount;      // Total discount on this item
    private BigDecimal totalPrice;          // Final total = (finalPrice × quantity) - discountAmount
    private Boolean hasActivePromotion;     // Whether promotion is applied
    private String promotionType;           // PERCENTAGE or FIXED_AMOUNT (only if hasActivePromotion=true)
    private BigDecimal promotionValue;      // Promotion amount/percentage (only if hasActivePromotion=true)
}
