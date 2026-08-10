package com.emenu.features.order.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class POSCheckoutRequest {

    @NotNull(message = "Business ID is required")
    private UUID businessId;

    // Customer info
    private UUID customerId;  // Optional: for known customers, required for audit trail
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String customerAddress;  // Optional: for walk-up customers without stored address

    // Delivery option (full object with price)
    @Valid
    private DeliveryOptionRequest deliveryOption;

    // Cart summary - matches OrderCreateRequest structure with customizations
    @Valid
    private CartSummaryRequest cart;

    // Pricing information with full breakdown
    @Valid
    private PricingInfo pricing;

    // Payment information
    @Valid
    @NotNull(message = "Payment info is required")
    private PaymentInfo payment;

    // Notes
    private String businessNote;

    // Order status
    private String orderStatus;  // PENDING, CONFIRMED, COMPLETED, etc.

    // ─── Nested Classes ───
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PricingInfo {
        private BigDecimal subtotal;
        private BigDecimal deliveryFee;
        private BigDecimal taxPercentage;
        private BigDecimal taxAmount;
        private BigDecimal discountAmount;
        private String discountType;
        private String discountReason;
        private BigDecimal finalTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        @NotNull(message = "Payment method is required")
        private String paymentMethod;
        private String paymentStatus;
        private String customerPaymentMethod;
    }
}

