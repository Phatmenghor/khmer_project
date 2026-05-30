package com.emenu.features.subscription.specification;

import com.emenu.features.subscription.models.Subscription;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class SubscriptionSpecification {

    public static Specification<Subscription> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Subscription> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Subscription> byPlanId(UUID planId) {
        return (root, query, cb) -> {
            if (planId == null) return cb.conjunction();
            return cb.equal(root.get("planId"), planId);
        };
    }

    public static Specification<Subscription> byAutoRenew(Boolean autoRenew) {
        return (root, query, cb) -> {
            if (autoRenew == null) return cb.conjunction();
            return cb.equal(root.get("autoRenew"), autoRenew);
        };
    }

    public static Specification<Subscription> byStartDate(LocalDate startDate) {
        return (root, query, cb) -> {
            if (startDate == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(cb.function("CAST", java.sql.Date.class, root.get("startDate")), startDate);
        };
    }

    public static Specification<Subscription> byEndDate(LocalDate endDate) {
        return (root, query, cb) -> {
            if (endDate == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(cb.function("CAST", java.sql.Date.class, root.get("startDate")), endDate);
        };
    }

    public static Specification<Subscription> byStatus(String status, LocalDateTime now, LocalDateTime expiryThreshold) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return switch (status) {
                case "ACTIVE" -> cb.greaterThan(root.get("endDate"), now);
                case "EXPIRED" -> cb.lessThanOrEqualTo(root.get("endDate"), now);
                case "EXPIRING_SOON" -> cb.and(
                    cb.greaterThan(root.get("endDate"), now),
                    cb.lessThanOrEqualTo(root.get("endDate"), expiryThreshold)
                );
                default -> cb.conjunction();
            };
        };
    }

    public static Specification<Subscription> searchByBusinessOrPlan(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            var businessJoin = root.join("business", jakarta.persistence.criteria.JoinType.LEFT);
            var planJoin = root.join("plan", jakarta.persistence.criteria.JoinType.LEFT);
            return cb.or(
                cb.like(cb.lower(businessJoin.get("name")), pattern),
                cb.like(cb.lower(planJoin.get("name")), pattern)
            );
        };
    }

    public static Specification<Subscription> findWithFilters(
            UUID businessId,
            UUID planId,
            Boolean autoRenew,
            LocalDate startDate,
            LocalDate toDate,
            String status,
            LocalDateTime now,
            LocalDateTime expiryThreshold,
            String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(byPlanId(planId))
                .and(byAutoRenew(autoRenew))
                .and(byStartDate(startDate))
                .and(byEndDate(toDate))
                .and(byStatus(status, now, expiryThreshold))
                .and(searchByBusinessOrPlan(search));
    }
}
