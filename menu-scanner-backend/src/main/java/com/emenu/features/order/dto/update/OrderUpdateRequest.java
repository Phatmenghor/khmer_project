package com.emenu.features.order.dto.update;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.dto.request.DeliveryAddressRequest;
import com.emenu.features.order.dto.request.DeliveryOptionRequest;
import com.emenu.features.order.dto.request.OrderItemUpdateRequest;
import com.emenu.features.order.dto.response.OrderPricingSnapshot;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Full order update request - allows admins to modify all order details
 * Mirrors POSCheckoutRequest structure for consistency
 * Supports complete order modifications with pricing adjustments and item updates
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateRequest {

    // Customer info - editable
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Delivery info
    @Valid
    private DeliveryAddressRequest deliveryAddress;

    @Valid
    private DeliveryOptionRequest deliveryOption;

    // Order status
    private OrderStatus orderStatus;

    // Items update - allows modifying items
    @Valid
    private List<OrderItemUpdateRequest> items;

    // Pricing information with audit trail
    @Valid
    private PricingInfo pricing;

    // Payment information - editable
    @Valid
    private PaymentInfo payment;

    // Notes
    private String customerNote;
    private String businessNote;

    // ─── Nested Classes ───
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingInfo {
        // Snapshot BEFORE any modifications
        private OrderPricingSnapshot before;

        // Was order modified?
        private Boolean hadOrderLevelChangeFromPOS;

        // Snapshot AFTER modifications
        private OrderPricingSnapshot after;

        // Type of order-level discount (PERCENTAGE or FIXED_AMOUNT)
        private String discountType;

        // Reason for order-level change
        private String orderLevelChangeReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private String paymentMethod;  // CASH, CARD, etc.
        private String paymentStatus;  // PAID, UNPAID, etc.
    }
}
