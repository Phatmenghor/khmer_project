package com.emenu.features.order.specification;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.models.OrderPayment;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class OrderPaymentSpecification {

    public static Specification<OrderPayment> isNotDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<OrderPayment> hasBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<OrderPayment> hasStatus(List<PaymentStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) {
                return cb.conjunction();
            }
            return root.get("status").in(statuses);
        };
    }

    public static Specification<OrderPayment> hasPaymentMethod(PaymentMethod paymentMethod) {
        return (root, query, cb) -> {
            if (paymentMethod == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("paymentMethod"), paymentMethod);
        };
    }

    public static Specification<OrderPayment> hasCustomerPaymentMethod(String customerPaymentMethod) {
        return (root, query, cb) -> {
            if (customerPaymentMethod == null || customerPaymentMethod.isBlank()) {
                return cb.conjunction();
            }
            return cb.equal(root.get("customerPaymentMethod"), customerPaymentMethod);
        };
    }

    public static Specification<OrderPayment> createdFrom(LocalDateTime createdFrom) {
        return (root, query, cb) -> {
            if (createdFrom == null) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom);
        };
    }

    public static Specification<OrderPayment> createdTo(LocalDateTime createdTo) {
        return (root, query, cb) -> {
            if (createdTo == null) {
                return cb.conjunction();
            }
            return cb.lessThanOrEqualTo(root.get("createdAt"), createdTo);
        };
    }

    public static Specification<OrderPayment> searchByPaymentReference(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("paymentReference")), "%" + search.toLowerCase() + "%");
        };
    }

    public static Specification<OrderPayment> buildFilterSpecification(
            UUID businessId,
            List<PaymentStatus> statuses,
            PaymentMethod paymentMethod,
            String customerPaymentMethod,
            LocalDateTime createdFrom,
            LocalDateTime createdTo,
            String search) {
        return isNotDeleted()
                .and(hasBusinessId(businessId))
                .and(hasStatus(statuses))
                .and(hasPaymentMethod(paymentMethod))
                .and(hasCustomerPaymentMethod(customerPaymentMethod))
                .and(createdFrom(createdFrom))
                .and(createdTo(createdTo))
                .and(searchByPaymentReference(search));
    }
}
