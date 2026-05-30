package com.emenu.features.order.specification;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.models.OrderPayment;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Order Payment Specifications - Type-safe filtering for OrderPayment entity
 *
 * Usage in Service:
 * ```
 * Specification<OrderPayment> spec = OrderPaymentSpecification.active()
 *     .and(OrderPaymentSpecification.forBusiness(businessId))
 *     .and(OrderPaymentSpecification.withStatuses(statuses));
 * Page<OrderPayment> results = paymentRepository.findAll(spec, pageable);
 * ```
 */
public class OrderPaymentSpecification extends BaseSpecification {

    // ============ PUBLIC API METHODS ============
    // Services should ONLY use these methods

    /**
     * Get all non-deleted payments (base filter)
     */
    public static Specification<OrderPayment> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    /**
     * Filter by business ID
     */
    public static Specification<OrderPayment> forBusiness(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    /**
     * Filter by one or more payment statuses
     */
    public static Specification<OrderPayment> withStatuses(List<PaymentStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    /**
     * Filter by payment method
     */
    public static Specification<OrderPayment> byPaymentMethod(PaymentMethod method) {
        return (root, query, cb) -> {
            if (method == null) return cb.conjunction();
            return cb.equal(root.get("paymentMethod"), method);
        };
    }

    /**
     * Filter by customer payment method
     */
    public static Specification<OrderPayment> byCustomerPaymentMethod(String customerMethod) {
        return (root, query, cb) -> {
            if (customerMethod == null || customerMethod.isBlank()) return cb.conjunction();
            return cb.equal(root.get("customerPaymentMethod"), customerMethod);
        };
    }

    /**
     * Search by payment reference (case-insensitive LIKE)
     */
    public static Specification<OrderPayment> searchByReference(String reference) {
        return (root, query, cb) -> {
            if (reference == null || reference.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("paymentReference")), "%" + reference.toLowerCase() + "%");
        };
    }

    /**
     * Filter payments created from this date onwards
     */
    public static Specification<OrderPayment> createdFrom(LocalDateTime startDate) {
        return (root, query, cb) -> {
            if (startDate == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("createdAt"), startDate);
        };
    }

    /**
     * Filter payments created up to this date
     */
    public static Specification<OrderPayment> createdUntil(LocalDateTime endDate) {
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
     * Specification<OrderPayment> spec = OrderPaymentSpecification.buildFilter(
     *     businessId, statuses, paymentMethod, customerMethod, startDate, endDate, searchTerm
     * );
     * ```
     */
    public static Specification<OrderPayment> buildFilter(
            UUID businessId,
            List<PaymentStatus> statuses,
            PaymentMethod paymentMethod,
            String customerPaymentMethod,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String searchTerm) {

        return active()
                .and(forBusiness(businessId))
                .and(withStatuses(statuses))
                .and(byPaymentMethod(paymentMethod))
                .and(byCustomerPaymentMethod(customerPaymentMethod))
                .and(createdFrom(startDate))
                .and(createdUntil(endDate))
                .and(searchByReference(searchTerm));
    }
}
