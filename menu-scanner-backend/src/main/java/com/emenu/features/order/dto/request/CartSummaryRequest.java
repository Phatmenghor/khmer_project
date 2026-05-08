package com.emenu.features.order.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Cart summary for order creation request - matches POSCheckoutRequest structure
 * Includes customization totals for items with add-ons
 */
@Data
public class CartSummaryRequest {
    private UUID businessId;
    private String businessName;
    private List<CartItemRequest> items;
    private Integer totalItems;
    private Integer totalQuantity;
    private BigDecimal subtotalBeforeDiscount;
    private BigDecimal subtotal;
    private BigDecimal customizationTotal;  // Total cost of all customizations/add-ons
    private BigDecimal totalDiscount;
    private BigDecimal finalTotal;
}
