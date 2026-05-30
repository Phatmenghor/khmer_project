package com.emenu.features.main.specification;

import com.emenu.enums.common.Status;
import com.emenu.features.main.models.Banner;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class BannerSpecification {

    public static Specification<Banner> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Banner> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Banner> byStatus(Status status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<Banner> searchByTitle(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("title")), pattern);
        };
    }

    public static Specification<Banner> filterBanners(UUID businessId, Status status, String search) {
        return active().and(byBusinessId(businessId)).and(byStatus(status)).and(searchByTitle(search));
    }
}
