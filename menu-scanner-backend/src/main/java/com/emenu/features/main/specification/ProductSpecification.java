package com.emenu.features.main.specification;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.StockStatus;
import com.emenu.features.main.models.Product;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
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

    public static Specification<Product> byHasPromotion(Boolean hasPromotion) {
        return (root, query, cb) -> {
            if (hasPromotion == null) return cb.conjunction();
            return cb.equal(root.get("hasActivePromotion"), hasPromotion);
        };
    }

    public static Specification<Product> byHasSize(Boolean hasSize) {
        return (root, query, cb) -> {
            if (hasSize == null) return cb.conjunction();
            return cb.equal(root.get("hasSizes"), hasSize);
        };
    }

    public static Specification<Product> byStockStatus(List<StockStatus> stockStatuses) {
        return (root, query, cb) -> {
            if (stockStatuses == null || stockStatuses.isEmpty()) return cb.conjunction();
            return root.get("stockStatus").in(stockStatuses);
        };
    }

    public static Specification<Product> byPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, cb) -> {
            if (minPrice == null && maxPrice == null) return cb.conjunction();
            if (minPrice != null && maxPrice != null) {
                return cb.between(root.get("displayPrice"), minPrice, maxPrice);
            } else if (minPrice != null) {
                return cb.greaterThanOrEqualTo(root.get("displayPrice"), minPrice);
            } else {
                return cb.lessThanOrEqualTo(root.get("displayPrice"), maxPrice);
            }
        };
    }

    public static Specification<Product> searchByName(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.like(cb.lower(root.get("name")), pattern);
        };
    }

    public static Specification<Product> filterProducts(
            UUID businessId,
            UUID categoryId,
            UUID brandId,
            List<ProductStatus> statuses,
            Boolean hasPromotion,
            Boolean hasSize,
            List<StockStatus> stockStatuses,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String search) {
        return active()
                .and(byBusinessId(businessId))
                .and(byCategoryId(categoryId))
                .and(byBrandId(brandId))
                .and(byStatuses(statuses))
                .and(byHasPromotion(hasPromotion))
                .and(byHasSize(hasSize))
                .and(byStockStatus(stockStatuses))
                .and(byPriceRange(minPrice, maxPrice))
                .and(searchByName(search));
    }
}
