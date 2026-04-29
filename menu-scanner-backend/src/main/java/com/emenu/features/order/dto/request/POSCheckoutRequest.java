package com.emenu.features.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Unified POS checkout request - matches both PUBLIC (customer) and POS (admin) orders
 * Includes full audit trail for all item modifications and order-level discounts
 *
 * Frontend → Backend mapping:
 * - deliveryAddress: full address object
 * - deliveryOption: full delivery option object (includes price)
 * - cart: CartSummary with items array and totals
 * - payment: PaymentInfo object
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class POSCheckoutRequest {

    @NotNull(message = "Business ID is required")
    private UUID businessId;

    // Customer info (optional for walkup orders)
    private UUID customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Delivery address - use ID to fetch from database
    @NotNull(message = "Address ID is required")
    private UUID addressId;

    // Delivery option (full object with price, not just ID)
    @Valid
    private DeliveryOptionInfo deliveryOption;

    // Cart summary with all items and totals
    @Valid
    private CartSummary cart;

    // Pricing information with audit trail (order-level discounts)
    @Valid
    private PricingInfo pricing;

    // Payment information
    @Valid
    private PaymentInfo payment;

    // Order status
    private String orderStatus; // PENDING, CONFIRMED, COMPLETED, etc.

    // Notes for tracking
    private String customerNote;
    private String businessNote; // Includes discount reason and audit info

    // ─── Nested Classes ───
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryOptionInfo {
        private String name;
        private String description;
        private String imageUrl;
        private BigDecimal price;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartSummary {
        private UUID businessId;
        private String businessName;

        @NotEmpty(message = "Order must have at least one item")
        @Valid
        private List<POSCheckoutItemRequest> items;

        // Totals
        private Integer totalItems;
        private Integer totalQuantity;
        private BigDecimal subtotalBeforeDiscount;  // Sum of all original prices
        private BigDecimal subtotal;                // After product-level discounts
        private BigDecimal totalDiscount;           // Total discount from promotions
        private BigDecimal finalTotal;              // After order-level discount applied
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingInfo {
        private BigDecimal deliveryFee;
        private BigDecimal subtotal;
        private BigDecimal finalTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        @NotNull(message = "Payment method is required")
        private String paymentMethod;  // CASH

        private String paymentStatus;  // PAID, UNPAID, etc.
    }
}
