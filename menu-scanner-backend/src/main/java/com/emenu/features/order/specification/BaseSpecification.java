package com.emenu.features.order.specification;

import org.springframework.data.jpa.domain.Specification;

/**
 * Base Specification class providing common filtering methods.
 * All feature-specific Specifications should extend this for consistency.
 */
public class BaseSpecification {

    /**
     * Filter by deleted flag - all entities should have isDeleted field
     */
    protected static <T> Specification<T> isNotDeleted(String fieldName) {
        return (root, query, cb) -> cb.equal(root.get(fieldName), false);
    }

    /**
     * Filter by null or specific value
     */
    protected static <T, V> Specification<T> filterByField(String fieldName, V value) {
        return (root, query, cb) -> {
            if (value == null) {
                return cb.conjunction();
            }
            return cb.equal(root.get(fieldName), value);
        };
    }

    /**
     * Filter by null or range of values
     */
    protected static <T, V> Specification<T> filterByFieldIn(String fieldName, java.util.List<V> values) {
        return (root, query, cb) -> {
            if (values == null || values.isEmpty()) {
                return cb.conjunction();
            }
            return root.get(fieldName).in(values);
        };
    }

    /**
     * Search by string field with LIKE and case-insensitive matching
     */
    protected static <T> Specification<T> searchByField(String fieldName, String searchValue) {
        return (root, query, cb) -> {
            if (searchValue == null || searchValue.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get(fieldName)), "%" + searchValue.toLowerCase() + "%");
        };
    }

    /**
     * Filter by date range - greater than or equal
     */
    protected static <T> Specification<T> dateFrom(String fieldName, java.time.LocalDateTime startDate) {
        return (root, query, cb) -> {
            if (startDate == null) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(root.get(fieldName), startDate);
        };
    }

    /**
     * Filter by date range - less than or equal
     */
    protected static <T> Specification<T> dateTo(String fieldName, java.time.LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (endDate == null) {
                return cb.conjunction();
            }
            return cb.lessThanOrEqualTo(root.get(fieldName), endDate);
        };
    }
}
