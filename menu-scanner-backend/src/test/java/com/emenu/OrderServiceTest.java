package com.emenu;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.dto.request.*;
import com.emenu.features.order.dto.request.OrderCreateRequest.GuestAddressRequest;
import com.emenu.enums.order.OrderFromEnum;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class OrderServiceTest {

    @Test
    @DisplayName("OrderCreateRequest builds valid checkout payload")
    void testOrderCreateRequestStructure() {
        UUID businessId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        CartItemRequest item = CartItemRequest.builder()
                .productId(productId)
                .productName("Cappuccino")
                .quantity(2)
                .currentPrice(new BigDecimal("3.50"))
                .finalPrice(new BigDecimal("3.50"))
                .totalPrice(new BigDecimal("7.00"))
                .build();

        CartSummaryRequest cart = new CartSummaryRequest();
        cart.setBusinessId(businessId);
        cart.setBusinessName("ScanMeKH Coffee");
        cart.setSubtotal(new BigDecimal("7.00"));
        cart.setFinalTotal(new BigDecimal("8.50"));
        cart.setTotalItems(2);
        cart.setItems(List.of(item));

        GuestAddressRequest guestAddress = GuestAddressRequest.builder()
                .province("Phnom Penh")
                .district("Chamkar Mon")
                .commune("Tonle Bassac")
                .village("Phum 1")
                .streetNumber("St. 274")
                .houseNumber("#12B")
                .note("Leave at lobby")
                .build();

        OrderPaymentRequest payment = new OrderPaymentRequest();
        payment.setPaymentMethod(PaymentMethod.CASH);
        payment.setPaymentStatus(PaymentStatus.UNPAID);

        OrderCreateRequest request = OrderCreateRequest.builder()
                .businessId(businessId)
                .orderFrom(OrderFromEnum.CUSTOMER)
                .customerName("Dara Sok")
                .customerPhone("012345678")
                .customerEmail("dara@example.com")
                .guestAddress(guestAddress)
                .cart(cart)
                .payment(payment)
                .build();

        assertNotNull(request);
        assertEquals(businessId, request.getBusinessId());
        assertEquals(OrderFromEnum.CUSTOMER, request.getOrderFrom());
        assertEquals("Dara Sok", request.getCustomerName());
        assertEquals(1, request.getCart().getItems().size());
        assertEquals("Cappuccino", request.getCart().getItems().get(0).getProductName());
        assertEquals(new BigDecimal("8.50"), request.getCart().getFinalTotal());
    }
}
