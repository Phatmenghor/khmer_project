package com.emenu.features.main.specification;

import com.emenu.enums.common.Status;
import com.emenu.features.main.models.Brand;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class BrandSpecification {

    public static Specification<Brand> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Brand> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Brand> byStatus(Status status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Brand> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<Brand> filterBrands(UUID businessId, Status status, String search) {
        return active().and(byBusinessId(businessId)).and(byStatus(status)).and(searchByName(search));
    }
}
