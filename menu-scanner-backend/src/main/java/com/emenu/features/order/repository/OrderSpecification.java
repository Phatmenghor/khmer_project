package com.emenu.features.order.repository;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.models.Order;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.UUID;

public class OrderSpecification {

    public static Specification<Order> isNotDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Order> hasBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Order> hasOrderStatus(OrderStatus orderStatus) {
        return (root, query, cb) -> {
            if (orderStatus == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("orderStatus"), orderStatus);
        };
    }

    public static Specification<Order> hasPaymentMethod(PaymentMethod paymentMethod) {
        return (root, query, cb) -> {
            if (paymentMethod == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("paymentMethod"), paymentMethod);
        };
    }

    public static Specification<Order> hasPaymentStatus(PaymentStatus paymentStatus) {
        return (root, query, cb) -> {
            if (paymentStatus == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("paymentStatus"), paymentStatus);
        };
    }

    public static Specification<Order> createdAtGreaterThanOrEqualTo(LocalDateTime startDate) {
        return (root, query, cb) -> {
            if (startDate == null) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(root.get("createdAt"), startDate);
        };
    }

    public static Specification<Order> createdAtLessThanOrEqualTo(LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (endDate == null) {
                return cb.conjunction();
            }
            return cb.lessThanOrEqualTo(root.get("createdAt"), endDate);
        };
    }

    public static Specification<Order> buildFilterSpecification(
            UUID businessId,
            OrderStatus orderStatus,
            PaymentMethod paymentMethod,
            PaymentStatus paymentStatus,
            LocalDateTime startDate,
            LocalDateTime endDate) {
        return isNotDeleted()
                .and(hasBusinessId(businessId))
                .and(hasOrderStatus(orderStatus))
                .and(hasPaymentMethod(paymentMethod))
                .and(hasPaymentStatus(paymentStatus))
                .and(createdAtGreaterThanOrEqualTo(startDate))
                .and(createdAtLessThanOrEqualTo(endDate));
    }
}
