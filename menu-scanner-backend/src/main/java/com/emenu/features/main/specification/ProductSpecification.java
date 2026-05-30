package com.emenu.features.main.specification;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.StockStatus;
import com.emenu.features.main.models.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ProductSpecification {

    public static Specification<Product> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Product> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<Product> byCategoryId(UUID categoryId) {
        return (root, query, cb) -> {
            if (categoryId == null) return cb.conjunction();
            return cb.equal(root.get("categoryId"), categoryId);
        };
    }

    public static Specification<Product> byBrandId(UUID brandId) {
        return (root, query, cb) -> {
            if (brandId == null) return cb.conjunction();
            return cb.equal(root.get("brandId"), brandId);
        };
    }

    public static Specification<Product> byStatuses(List<ProductStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("status").in(statuses);
        };
    }

    public static Specification<Product> byStockStatuses(List<StockStatus> statuses) {
        return (root, query, cb) -> {
            if (statuses == null || statuses.isEmpty()) return cb.conjunction();
            return root.get("stockStatus").in(statuses);
        };
    }

    public static Specification<Product> hasSizes(Boolean hasSizes) {
        return (root, query, cb) -> {
            if (hasSizes == null) return cb.conjunction();
            return cb.equal(root.get("hasSizes"), hasSizes);
        };
    }

    public static Specification<Product> priceRange(BigDecimal minPrice, BigDecimal maxPrice) {
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

    public static Specification<Product> searchByNameOrDescription(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern),
                    cb.like(cb.lower(root.get("categoryName")), pattern),
                    cb.like(cb.lower(root.get("brandName")), pattern)
            );
        };
    }

    public static Specification<Product> byUserId(UUID userId) {
        return (root, query, cb) -> {
            if (userId == null) return cb.conjunction();
            return cb.equal(root.join("favorites").get("userId"), userId);
        };
    }

    public static Specification<Product> filterProducts(UUID businessId, UUID categoryId, UUID brandId,
                                                        List<ProductStatus> statuses, List<StockStatus> stockStatuses,
                                                        Boolean hasSizes, BigDecimal minPrice, BigDecimal maxPrice,
                                                        String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(byCategoryId(categoryId))
                .and(byBrandId(brandId))
                .and(byStatuses(statuses))
                .and(byStockStatuses(stockStatuses))
                .and(hasSizes(hasSizes))
                .and(priceRange(minPrice, maxPrice))
                .and(searchByNameOrDescription(search));
    }
}
