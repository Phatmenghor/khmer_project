package com.emenu.features.auth.specification;

import com.emenu.enums.user.BusinessStatus;
import com.emenu.features.auth.models.Business;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class BusinessSpecification {

    public static Specification<Business> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Business> byStatuses(List<BusinessStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    public static Specification<Business> byActiveSubscription(Boolean hasActiveSubscription) {
        return (root, query, cb) -> {
            if (hasActiveSubscription == null) return cb.conjunction();
            return cb.equal(root.get("isSubscriptionActive"), hasActiveSubscription);
        };
    }

    public static Specification<Business> searchByNameOrEmail(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern)
            );
        };
    }

    public static Specification<Business> filterBusinesses(List<BusinessStatus> statuses, Boolean hasActiveSubscription, String search) {
        return active()
                .and(byStatuses(statuses))
                .and(byActiveSubscription(hasActiveSubscription))
                .and(searchByNameOrEmail(search));
    }
}
