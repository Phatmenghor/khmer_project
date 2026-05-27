package com.emenu.features.subscription.dto.request;

import com.emenu.enums.payment.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SubscriptionRenewRequest {
    private UUID newPlanId;

    // Payment fields — amount defaults to plan price, method defaults to CASH
    private BigDecimal paymentAmount;
    private PaymentMethod paymentMethod;
    private String paymentReferenceNumber;
    private String paymentNotes;
    private String paymentImageUrl;
}