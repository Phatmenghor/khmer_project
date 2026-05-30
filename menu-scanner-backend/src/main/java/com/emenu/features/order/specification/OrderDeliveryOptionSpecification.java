package com.emenu.features.order.specification;

import com.emenu.features.order.models.OrderDeliveryOption;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

/**
 * Order Delivery Option Specifications - Type-safe filtering
 *
 * Usage:
 * ```
 * Specification<OrderDeliveryOption> spec = OrderDeliveryOptionSpecification.forOrder(orderId);
 * Optional<OrderDeliveryOption> option = optionRepository.findOne(spec);
 * ```
 */
public class OrderDeliveryOptionSpecification extends BaseSpecification {

    // ============ PUBLIC API METHODS ============

    /**
     * Filter by order ID
     */
    public static Specification<OrderDeliveryOption> forOrder(UUID orderId) {
        return (root, query, cb) -> {
            if (orderId == null) return cb.conjunction();
            return cb.equal(root.get("orderId"), orderId);
        };
    }
}
