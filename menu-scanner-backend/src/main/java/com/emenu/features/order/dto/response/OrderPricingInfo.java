package com.emenu.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPricingInfo {
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal customizationTotal;      // Total cost of customizations/add-ons
    private BigDecimal deliveryFee;
    private BigDecimal taxPercentage;           // Tax rate applied
    private BigDecimal taxAmount;               // Calculated tax amount
    private BigDecimal discountAmount;          // Discount applied
    private String discountType;                // "fixed" or "percentage"
    private String discountReason;              // Why discount was applied
    private BigDecimal finalTotal;              // Final amount after all calculations
}

