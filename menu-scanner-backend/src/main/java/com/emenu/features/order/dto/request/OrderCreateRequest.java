package com.emenu.features.order.dto.request;

import com.emenu.enums.order.OrderStatus;
import com.emenu.features.order.enums.OrderFromEnum;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Unified checkout request for both public (customer) and POS (admin) orders
 * Matches POSCheckoutRequest pattern for consistency
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateRequest {

    @NotNull(message = "Business ID is required")
    private UUID businessId;

    // Customer info (optional for POS orders)
    private UUID customerId;
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Delivery address - use addressId to fetch from database for public checkout
    // Or use full customerAddress for POS/walk-up orders
    private UUID addressId;
    private String customerAddress;

    // Delivery option (full object with price)
    @Valid
    private DeliveryOptionRequest deliveryOption;

    // Cart summary - complete cart data from frontend
    @Valid
    private CartSummaryRequest cart;

    // Pricing information (optional - can be calculated from cart if not provided)
    @Valid
    private PricingInfo pricing;

    // Payment information
    @Valid
    @NotNull(message = "Payment info is required")
    private OrderPaymentRequest payment;

    // Notes
    private String customerNote;
    private String businessNote;

    // Order metadata
    @NotNull(message = "Order source (orderFrom) is required - CUSTOMER or BUSINESS")
    private OrderFromEnum orderFrom;

    private OrderStatus orderStatus = OrderStatus.PENDING;

    // ─── Nested Classes ───
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingInfo {
        // Base pricing
        private BigDecimal subtotal;
        private BigDecimal deliveryFee;

        // Tax breakdown
        private BigDecimal taxPercentage;
        private BigDecimal taxAmount;

        // Order-level discount
        private BigDecimal discountAmount;
        private String discountType;
        private String discountReason;

        // Final total
        private BigDecimal finalTotal;
    }
}
