package com.emenu.features.order.specification;

import com.emenu.features.order.models.BusinessExchangeRate;
import org.springframework.data.jpa.domain.Specification;
import java.util.UUID;

public class BusinessExchangeRateSpecification {

    public static Specification<BusinessExchangeRate> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<BusinessExchangeRate> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<BusinessExchangeRate> searchByCurrencyCode(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toUpperCase() + "%";
            return cb.like(cb.upper(root.get("currencyCode")), pattern);
        };
    }

    public static Specification<BusinessExchangeRate> filterExchangeRates(UUID businessId, String search) {
        return active().and(byBusinessId(businessId)).and(searchByCurrencyCode(search));
    }
}
