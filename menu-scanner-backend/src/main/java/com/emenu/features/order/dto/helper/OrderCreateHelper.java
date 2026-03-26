package com.emenu.features.order.dto.helper;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Helper DTO for creating Order via MapStruct
 * Uses proper fields instead of JSON snapshots
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateHelper {
    private String orderNumber;
    private UUID customerId;
    private UUID businessId;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String customerNote;
    private String businessNote;

    // ===== Delivery Address Fields =====
    private String deliveryVillage;
    private String deliveryCommune;
    private String deliveryDistrict;
    private String deliveryProvince;
    private String deliveryStreetNumber;
    private String deliveryHouseNumber;
    private String deliveryNote;
    private BigDecimal deliveryLatitude;
    private BigDecimal deliveryLongitude;

    // ===== Delivery Option Fields =====
    private String deliveryOptionName;
    private String deliveryOptionDescription;
    private String deliveryOptionImageUrl;
    private BigDecimal deliveryOptionPrice;
    private BigDecimal deliveryFee;

    // Pricing - initialized with defaults, updated after items are processed
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
}
