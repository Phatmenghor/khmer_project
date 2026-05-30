package com.emenu.features.auth.specification;

import com.emenu.enums.user.UserType;
import com.emenu.features.auth.models.Role;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

public class RoleSpecification {

    public static Specification<Role> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Role> byName(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return cb.conjunction();
            return cb.equal(root.get("name"), name);
        };
    }

    public static Specification<Role> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Role> byUserTypes(List<UserType> userTypes) {
        return (root, query, cb) -> {
            if (userTypes == null || userTypes.isEmpty()) return cb.conjunction();
            return root.get("userType").in(userTypes);
        };
    }

    public static Specification<Role> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%");
        };
    }

    public static Specification<Role> businessOrPlatformRoles(UUID businessId, boolean includeAll) {
        return (root, query, cb) -> {
            if (!includeAll) return cb.equal(root.get("businessId"), businessId);
            if (businessId != null) {
                return cb.or(
                    cb.equal(root.get("businessId"), businessId),
                    cb.isNull(root.get("businessId"))
                );
            }
            return cb.conjunction();
        };
    }

    public static Specification<Role> findAllWithFilters(UUID businessId, List<UserType> userTypes, String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(byUserTypes(userTypes))
                .and(searchByName(search));
    }

    public static Specification<Role> findAllWithFiltersAndPlatform(UUID businessId, List<UserType> userTypes, String search, boolean includeAll) {
        return active()
                .and(businessOrPlatformRoles(businessId, includeAll))
                .and(byUserTypes(userTypes))
                .and(searchByName(search));
    }
}
