package com.emenu.features.order.specification;

import com.emenu.features.order.models.Payment;
import org.springframework.data.jpa.domain.Specification;
import java.util.UUID;

public class PaymentSpecification {

    public static Specification<Payment> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Payment> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Payment> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<Payment> filterPayments(UUID businessId, String search) {
        return active().and(byBusinessId(businessId)).and(searchByName(search));
    }
}
