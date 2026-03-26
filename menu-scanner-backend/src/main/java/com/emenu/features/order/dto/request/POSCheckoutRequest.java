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

    // Order items
    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<POSCheckoutItemRequest> items;

    // Delivery
    @NotNull(message = "Delivery option ID is required")
    private UUID deliveryOptionId;

    @NotNull(message = "Delivery address is required")
    @Valid
    private POSCheckoutAddressRequest deliveryAddress;

    // Payment
    @NotNull(message = "Payment method is required")
    private String paymentMethod; // CASH (only option now)

    // Order totals
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    // Notes
    private String customerNote;
    private String businessNote;
}
