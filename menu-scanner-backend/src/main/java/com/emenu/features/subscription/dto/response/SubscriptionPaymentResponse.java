package com.emenu.features.subscription.dto.response;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.enums.sub_scription.SubscriptionPaymentType;
import com.emenu.shared.dto.BaseAuditResponse;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class SubscriptionPaymentResponse extends BaseAuditResponse {
    private UUID businessId;
    private String businessName;
    private UUID subscriptionId;
    private UUID planId;
    private String planName;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private SubscriptionPaymentType paymentType;
    private SubscriptionPaymentStatus status;
    private String referenceNumber;
    private String notes;
    private String imageUrl;
}
