package com.emenu.features.order.specification;

import com.emenu.enums.order.TableStatus;
import com.emenu.features.order.models.DiningTable;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class DiningTableSpecification {

    public static Specification<DiningTable> notDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<DiningTable> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<DiningTable> byStatus(TableStatus status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<DiningTable> byZone(String zone) {
        return (root, query, cb) -> {
            if (zone == null || zone.isBlank() || "ALL".equalsIgnoreCase(zone)) return cb.conjunction();
            return cb.equal(root.get("zone"), zone);
        };
    }

    public static Specification<DiningTable> filterTables(UUID businessId, TableStatus status, String zone) {
        return notDeleted()
            .and(byBusinessId(businessId))
            .and(byStatus(status))
            .and(byZone(zone));
    }
}
