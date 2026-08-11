package com.emenu.features.main.specification;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.StockStatus;
import com.emenu.features.main.models.Product;
import com.emenu.shared.specification.BaseSpecification;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.emenu.features.main.models.ProductSize;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class ProductSpecification extends BaseSpecification {

    public static Specification<Product> active() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<Product> byBusinessId(UUID businessId) {
        return filterByField("businessId", businessId);
    }

    public static Specification<Product> byCategoryId(UUID categoryId) {
        return filterByField("categoryId", categoryId);
    }

    public static Specification<Product> byBrandId(UUID brandId) {
        return filterByField("brandId", brandId);
    }

    public static Specification<Product> byStatuses(List<ProductStatus> statuses) {
        return filterByFieldIn("status", statuses);
    }

    public static Specification<Product> byHasPromotion(Boolean hasPromotion) {
        return (root, query, cb) -> {
            if (hasPromotion == null) {
                return cb.conjunction();
            }

            if (query != null) {
                query.distinct(true);
            }

            LocalDateTime now = LocalDateTime.now();

            // Product-level active promotion
            Predicate productPromoNotNull = cb.and(
                    cb.isNotNull(root.get("promotionType")),
                    cb.isNotNull(root.get("promotionValue"))
            );
            Predicate productFromValid = cb.or(
                    cb.isNull(root.get("promotionFromDate")),
                    cb.lessThanOrEqualTo(root.get("promotionFromDate"), now)
            );
            Predicate productToValid = cb.or(
                    cb.isNull(root.get("promotionToDate")),
                    cb.greaterThanOrEqualTo(root.get("promotionToDate"), now)
            );
            Predicate productActivePromo = cb.and(productPromoNotNull, productFromValid, productToValid);

            // Size-level active promotion
            Join<Product, ProductSize> sizesJoin = root.join("sizes", JoinType.LEFT);
            Predicate sizeNotDeleted = cb.or(
                    cb.isNull(sizesJoin.get("isDeleted")),
                    cb.equal(sizesJoin.get("isDeleted"), false)
            );
            Predicate sizePromoNotNull = cb.and(
                    cb.isNotNull(sizesJoin.get("promotionType")),
                    cb.isNotNull(sizesJoin.get("promotionValue"))
            );
            Predicate sizeFromValid = cb.or(
                    cb.isNull(sizesJoin.get("promotionFromDate")),
                    cb.lessThanOrEqualTo(sizesJoin.get("promotionFromDate"), now)
            );
            Predicate sizeToValid = cb.or(
                    cb.isNull(sizesJoin.get("promotionToDate")),
                    cb.greaterThanOrEqualTo(sizesJoin.get("promotionToDate"), now)
            );
            Predicate sizeActivePromo = cb.and(sizeNotDeleted, sizePromoNotNull, sizeFromValid, sizeToValid);

            Predicate hasActivePromotion = cb.or(productActivePromo, sizeActivePromo);

            return hasPromotion ? hasActivePromotion : cb.not(hasActivePromotion);
        };
    }

    public static Specification<Product> byHasSize(Boolean hasSize) {
        return (root, query, cb) -> {
            if (hasSize == null) return cb.conjunction();
            if (query != null) query.distinct(true);

            Join<Product, ProductSize> sizesJoin = root.join("sizes", JoinType.LEFT);
            Predicate sizeNotDeleted = cb.or(
                    cb.isNull(sizesJoin.get("isDeleted")),
                    cb.equal(sizesJoin.get("isDeleted"), false)
            );
            Predicate hasSizeRecord = cb.and(cb.isNotNull(sizesJoin.get("id")), sizeNotDeleted);

            Predicate productHasSizes = cb.or(
                    cb.equal(root.get("hasSizes"), true),
                    hasSizeRecord
            );

            return hasSize ? productHasSizes : cb.not(productHasSizes);
        };
    }

    public static Specification<Product> byStockStatus(List<StockStatus> stockStatuses) {
        return filterByFieldIn("stockStatus", stockStatuses);
    }

    public static Specification<Product> byPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
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

    public static Specification<Product> searchByName(String search) {
        return searchByField("name", search);
    }

    public static Specification<Product> byPromotionFromDate(LocalDateTime fromDate) {
        return (root, query, cb) -> {
            if (fromDate == null) return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("promotionFromDate"), fromDate);
        };
    }

    public static Specification<Product> byPromotionToDate(LocalDateTime toDate) {
        return (root, query, cb) -> {
            if (toDate == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("promotionToDate"), toDate);
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
            String search,
            LocalDateTime promotionFromDate,
            LocalDateTime promotionToDate) {
        return active()
                .and(byBusinessId(businessId))
                .and(byCategoryId(categoryId))
                .and(byBrandId(brandId))
                .and(byStatuses(statuses))
                .and(byHasPromotion(hasPromotion))
                .and(byHasSize(hasSize))
                .and(byStockStatus(stockStatuses))
                .and(byPriceRange(minPrice, maxPrice))
                .and(searchByName(search))
                .and(byPromotionFromDate(promotionFromDate))
                .and(byPromotionToDate(promotionToDate));
    }
}
