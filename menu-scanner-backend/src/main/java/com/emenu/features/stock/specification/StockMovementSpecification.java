package com.emenu.features.stock.specification;

import com.emenu.features.stock.models.StockMovement;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.UUID;

public class StockMovementSpecification {

    public static Specification<StockMovement> notDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<StockMovement> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<StockMovement> byProductStockId(UUID productStockId) {
        return (root, query, cb) -> {
            if (productStockId == null) return cb.conjunction();
            return cb.equal(root.get("productStockId"), productStockId);
        };
    }

    public static Specification<StockMovement> byOrderId(UUID orderId) {
        return (root, query, cb) -> {
            if (orderId == null) return cb.conjunction();
            return cb.equal(root.get("orderId"), orderId);
        };
    }

    public static Specification<StockMovement> byMovementType(String movementType) {
        return (root, query, cb) -> {
            if (movementType == null || movementType.isBlank()) return cb.conjunction();
            return cb.equal(root.get("movementType"), movementType);
        };
    }

    public static Specification<StockMovement> createdBetween(LocalDateTime fromDate, LocalDateTime toDate) {
        return (root, query, cb) -> {
            if (fromDate == null && toDate == null) return cb.conjunction();
            if (fromDate != null && toDate != null) {
                return cb.between(root.get("createdAt"), fromDate, toDate);
            }
            if (fromDate != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), fromDate);
            }
            return cb.lessThanOrEqualTo(root.get("createdAt"), toDate);
        };
    }

    public static Specification<StockMovement> filterMovements(
        UUID businessId, UUID productStockId, String movementType, LocalDateTime fromDate, LocalDateTime toDate
    ) {
        return notDeleted()
            .and(byBusinessId(businessId))
            .and(byProductStockId(productStockId))
            .and(byMovementType(movementType))
            .and(createdBetween(fromDate, toDate));
    }
}
