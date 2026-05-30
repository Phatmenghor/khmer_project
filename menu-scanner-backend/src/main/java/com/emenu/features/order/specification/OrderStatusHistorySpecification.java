package com.emenu.features.order.specification;

import com.emenu.features.order.models.OrderStatusHistory;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

/**
 * Order Status History Specifications - Type-safe filtering
 *
 * Usage:
 * ```
 * Specification<OrderStatusHistory> spec = OrderStatusHistorySpecification.forOrder(orderId);
 * List<OrderStatusHistory> history = historyRepository.findAll(spec);
 * ```
 */
public class OrderStatusHistorySpecification extends BaseSpecification {

    // ============ PUBLIC API METHODS ============

    /**
     * Filter by order ID
     */
    public static Specification<OrderStatusHistory> forOrder(UUID orderId) {
        return (root, query, cb) -> {
            if (orderId == null) return cb.conjunction();
            return cb.equal(root.get("orderId"), orderId);
        };
    }
}
