package com.emenu.shared.utils;

import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public class SpecificationUtils {

    /**
     * Reusable JPA Specification helper to eagerly join fetch related associations in a single query.
     * Automatically skips fetching during count queries (used for pagination calculations).
     */
    public static <T> Specification<T> fetch(String... associations) {
        return (root, query, cb) -> {
            Class<?> resultType = query.getResultType();
            // Eager fetch only when performing a select query, skip for count queries
            if (resultType != Long.class && resultType != long.class) {
                for (String association : associations) {
                    root.fetch(association, JoinType.LEFT);
                }
            }
            return cb.conjunction();
        };
    }
}
