package com.emenu.features.auth.specification;

import com.emenu.enums.user.AccountStatus;
import com.emenu.enums.user.UserType;
import com.emenu.features.auth.models.User;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

public class UserSpecification {

    public static Specification<User> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<User> byUserIdentifier(String userIdentifier) {
        return (root, query, cb) -> {
            if (userIdentifier == null || userIdentifier.isBlank()) return cb.conjunction();
            return cb.equal(root.get("userIdentifier"), userIdentifier);
        };
    }

    public static Specification<User> byUserType(UserType userType) {
        return (root, query, cb) -> {
            if (userType == null) return cb.conjunction();
            return cb.equal(root.get("userType"), userType);
        };
    }

    public static Specification<User> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<User> byAccountStatus(AccountStatus status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("accountStatus"), status);
        };
    }

    public static Specification<User> byAccountStatuses(List<AccountStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("accountStatus").in(statuses);
        };
    }

    public static Specification<User> byUserTypes(List<UserType> userTypes) {
        return (root, query, cb) -> {
            if (userTypes == null || userTypes.isEmpty()) return cb.conjunction();
            return root.get("userType").in(userTypes);
        };
    }

    public static Specification<User> byRoles(List<String> roles) {
        return (root, query, cb) -> {
            if (roles == null || roles.isEmpty()) return cb.conjunction();
            return root.join("roles").get("name").in(roles);
        };
    }

    public static Specification<User> searchByIdentifierOrProfile(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            var profileJoin = root.join("profile", JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(root.get("userIdentifier")), pattern),
                    cb.like(cb.lower(profileJoin.get("email")), pattern),
                    cb.like(cb.lower(profileJoin.get("firstName")), pattern),
                    cb.like(cb.lower(profileJoin.get("lastName")), pattern)
            );
        };
    }

    public static Specification<User> byTelegramId(Long telegramId) {
        return (root, query, cb) -> {
            if (telegramId == null) return cb.conjunction();
            return cb.equal(root.join("telegram").get("telegramId"), telegramId);
        };
    }

    public static Specification<User> searchUsers(UUID businessId, List<UserType> userTypes,
                                                   List<AccountStatus> accountStatuses, List<String> roles, String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(byUserTypes(userTypes))
                .and(byAccountStatuses(accountStatuses))
                .and(byRoles(roles))
                .and(searchByIdentifierOrProfile(search));
    }
}
