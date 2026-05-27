package com.emenu.features.subscription.dto.request;

import com.emenu.enums.payment.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class SubscriptionCreateRequest {
    @NotNull(message = "Business ID is required")
    private UUID businessId;

    @NotNull(message = "Plan ID is required")
    private UUID planId;

    private LocalDate startDate;

    private Boolean autoRenew = false;

    // Payment fields — amount defaults to plan price, method defaults to CASH
    private BigDecimal paymentAmount;
    private PaymentMethod paymentMethod;
    private String paymentReferenceNumber;
    private String paymentNotes;
    private String paymentImageUrl;
}