package com.emenu.features.order.specification;

import com.emenu.features.order.models.OrderDeliveryOption;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class OrderDeliveryOptionSpecification {

    public static Specification<OrderDeliveryOption> hasOrderId(UUID orderId) {
        return (root, query, cb) -> {
            if (orderId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("orderId"), orderId);
        };
    }
}
