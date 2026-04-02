package com.emenu.features.stock.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.emenu.features.stock.dto.response.ProductStockItemDto;
import com.emenu.features.stock.entity.ProductStockItem;
import java.util.UUID;

@Repository
public interface ProductStockItemRepository extends JpaRepository<ProductStockItem, UUID> {

    /**
     * Find all stock items with complete product details for Sales Preview
     * Includes pricing, promotions, category, brand, and inventory information
     */
    @Query("""
        SELECT new com.emenu.features.stock.dto.response.ProductStockItemDto(
            psi.id,
            p.id,
            p.name,
            p.description,
            p.sku,
            p.barcode,
            c.id,
            c.name,
            b.id,
            b.name,
            p.price,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN
                    CASE
                        WHEN pp.type = 'PERCENTAGE' THEN CAST(CAST(p.price AS DOUBLE) * (1 - pp.value / 100) AS java.math.BigDecimal)
                        ELSE CAST(CAST(p.price AS DOUBLE) - pp.value AS java.math.BigDecimal)
                    END
                ELSE CAST(p.price AS java.math.BigDecimal)
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.type
                ELSE null
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.value
                ELSE null
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.fromDate
                ELSE null
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.toDate
                ELSE null
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN true
                ELSE false
            END,
            COALESCE(SUM(psi.quantityOnHand), 0),
            COALESCE(SUM(psi.quantityOnHand - psi.quantityReserved), 0),
            COALESCE(SUM(psi.quantityReserved), 0),
            psi.quantityOnHand,
            p.mainImageUrl,
            psi.createdAt,
            psi.updatedAt
        )
        FROM ProductStockItem psi
        JOIN Product p ON psi.productId = p.id
        LEFT JOIN Category c ON p.categoryId = c.id
        LEFT JOIN Brand b ON p.brandId = b.id
        LEFT JOIN ProductPromotion pp ON p.id = pp.productId
            AND pp.status = 'ACTIVE'
            AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate
        WHERE p.businessId = :businessId
        GROUP BY psi.id, p.id, c.id, b.id, pp.id
        ORDER BY psi.createdAt DESC
    """)
    Page<ProductStockItemDto> findAllStockItems(
        @Param("businessId") UUID businessId,
        Pageable pageable
    );

    /**
     * Find all stock items without pagination for reports/exports
     */
    @Query("""
        SELECT new com.emenu.features.stock.dto.response.ProductStockItemDto(
            psi.id,
            p.id,
            p.name,
            p.description,
            p.sku,
            p.barcode,
            c.id,
            c.name,
            b.id,
            b.name,
            p.price,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN
                    CASE
                        WHEN pp.type = 'PERCENTAGE' THEN CAST(CAST(p.price AS DOUBLE) * (1 - pp.value / 100) AS java.math.BigDecimal)
                        ELSE CAST(CAST(p.price AS DOUBLE) - pp.value AS java.math.BigDecimal)
                    END
                ELSE CAST(p.price AS java.math.BigDecimal)
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.type
                ELSE null
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.value
                ELSE null
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.fromDate
                ELSE null
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.toDate
                ELSE null
            END,
            CASE
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN true
                ELSE false
            END,
            COALESCE(SUM(psi.quantityOnHand), 0),
            COALESCE(SUM(psi.quantityOnHand - psi.quantityReserved), 0),
            COALESCE(SUM(psi.quantityReserved), 0),
            psi.quantityOnHand,
            p.mainImageUrl,
            psi.createdAt,
            psi.updatedAt
        )
        FROM ProductStockItem psi
        JOIN Product p ON psi.productId = p.id
        LEFT JOIN Category c ON p.categoryId = c.id
        LEFT JOIN Brand b ON p.brandId = b.id
        LEFT JOIN ProductPromotion pp ON p.id = pp.productId
            AND pp.status = 'ACTIVE'
            AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate
        WHERE p.businessId = :businessId
        GROUP BY psi.id, p.id, c.id, b.id, pp.id
        ORDER BY psi.createdAt DESC
    """)
    java.util.List<ProductStockItemDto> findAllStockItemsWithoutPagination(
        @Param("businessId") UUID businessId
    );
}
