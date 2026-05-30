package com.emenu.features.order.specification;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.models.Order;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Order Specifications - Type-safe filtering for Order entity
 *
 * Usage in Service:
 * ```
 * Specification<Order> spec = OrderSpecification.forBusiness(businessId)
 *     .and(OrderSpecification.byStatus(orderStatus));
 * Page<Order> results = orderRepository.findAll(spec, pageable);
 * ```
 */
public class OrderSpecification {

    // ============ PUBLIC API METHODS ============
    // Services should ONLY use these methods

    /**
     * Get all non-deleted orders (base filter)
     */
    public static Specification<Order> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    /**
     * Filter by business ID
     */
    public static Specification<Order> forBusiness(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    /**
     * Filter by customer ID
     */
    public static Specification<Order> forCustomer(UUID customerId) {
        return (root, query, cb) -> {
            if (customerId == null) return cb.conjunction();
            return cb.equal(root.get("customerId"), customerId);
        };
    }

    /**
     * Filter by order status
     */
    public static Specification<Order> byStatus(OrderStatus status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("orderStatus"), status);
        };
    }

    /**
     * Filter by payment status
     */
    public static Specification<Order> byPaymentStatus(PaymentStatus paymentStatus) {
        return (root, query, cb) -> {
            if (paymentStatus == null) return cb.conjunction();
            return cb.equal(root.get("paymentStatus"), paymentStatus);
        };
    }

    /**
     * Search by order number (case-insensitive LIKE)
     */
    public static Specification<Order> searchByOrderNumber(String orderNumber) {
        return (root, query, cb) -> {
            if (orderNumber == null || orderNumber.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("orderNumber")), "%" + orderNumber.toLowerCase() + "%");
        };
    }

    /**
     * Filter orders created from this date onwards
     */
    public static Specification<Order> createdFrom(LocalDateTime startDate) {
        return (root, query, cb) -> {
            if (startDate == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("createdAt"), startDate);
        };
    }

    /**
     * Filter orders created up to this date
     */
    public static Specification<Order> createdUntil(LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (endDate == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("createdAt"), endDate);
        };
    }

    /**
     * Combine multiple filters - helper for common use cases
     *
     * Usage:
     * ```
     * Specification<Order> spec = OrderSpecification.buildFilter(
     *     businessId, orderStatus, paymentStatus, startDate, endDate, searchTerm
     * );
     * ```
     */
    public static Specification<Order> buildFilter(
            UUID businessId,
            OrderStatus orderStatus,
            PaymentStatus paymentStatus,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String searchTerm) {

        return active()
                .and(forBusiness(businessId))
                .and(byStatus(orderStatus))
                .and(byPaymentStatus(paymentStatus))
                .and(createdFrom(startDate))
                .and(createdUntil(endDate))
                .and(searchByOrderNumber(searchTerm));
    }
}
