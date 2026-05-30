package com.emenu.features.subscription.specification;

import com.emenu.enums.sub_scription.SubscriptionPlanStatus;
import com.emenu.features.subscription.models.SubscriptionPlan;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public class SubscriptionPlanSpecification {

    public static Specification<SubscriptionPlan> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<SubscriptionPlan> byStatuses(List<SubscriptionPlanStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    public static Specification<SubscriptionPlan> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<SubscriptionPlan> filterPlans(List<SubscriptionPlanStatus> statuses, String search) {
        return active()
                .and(byStatuses(statuses))
                .and(searchByName(search));
    }
}
