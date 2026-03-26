package com.emenu.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Single pricing snapshot for an order at a point in time (before or after modifications)
 * Captures the complete financial state of the order
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPricingSnapshot {
    private Integer totalItems;                // Number of items in order
    private BigDecimal subtotalBeforeDiscount; // Sum of all items at original price
    private BigDecimal subtotal;               // After item-level discounts
    private BigDecimal totalDiscount;          // Total discounts from items
    private BigDecimal deliveryFee;            // Delivery charge
    private BigDecimal taxAmount;              // Tax amount
    private BigDecimal finalTotal;             // Total amount to pay
}
