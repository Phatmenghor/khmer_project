package com.emenu.features.order.specification;

import com.emenu.enums.common.Status;
import com.emenu.features.order.models.OrderProcessStatus;
import org.springframework.data.jpa.domain.Specification;
import java.util.List;
import java.util.UUID;

public class OrderProcessStatusSpecification {

    public static Specification<OrderProcessStatus> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<OrderProcessStatus> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<OrderProcessStatus> byStatuses(List<Status> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    public static Specification<OrderProcessStatus> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<OrderProcessStatus> filterOrderProcessStatuses(UUID businessId, List<Status> statuses, String search) {
        return active().and(byBusinessId(businessId)).and(byStatuses(statuses)).and(searchByName(search));
    }
}
