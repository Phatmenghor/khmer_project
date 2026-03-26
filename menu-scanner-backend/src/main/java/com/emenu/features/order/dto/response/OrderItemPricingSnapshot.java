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
    private BigDecimal currentPrice;           // Base price (before promotion)
    private BigDecimal finalPrice;             // Price after promotion
    private Boolean hasActivePromotion;        // Has promotion applied
    private Integer quantity;
    private BigDecimal totalBeforeDiscount;    // currentPrice × quantity
    private BigDecimal discountAmount;         // (currentPrice - finalPrice) × quantity
    private BigDecimal totalPrice;             // finalPrice × quantity
    private String promotionType;              // PERCENTAGE or FIXED_AMOUNT
    private BigDecimal promotionValue;
    private LocalDateTime promotionFromDate;
    private LocalDateTime promotionToDate;
}
