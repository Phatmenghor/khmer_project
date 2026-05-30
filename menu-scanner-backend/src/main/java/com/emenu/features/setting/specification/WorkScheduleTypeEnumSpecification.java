package com.emenu.features.setting.specification;

import com.emenu.features.setting.models.WorkScheduleTypeEnum;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class WorkScheduleTypeEnumSpecification {

    public static Specification<WorkScheduleTypeEnum> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<WorkScheduleTypeEnum> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<WorkScheduleTypeEnum> searchByEnumName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("enumName")), pattern);
        };
    }

    public static Specification<WorkScheduleTypeEnum> findWithFilters(UUID businessId, String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(searchByEnumName(search));
    }
}
