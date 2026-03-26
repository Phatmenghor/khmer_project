package com.emenu.features.order.dto.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Cart summary for order creation request - clean payload without audit trail fields
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
    private BigDecimal totalDiscount;
    private BigDecimal finalTotal;
}
