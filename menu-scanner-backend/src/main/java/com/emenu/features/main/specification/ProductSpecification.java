package com.emenu.features.main.specification;

import com.emenu.enums.product.ProductStatus;
import com.emenu.enums.product.StockStatus;
import com.emenu.features.main.models.Product;
import com.emenu.shared.specification.BaseSpecification;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

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
        return filterByField("hasActivePromotion", hasPromotion);
    }

    public static Specification<Product> byHasSize(Boolean hasSize) {
        return filterByField("hasSizes", hasSize);
    }

    public static Specification<Product> byStockStatus(List<StockStatus> stockStatuses) {
        return filterByFieldIn("stockStatus", stockStatuses);
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
        return searchByField("name", search);
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
