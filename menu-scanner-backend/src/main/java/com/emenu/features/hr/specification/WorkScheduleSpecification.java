package com.emenu.features.hr.specification;

import com.emenu.features.hr.models.WorkSchedule;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class WorkScheduleSpecification {

    public static Specification<WorkSchedule> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<WorkSchedule> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<WorkSchedule> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<WorkSchedule> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<WorkSchedule> findWithFilters(UUID businessId, UUID userId, String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(byUserId(userId))
                .and(searchByName(search));
    }
}
