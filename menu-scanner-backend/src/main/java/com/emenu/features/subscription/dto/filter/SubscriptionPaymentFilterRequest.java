package com.emenu.features.subscription.dto.filter;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.enums.sub_scription.SubscriptionPaymentType;
import com.emenu.shared.dto.BaseFilterRequest;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@EqualsAndHashCode(callSuper = true)
@Data
public class SubscriptionPaymentFilterRequest extends BaseFilterRequest {
    private UUID businessId;
    private UUID subscriptionId;
    private UUID planId;
    private List<PaymentMethod> paymentMethods;
    private List<SubscriptionPaymentStatus> statuses;
    private List<SubscriptionPaymentType> paymentTypes;
    private LocalDate createdFrom;
    private LocalDate createdTo;
}
