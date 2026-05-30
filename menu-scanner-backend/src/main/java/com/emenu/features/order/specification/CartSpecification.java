package com.emenu.features.order.specification;

import com.emenu.features.order.models.Cart;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

/**
 * Cart Specifications - Type-safe filtering for Cart entity
 *
 * Usage in Service:
 * ```
 * Specification<Cart> spec = CartSpecification.active()
 *     .and(CartSpecification.forUser(userId))
 *     .and(CartSpecification.forBusiness(businessId));
 * Optional<Cart> cart = cartRepository.findOne(spec);
 * ```
 */
public class CartSpecification extends BaseSpecification {

    // ============ PUBLIC API METHODS ============

    /**
     * Get all non-deleted carts (base filter)
     */
    public static Specification<Cart> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    /**
     * Filter by user ID
     */
    public static Specification<Cart> forUser(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    /**
     * Filter by business ID
     */
    public static Specification<Cart> forBusiness(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    /**
     * Combine filters for user and business - most common use case
     */
    public static Specification<Cart> forUserAndBusiness(UUID userId, UUID businessId) {
        return active()
                .and(forUser(userId))
                .and(forBusiness(businessId));
    }
}
