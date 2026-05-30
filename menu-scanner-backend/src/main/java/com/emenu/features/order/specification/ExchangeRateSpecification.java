package com.emenu.features.order.specification;

import com.emenu.features.order.models.ExchangeRate;
import org.springframework.data.jpa.domain.Specification;

public class ExchangeRateSpecification {

    public static Specification<ExchangeRate> notDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<ExchangeRate> byIsActive(Boolean isActive) {
        return (root, query, cb) -> {
            if (isActive == null) return cb.conjunction();
            return cb.equal(root.get("isActive"), isActive);
        };
    }

    public static Specification<ExchangeRate> searchByCurrencyCode(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toUpperCase() + "%";
            return cb.like(cb.upper(root.get("currencyCode")), pattern);
        };
    }

    public static Specification<ExchangeRate> filterExchangeRates(Boolean isActive, String search) {
        return notDeleted().and(byIsActive(isActive)).and(searchByCurrencyCode(search));
    }
}
