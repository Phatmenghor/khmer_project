package com.emenu.features.auth.specification;

import com.emenu.features.auth.models.RefreshToken;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class RefreshTokenSpecification {

    public static Specification<RefreshToken> byToken(String token) {
        return (root, query, cb) -> {
            if (token == null || token.isBlank()) return cb.conjunction();
            return cb.equal(root.get("token"), token);
        };
    }

    public static Specification<RefreshToken> valid() {
        return (root, query, cb) -> cb.and(
                cb.equal(root.get("isRevoked"), false),
                cb.equal(root.get("isDeleted"), false)
        );
    }

    public static Specification<RefreshToken> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.get("userId"), userId);
        };
    }

    public static Specification<RefreshToken> findByTokenAndValid(String token) {
        return valid().and(byToken(token));
    }

    public static Specification<RefreshToken> findAllValidByUserId(UUID userId) {
        return valid().and(byUserId(userId));
    }
}
