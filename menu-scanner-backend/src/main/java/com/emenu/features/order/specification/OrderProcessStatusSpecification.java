package com.emenu.features.order.specification;

import com.emenu.features.order.models.OrderProcessStatus;
import org.springframework.data.jpa.domain.Specification;

public class OrderProcessStatusSpecification {

    public static Specification<OrderProcessStatus> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<OrderProcessStatus> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<OrderProcessStatus> filterOrderProcessStatuses(String search) {
        return active().and(searchByName(search));
    }
}
