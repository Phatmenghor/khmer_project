package com.emenu.features.order.specification;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.models.Payment;
import org.springframework.data.jpa.domain.Specification;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class PaymentSpecification {

    public static Specification<Payment> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Payment> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Payment> byPlanId(UUID planId) {
        return (root, query, cb) -> {
            if (planId == null) return cb.conjunction();
            return cb.equal(root.get("planId"), planId);
        };
    }

    public static Specification<Payment> byPaymentMethods(List<PaymentMethod> methods) {
        return (root, query, cb) -> {
            if (methods == null || methods.isEmpty()) return cb.conjunction();
            return root.get("paymentMethod").in(methods);
        };
    }

    public static Specification<Payment> byPaymentStatuses(List<PaymentStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    public static Specification<Payment> createdDateRange(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return cb.conjunction();
            if (from != null && to != null) {
                return cb.between(root.get("createdAt"), from, to);
            } else if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            } else {
                return cb.lessThanOrEqualTo(root.get("createdAt"), to);
            }
        };
    }

    public static Specification<Payment> searchByReference(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("referenceNumber")), pattern);
        };
    }

    public static Specification<Payment> filterPayments(UUID businessId, UUID planId, List<PaymentMethod> methods,
                                                       List<PaymentStatus> statuses, LocalDateTime from, LocalDateTime to, String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(byPlanId(planId))
                .and(byPaymentMethods(methods))
                .and(byPaymentStatuses(statuses))
                .and(createdDateRange(from, to))
                .and(searchByReference(search));
    }
}
