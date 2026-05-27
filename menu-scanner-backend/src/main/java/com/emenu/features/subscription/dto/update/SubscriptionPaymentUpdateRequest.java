package com.emenu.features.subscription.dto.update;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.enums.sub_scription.SubscriptionPaymentType;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class SubscriptionPaymentUpdateRequest {
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private SubscriptionPaymentType paymentType;
    private SubscriptionPaymentStatus status;
    private String referenceNumber;
    private String notes;
    private String imageUrl;
}
