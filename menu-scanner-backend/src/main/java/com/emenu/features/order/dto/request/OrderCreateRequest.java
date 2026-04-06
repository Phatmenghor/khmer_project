package com.emenu.features.order.dto.request;

import com.emenu.enums.order.OrderStatus;
import com.emenu.features.order.enums.OrderFromEnum;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class OrderCreateRequest {

    @NotNull(message = "Business ID is required")
    private UUID businessId;

    // Delivery info - use ID to fetch full address from database
    @NotNull(message = "Address ID is required")
    private UUID addressId;

    private DeliveryOptionRequest deliveryOption;

    // Customer info
    private String customerName;
    private String customerPhone;
    private String customerEmail;

    // Cart summary - complete cart data from frontend (can be edited locally before submit)
    private CartSummaryRequest cart;

    @Valid
    @NotNull(message = "Payment info is required")
    private OrderPaymentRequest payment;

    private String customerNote;

    @NotNull(message = "Order source (orderFrom) is required - CUSTOMER or BUSINESS")
    private OrderFromEnum orderFrom;

    private OrderStatus orderStatus = OrderStatus.PENDING;
}
