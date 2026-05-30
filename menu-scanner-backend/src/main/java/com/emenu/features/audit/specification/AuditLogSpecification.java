package com.emenu.features.audit.specification;

import com.emenu.enums.user.UserType;
import com.emenu.features.audit.models.AuditLog;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class AuditLogSpecification {

    public static Specification<AuditLog> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<AuditLog> byUserIdentifier(String userIdentifier) {
        return (root, query, cb) -> {
            if (userIdentifier == null || userIdentifier.isBlank()) return cb.conjunction();
            return cb.equal(root.get("userIdentifier"), userIdentifier);
        };
    }

    public static Specification<AuditLog> byUserType(UserType userType) {
        return (root, query, cb) -> {
            if (userType == null) return cb.conjunction();
            return cb.equal(root.get("userType"), userType);
        };
    }

    public static Specification<AuditLog> searchByEndpointOrAction(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("endpoint")), pattern),
                    cb.like(cb.lower(root.get("action")), pattern)
            );
        };
    }

    public static Specification<AuditLog> filterAuditLogs(UUID userId, String userIdentifier, UserType userType, String search) {
        return byUserId(userId)
                .and(byUserIdentifier(userIdentifier))
                .and(byUserType(userType))
                .and(searchByEndpointOrAction(search));
    }
}
