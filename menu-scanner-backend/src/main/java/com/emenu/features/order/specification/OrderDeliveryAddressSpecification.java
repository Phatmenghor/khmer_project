package com.emenu.features.order.specification;

import com.emenu.features.order.models.OrderDeliveryAddress;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

/**
 * Order Delivery Address Specifications - Type-safe filtering
 *
 * Usage:
 * ```
 * Specification<OrderDeliveryAddress> spec = OrderDeliveryAddressSpecification.forOrder(orderId);
 * Optional<OrderDeliveryAddress> address = addressRepository.findOne(spec);
 * ```
 */
public class OrderDeliveryAddressSpecification extends BaseSpecification {

    // ============ PUBLIC API METHODS ============

    /**
     * Filter by order ID
     */
    public static Specification<OrderDeliveryAddress> forOrder(UUID orderId) {
        return (root, query, cb) -> {
            if (orderId == null) return cb.conjunction();
            return cb.equal(root.get("orderId"), orderId);
        };
    }
}
