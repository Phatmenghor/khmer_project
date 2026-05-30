package com.emenu.shared.specification;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Base Specification class providing common filtering methods.
 * All feature-specific Specifications should extend this for consistency.
 * Provides reusable methods for common filtering patterns across all entities.
 */
public class BaseSpecification {

    /**
     * Filter by deleted flag - all entities should have isDeleted field
     */
    public static <T> Specification<T> isNotDeleted(String fieldName) {
        return (root, query, cb) -> cb.equal(root.get(fieldName), false);
    }

    /**
     * Default isDeleted filter using standard "isDeleted" field name
     */
    public static <T> Specification<T> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    /**
     * Filter by null or specific value
     */
    public static <T, V> Specification<T> filterByField(String fieldName, V value) {
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
    public static <T, V> Specification<T> filterByFieldIn(String fieldName, List<V> values) {
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
    public static <T> Specification<T> searchByField(String fieldName, String searchValue) {
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
    public static <T> Specification<T> dateFrom(String fieldName, LocalDateTime startDate) {
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
    public static <T> Specification<T> dateTo(String fieldName, LocalDateTime endDate) {
        return (root, query, cb) -> {
            if (endDate == null) {
                return cb.conjunction();
            }
            return cb.lessThanOrEqualTo(root.get(fieldName), endDate);
        };
    }
}
