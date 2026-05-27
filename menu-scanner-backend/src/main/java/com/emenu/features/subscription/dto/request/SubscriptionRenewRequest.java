package com.emenu.features.subscription.dto.request;

import com.emenu.enums.payment.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SubscriptionRenewRequest {
    private UUID newPlanId;
    private Boolean createPayment = false;
    private String paymentImageUrl;
    private BigDecimal paymentAmount;
    private PaymentMethod paymentMethod;
    private String paymentReferenceNumber;
    private String paymentNotes;

    public boolean shouldCreatePayment() {
        return Boolean.TRUE.equals(createPayment) && paymentAmount != null &&
               paymentAmount.compareTo(BigDecimal.ZERO) > 0 && paymentMethod != null;
    }
}