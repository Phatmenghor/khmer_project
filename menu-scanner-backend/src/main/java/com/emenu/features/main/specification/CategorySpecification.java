package com.emenu.features.main.specification;

import com.emenu.enums.common.Status;
import com.emenu.features.main.models.Category;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class CategorySpecification {

    public static Specification<Category> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Category> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Category> byStatus(Status status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Category> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.joinOptional("business", jakarta.persistence.JoinType.LEFT).get("name")), pattern)
            );
        };
    }

    public static Specification<Category> filterCategories(UUID businessId, Status status, String search) {
        return active().and(byBusinessId(businessId)).and(byStatus(status)).and(searchByName(search));
    }
}
