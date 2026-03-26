package com.emenu.features.order.dto.update;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.dto.request.DeliveryAddressRequest;
import com.emenu.features.order.dto.request.DeliveryOptionRequest;
import com.emenu.features.order.dto.request.OrderItemUpdateRequest;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * Clean order update request - mirrors response structure but only with necessary fields
 */
@Data
public class OrderUpdateRequest {
    private OrderStatus orderStatus;
    private DeliveryAddressRequest deliveryAddress;
    private DeliveryOptionRequest deliveryOption;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String customerNote;
    private String businessNote;

    // Pricing adjustments
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal deliveryFee;

    // Items update - allows adding/modifying items
    private List<OrderItemUpdateRequest> items;
}
