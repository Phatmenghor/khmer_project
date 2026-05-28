package com.emenu.features.subscription.dto.response;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.enums.sub_scription.SubscriptionPaymentType;
import com.emenu.enums.sub_scription.SubscriptionPlanDurationType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class SubscriptionHistoryResponse {

    private UUID subscriptionId;
    private UUID businessId;
    private String businessName;
    private String logoBusinessUrl;
    private UUID planId;
    private String planName;
    private BigDecimal planPrice;
    private SubscriptionPlanDurationType planDurationType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean autoRenew;
    private String status;
    private Long daysRemaining;
    private String paymentStatus;
    private BigDecimal totalPaid;
    private PaymentItem payment;

    @Data
    public static class PaymentItem {
        private UUID paymentId;
        private BigDecimal amount;
        private PaymentMethod paymentMethod;
        private SubscriptionPaymentType paymentType;
        private SubscriptionPaymentStatus status;
        private String referenceNumber;
        private String notes;
        private String imageUrl;
        private LocalDateTime paidAt;
    }
}
