package com.emenu.features.subscription.mapper;

import com.emenu.features.subscription.dto.response.SubscriptionHistoryResponse;
import com.emenu.features.subscription.models.Subscription;
import com.emenu.features.subscription.models.SubscriptionPayment;
import org.mapstruct.*;

import java.math.BigDecimal;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SubscriptionHistoryMapper {

    @Mapping(target = "subscriptionId", source = "id")
    @Mapping(target = "businessId", source = "businessId")
    @Mapping(target = "startDate", expression = "java(subscription.getStartDate() != null ? subscription.getStartDate().toLocalDate() : null)")
    @Mapping(target = "endDate", expression = "java(subscription.getEndDate() != null ? subscription.getEndDate().toLocalDate() : null)")
    @Mapping(target = "autoRenew", source = "autoRenew")
    @Mapping(target = "status", expression = "java(subscription.getStatus())")
    @Mapping(target = "daysRemaining", expression = "java(subscription.getDaysRemaining())")
    @Mapping(target = "businessName", source = "business.name")
    @Mapping(target = "planId", source = "plan.id")
    @Mapping(target = "planName", source = "plan.name")
    @Mapping(target = "planPrice", source = "plan.price")
    @Mapping(target = "planDurationType", source = "plan.durationType")
    @Mapping(target = "payment", expression = "java(toPaymentItem(subscription.getPayment()))")
    @Mapping(target = "totalPaid", expression = "java(calculateTotalPaid(subscription.getPayment()))")
    @Mapping(target = "paymentStatus", expression = "java(calculatePaymentStatus(subscription))")
    SubscriptionHistoryResponse toResponse(Subscription subscription);

    default SubscriptionHistoryResponse.PaymentItem toPaymentItem(SubscriptionPayment payment) {
        if (payment == null) return null;
        SubscriptionHistoryResponse.PaymentItem item = new SubscriptionHistoryResponse.PaymentItem();
        item.setPaymentId(payment.getId());
        item.setAmount(payment.getAmount());
        item.setPaymentMethod(payment.getPaymentMethod());
        item.setPaymentType(payment.getPaymentType());
        item.setStatus(payment.getStatus());
        item.setReferenceNumber(payment.getReferenceNumber());
        item.setImageUrl(payment.getImageUrl());
        item.setPaidAt(payment.getCreatedAt());
        return item;
    }

    default BigDecimal calculateTotalPaid(SubscriptionPayment payment) {
        if (payment != null && payment.getStatus() != null && payment.getStatus().isCompleted()) {
            return payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
        }
        return BigDecimal.ZERO;
    }

    default String calculatePaymentStatus(Subscription subscription) {
        if (subscription == null) return "UNPAID";
        SubscriptionPayment payment = subscription.getPayment();
        if (payment == null) return "UNPAID";

        if (payment.getStatus() != null && payment.getStatus().isPending()) {
            return "PENDING";
        }
        if (payment.getStatus() != null && payment.getStatus().isCompleted()) {
            BigDecimal planPrice = subscription.getPlan() != null && subscription.getPlan().getPrice() != null
                    ? subscription.getPlan().getPrice() : BigDecimal.ZERO;
            BigDecimal totalPaid = calculateTotalPaid(payment);
            if (totalPaid.compareTo(planPrice) >= 0) return "PAID";
            if (totalPaid.compareTo(BigDecimal.ZERO) > 0) return "PARTIALLY_PAID";
        }
        return "UNPAID";
    }
}
