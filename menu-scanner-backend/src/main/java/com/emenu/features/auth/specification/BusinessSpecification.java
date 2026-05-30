package com.emenu.features.auth.specification;

import com.emenu.enums.user.BusinessStatus;
import com.emenu.features.auth.models.Business;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.UUID;

public class BusinessSpecification {

    public static Specification<Business> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Business> byId(UUID id) {
        return (root, query, cb) -> {
            if (id == null) return cb.conjunction();
            return cb.equal(root.get("id"), id);
        };
    }

    public static Specification<Business> byOwnerId(UUID ownerId) {
        return (root, query, cb) -> {
            if (ownerId == null) return cb.conjunction();
            return cb.equal(root.get("ownerId"), ownerId);
        };
    }

    public static Specification<Business> byName(String name) {
        return (root, query, cb) -> {
            if (name == null || name.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
        };
    }

    public static Specification<Business> byPhone(String phone) {
        return (root, query, cb) -> {
            if (phone == null || phone.isBlank()) return cb.conjunction();
            return cb.equal(root.get("phoneNumber"), phone);
        };
    }

    public static Specification<Business> byEmail(String email) {
        return (root, query, cb) -> {
            if (email == null || email.isBlank()) return cb.conjunction();
            return cb.equal(root.get("email"), email);
        };
    }

    public static Specification<Business> byStatuses(List<BusinessStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    public static Specification<Business> withActiveSubscription(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) return cb.conjunction();
            return cb.equal(root.get("isSubscriptionActive"), isActive);
        };
    }

    public static Specification<Business> searchByNameEmailPhoneAddress(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(cb.lower(root.get("phone")), pattern),
                    cb.like(cb.lower(root.get("address")), pattern)
            );
        };
    }

    public static Specification<Business> searchBusinesses(List<BusinessStatus> statuses,
                                                          Boolean hasActiveSubscription, String search) {
        return active()
                .and(byStatuses(statuses))
                .and(withActiveSubscription(hasActiveSubscription))
                .and(searchByNameEmailPhoneAddress(search));
    }
}
