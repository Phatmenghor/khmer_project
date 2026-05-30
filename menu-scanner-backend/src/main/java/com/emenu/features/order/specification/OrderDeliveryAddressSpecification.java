package com.emenu.features.order.specification;

import com.emenu.features.order.models.OrderDeliveryAddress;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class OrderDeliveryAddressSpecification {

    public static Specification<OrderDeliveryAddress> hasOrderId(UUID orderId) {
        return (root, query, cb) -> {
            if (orderId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("orderId"), orderId);
        };
    }
}
