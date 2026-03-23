package com.emenu.features.stock.repository;

import com.emenu.features.stock.models.ProductStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductStockRepository extends JpaRepository<ProductStock, UUID> {

    // ========== Basic Queries ==========
    Optional<ProductStock> findByProductIdAndProductSizeIdAndBusinessId(
        UUID productId,
        UUID productSizeId,
        UUID businessId
    );

    List<ProductStock> findByBusinessId(UUID businessId);

    List<ProductStock> findByProductId(UUID productId);

    List<ProductStock> findByBusinessIdAndProductId(UUID businessId, UUID productId);

    // ========== Batch Queries (for FIFO) ==========

    /**
     * Get all active, non-expired batches for a product+size ordered by dateIn ASC (oldest first).
     * Used for FIFO stock deduction when an order is placed.
     */
    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.productId = :productId
            AND ps.businessId = :businessId
            AND (:sizeId IS NULL OR ps.productSizeId = :sizeId)
            AND ps.isExpired = false
            AND ps.quantityOnHand > 0
            AND ps.status = 'ACTIVE'
        ORDER BY ps.dateIn ASC
    """)
    List<ProductStock> findActiveBatchesFIFO(
        @Param("productId") UUID productId,
        @Param("sizeId") UUID sizeId,
        @Param("businessId") UUID businessId
    );

    /**
     * Get total available quantity across all non-expired batches for a product+size.
     */
    @Query("""
        SELECT COALESCE(SUM(ps.quantityAvailable), 0)
        FROM ProductStock ps
        WHERE ps.productId = :productId
            AND ps.businessId = :businessId
            AND (:sizeId IS NULL OR ps.productSizeId = :sizeId)
            AND ps.isExpired = false
            AND ps.status = 'ACTIVE'
    """)
    Integer sumAvailableQuantity(
        @Param("productId") UUID productId,
        @Param("sizeId") UUID sizeId,
        @Param("businessId") UUID businessId
    );

    /**
     * Get total quantity on hand across all non-expired batches for a product+size.
     */
    @Query("""
        SELECT COALESCE(SUM(ps.quantityOnHand), 0)
        FROM ProductStock ps
        WHERE ps.productId = :productId
            AND ps.businessId = :businessId
            AND (:sizeId IS NULL OR ps.productSizeId = :sizeId)
            AND ps.isExpired = false
            AND ps.status = 'ACTIVE'
    """)
    Integer sumOnHandQuantity(
        @Param("productId") UUID productId,
        @Param("sizeId") UUID sizeId,
        @Param("businessId") UUID businessId
    );

    // ========== Stock Status Queries ==========
    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.quantityOnHand = 0
            AND ps.status = 'ACTIVE'
        ORDER BY ps.updatedAt DESC
    """)
    List<ProductStock> findOutOfStockProducts(
        @Param("businessId") UUID businessId
    );

    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.quantityOnHand < 0
        ORDER BY ps.quantityOnHand ASC
    """)
    List<ProductStock> findOverSoldProducts(
        @Param("businessId") UUID businessId
    );

    // ========== Expiry Queries ==========
    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.expiryDate IS NOT NULL
            AND ps.expiryDate < CURRENT_TIMESTAMP
            AND ps.isExpired = true
        ORDER BY ps.expiryDate ASC
    """)
    List<ProductStock> findExpiredProducts(
        @Param("businessId") UUID businessId
    );

    List<ProductStock> findByBusinessIdAndExpiryDateBetweenAndIsExpiredFalseAndQuantityOnHandGreaterThan(
        UUID businessId,
        LocalDateTime startDate,
        LocalDateTime endDate,
        Integer quantity
    );

    // ========== Pagination Queries ==========
    Page<ProductStock> findByBusinessId(UUID businessId, Pageable pageable);

    @Query(value = """
        SELECT * FROM product_stock ps
        WHERE ps.business_id = :businessId
            AND (CAST(:productId AS uuid) IS NULL OR ps.product_id = :productId)
            AND (CAST(:productSizeId AS uuid) IS NULL OR ps.product_size_id = :productSizeId)
            AND (CAST(:status AS text) IS NULL OR ps.status = :status)
            AND (CAST(:lowStockThreshold AS integer) IS NULL OR ps.quantity_on_hand < :lowStockThreshold)
            AND (CAST(:expiredBefore AS timestamp) IS NULL OR (ps.expiry_date IS NOT NULL AND ps.expiry_date <= :expiredBefore))
            AND (CAST(:search AS text) IS NULL OR CAST(ps.location AS text) ILIKE '%' || CAST(:search AS text) || '%')
        ORDER BY ps.date_in DESC NULLS LAST, ps.created_at DESC
    """,
    countQuery = """
        SELECT COUNT(*) FROM product_stock ps
        WHERE ps.business_id = :businessId
            AND (CAST(:productId AS uuid) IS NULL OR ps.product_id = :productId)
            AND (CAST(:productSizeId AS uuid) IS NULL OR ps.product_size_id = :productSizeId)
            AND (CAST(:status AS text) IS NULL OR ps.status = :status)
            AND (CAST(:lowStockThreshold AS integer) IS NULL OR ps.quantity_on_hand < :lowStockThreshold)
            AND (CAST(:expiredBefore AS timestamp) IS NULL OR (ps.expiry_date IS NOT NULL AND ps.expiry_date <= :expiredBefore))
            AND (CAST(:search AS text) IS NULL OR CAST(ps.location AS text) ILIKE '%' || CAST(:search AS text) || '%')
    """,
    nativeQuery = true)
    Page<ProductStock> findWithFilters(
        @Param("businessId") UUID businessId,
        @Param("productId") UUID productId,
        @Param("productSizeId") UUID productSizeId,
        @Param("status") String status,
        @Param("lowStockThreshold") Integer lowStockThreshold,
        @Param("expiredBefore") LocalDateTime expiredBefore,
        @Param("search") String search,
        Pageable pageable
    );

    // ========== Financial Queries ==========
    @Query("""
        SELECT SUM(ps.quantityOnHand * ps.priceIn)
        FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.status = 'ACTIVE'
            AND ps.isExpired = false
    """)
    Optional<java.math.BigDecimal> getTotalInventoryValue(
        @Param("businessId") UUID businessId
    );

    // ========== Count Queries ==========
    Long countByBusinessIdAndQuantityOnHandLessThanEqualAndIsExpiredFalse(
        UUID businessId,
        Integer threshold
    );

    Long countByBusinessIdAndQuantityOnHandAndIsExpiredFalse(
        UUID businessId,
        Integer quantity
    );

    Long countByBusinessIdAndIsExpiredTrue(UUID businessId);
}
