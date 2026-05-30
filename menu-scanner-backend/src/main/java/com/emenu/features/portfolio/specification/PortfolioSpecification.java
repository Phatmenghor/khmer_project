package com.emenu.features.portfolio.specification;

import com.emenu.features.portfolio.models.PortfolioProfile;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class PortfolioSpecification {

    public static Specification<PortfolioProfile> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<PortfolioProfile> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<PortfolioProfile> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<PortfolioProfile> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("fullName")), "%" + search.toLowerCase() + "%");
        };
    }

    public static Specification<PortfolioProfile> filterProfiles(UUID userId, UUID businessId, String search) {
        return active().and(byUserId(userId)).and(byBusinessId(businessId)).and(searchByName(search));
    }
}
