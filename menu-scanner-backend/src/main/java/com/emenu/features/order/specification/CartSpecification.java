package com.emenu.features.order.specification;

import com.emenu.features.order.models.Cart;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class CartSpecification {

    public static Specification<Cart> isNotDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Cart> hasUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<Cart> hasBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Cart> byUserAndBusiness(UUID userId, UUID businessId) {
        return isNotDeleted()
                .and(hasUserId(userId))
                .and(hasBusinessId(businessId));
    }
}
