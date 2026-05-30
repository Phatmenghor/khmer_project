package com.emenu.features.stock.specification;

import com.emenu.features.stock.models.StockMovement;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.UUID;

public class StockMovementSpecification {

    public static Specification<StockMovement> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<StockMovement> byProductId(UUID productId) {
        return (root, query, cb) -> {
            if (productId == null) return cb.conjunction();
            return cb.equal(root.get("productId"), productId);
        };
    }

    public static Specification<StockMovement> byWarehouseId(UUID warehouseId) {
        return (root, query, cb) -> {
            if (warehouseId == null) return cb.conjunction();
            return cb.equal(root.get("warehouseId"), warehouseId);
        };
    }

    public static Specification<StockMovement> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<StockMovement> dateRange(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return cb.conjunction();
            if (from != null && to != null) {
                return cb.between(root.get("createdAt"), from, to);
            } else if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            } else {
                return cb.lessThanOrEqualTo(root.get("createdAt"), to);
            }
        };
    }

    public static Specification<StockMovement> filterMovements(UUID productId, UUID warehouseId,
                                                               UUID businessId, LocalDateTime from, LocalDateTime to) {
        return active()
                .and(byProductId(productId))
                .and(byWarehouseId(warehouseId))
                .and(byBusinessId(businessId))
                .and(dateRange(from, to));
    }
}
