package com.emenu.features.stock.specification;

import com.emenu.enums.product.ProductStatus;
import com.emenu.features.stock.models.ProductStock;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.UUID;

public class ProductStockSpecification {

    public static Specification<ProductStock> notDeleted() {
        return (root, query, cb) -> cb.equal(root.get("isDeleted"), false);
    }

    public static Specification<ProductStock> byBusinessId(UUID businessId) {
        return (root, query, cb) -> {
            if (businessId == null) return cb.conjunction();
            return cb.equal(root.get("businessId"), businessId);
        };
    }

    public static Specification<ProductStock> byProductId(UUID productId) {
        return (root, query, cb) -> {
            if (productId == null) return cb.conjunction();
            return cb.equal(root.get("productId"), productId);
        };
    }

    public static Specification<ProductStock> byProductSizeId(UUID productSizeId) {
        return (root, query, cb) -> {
            if (productSizeId == null) return cb.conjunction();
            return cb.equal(root.get("productSizeId"), productSizeId);
        };
    }

    public static Specification<ProductStock> byStatus(ProductStatus status) {
        return (root, query, cb) -> {
            if (status == null) return cb.conjunction();
            return cb.equal(root.get("status"), status);
        };
    }

    public static Specification<ProductStock> isExpired(Boolean isExpired) {
        return (root, query, cb) -> {
            if (isExpired == null) return cb.conjunction();
            return cb.equal(root.get("isExpired"), isExpired);
        };
    }

    public static Specification<ProductStock> expiredBefore(LocalDate expiredBefore) {
        return (root, query, cb) -> {
            if (expiredBefore == null) return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("expiryDate"), expiredBefore);
        };
    }

    public static Specification<ProductStock> filterProductStocks(
        UUID businessId, UUID productId, UUID productSizeId, ProductStatus status, Boolean isExpired, LocalDate expiredBefore
    ) {
        return notDeleted()
            .and(byBusinessId(businessId))
            .and(byProductId(productId))
            .and(byProductSizeId(productSizeId))
            .and(byStatus(status))
            .and(isExpired(isExpired))
            .and(expiredBefore(expiredBefore));
    }
}
