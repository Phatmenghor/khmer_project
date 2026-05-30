package com.emenu.features.order.specification;

import com.emenu.enums.common.Status;
import com.emenu.features.order.models.DeliveryOption;
import org.springframework.data.jpa.domain.Specification;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class DeliveryOptionSpecification {

    public static Specification<DeliveryOption> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<DeliveryOption> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<DeliveryOption> byStatuses(List<Status> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    public static Specification<DeliveryOption> priceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) return cb.conjunction();
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("price"), minPrice, maxPrice);
            } else if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("price"), minPrice);
            } else {
                return cb.lessThanOrEqualTo(root.get("price"), maxPrice);
            }
        };
    }

    public static Specification<DeliveryOption> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<DeliveryOption> filterDeliveryOptions(UUID businessId, List<Status> statuses, String search, BigDecimal minPrice, BigDecimal maxPrice) {
        return active().and(byBusinessId(businessId)).and(byStatuses(statuses)).and(searchByName(search)).and(priceRange(minPrice, maxPrice));
    }
}
