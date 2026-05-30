package com.emenu.features.auth.specification;

import com.emenu.features.auth.models.UserSession;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

public class UserSessionSpecification {

    public static Specification<UserSession> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<UserSession> byStatuses(List<String> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    public static Specification<UserSession> byDeviceTypes(List<String> deviceTypes) {
        return (root, query, cb) -> {
            if (deviceTypes == null || deviceTypes.isEmpty()) return cb.conjunction();
            return root.get("deviceType").in(deviceTypes);
        };
    }

    public static Specification<UserSession> searchByDeviceOrLocation(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("deviceName")), pattern),
                    cb.like(cb.lower(root.get("location")), pattern)
            );
        };
    }

    public static Specification<UserSession> filterSessions(UUID userId, List<String> statuses, List<String> deviceTypes, String search) {
        return byUserId(userId)
                .and(byStatuses(statuses))
                .and(byDeviceTypes(deviceTypes))
                .and(searchByDeviceOrLocation(search));
    }
}
