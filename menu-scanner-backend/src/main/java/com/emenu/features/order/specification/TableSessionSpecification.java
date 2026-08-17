package com.emenu.features.order.specification;

import com.emenu.features.order.models.TableSession;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class TableSessionSpecification {

    public static Specification<TableSession> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<TableSession> forBusiness(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<TableSession> forTable(UUID tableId) {
        return (root, query, cb) -> {
            if (tableId == null) return cb.conjunction();
            return cb.equal(root.get("tableId"), tableId);
        };
    }

    public static Specification<TableSession> byStatus(String status) {
        return (root, query, cb) -> {
            if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) return cb.conjunction();
            return cb.equal(root.get("status"), status.trim().toUpperCase());
        };
    }

    public static Specification<TableSession> searchBySessionNumberOrTableNumber(String searchTerm) {
        return (root, query, cb) -> {
            if (searchTerm == null || searchTerm.isBlank()) return cb.conjunction();
            String term = "%" + searchTerm.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("sessionNumber")), term),
                    cb.like(cb.lower(root.get("tableNumber")), term)
            );
        };
    }

    public static Specification<TableSession> defaultOrder() {
        return (root, query, cb) -> {
            if (query != null && Long.class != query.getResultType() && long.class != query.getResultType()) {
                var statusOrder = cb.selectCase(root.<String>get("status"))
                        .when("PENDING", 1)
                        .when("ACTIVE", 2)
                        .when("CLOSED", 3)
                        .when("CANCELLED", 4)
                        .otherwise(5);

                query.orderBy(
                        cb.asc(statusOrder),
                        cb.asc(root.get("tableNumber")),
                        cb.desc(root.get("startedAt"))
                );
            }
            return cb.conjunction();
        };
    }

    public static Specification<TableSession> buildFilter(
            UUID businessId,
            UUID tableId,
            String status,
            String searchTerm) {
        return active()
                .and(forBusiness(businessId))
                .and(forTable(tableId))
                .and(byStatus(status))
                .and(searchBySessionNumberOrTableNumber(searchTerm))
                .and(defaultOrder());
    }
}
