package com.emenu.features.location.specification;

import com.emenu.features.location.models.Location;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class LocationSpecification {

    public static Specification<Location> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Location> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Location> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<Location> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<Location> filterLocations(UUID businessId, String search) {
        return active().and(byBusinessId(businessId)).and(searchByName(search));
    }

    public static Specification<Location> filterLocationsByUser(UUID userId, String search) {
        return active().and(byUserId(userId)).and(searchByName(search));
    }
}
