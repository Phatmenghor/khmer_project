package com.emenu.features.order.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class POSCheckoutResponse {

    private UUID id;
    private String orderNumber;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;

    // POS-specific fields
    private String orderStatus; // Always "COMPLETED" for POS orders
    private String source; // Always "POS"
    private String paymentMethod; // "CASH" (only option)
    private String paymentStatus; // "PAID"

    // Metadata
    private String createdBy;
    private LocalDateTime createdAt;
    private String customerName;
    private String customerPhone;
}
