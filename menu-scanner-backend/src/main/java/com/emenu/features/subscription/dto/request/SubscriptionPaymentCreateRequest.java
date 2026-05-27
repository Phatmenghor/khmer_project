package com.emenu.features.subscription.dto.request;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.enums.sub_scription.SubscriptionPaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class SubscriptionPaymentCreateRequest {

    @NotNull(message = "Business ID is required")
    private UUID businessId;

    @NotNull(message = "Subscription ID is required")
    private UUID subscriptionId;

    @NotNull(message = "Plan ID is required")
    private UUID planId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private SubscriptionPaymentType paymentType = SubscriptionPaymentType.SUBSCRIPTION;

    private SubscriptionPaymentStatus status = SubscriptionPaymentStatus.PENDING;

    private String referenceNumber;

    private String notes;

    private String imageUrl;
}
