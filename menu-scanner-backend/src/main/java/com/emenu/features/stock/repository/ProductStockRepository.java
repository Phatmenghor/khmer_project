package com.emenu.features.stock.repository;

import com.emenu.features.stock.models.ProductStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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

    Optional<ProductStock> findByBarcode(String barcode);

    Optional<ProductStock> findByBarcodeAndBusinessId(String barcode, UUID businessId);

    List<ProductStock> findByBusinessId(UUID businessId);

    List<ProductStock> findByProductId(UUID productId);

    List<ProductStock> findByBusinessIdAndProductId(UUID businessId, UUID productId);

    // ========== Stock Status Queries ==========
    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.quantityOnHand <= ps.minimumStockLevel
            AND ps.isExpired = false
            AND ps.isActive = true
        ORDER BY ps.quantityOnHand ASC
    """)
    List<ProductStock> findLowStockProducts(
        @Param("businessId") UUID businessId
    );

    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.quantityOnHand = 0
            AND ps.isActive = true
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
            AND ps.expiryDate < CAST(CURRENT_DATE AS DATE)
            AND ps.isExpired = true
        ORDER BY ps.expiryDate ASC
    """)
    List<ProductStock> findExpiredProducts(
        @Param("businessId") UUID businessId
    );

    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.expiryDate IS NOT NULL
            AND ps.expiryDate >= CAST(CURRENT_DATE AS DATE)
            AND ps.expiryDate <= CAST(CURRENT_DATE AS DATE) + :days
            AND ps.isExpired = false
            AND ps.quantityOnHand > 0
        ORDER BY ps.expiryDate ASC
    """)
    List<ProductStock> findExpiringProducts(
        @Param("businessId") UUID businessId,
        @Param("days") Integer days
    );

    // ========== Pagination Queries ==========
    Page<ProductStock> findByBusinessId(UUID businessId, Pageable pageable);

    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(ps.barcode) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(ps.sku) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<ProductStock> searchByBusinessIdAndNameOrBarcodeOrSku(
        @Param("businessId") UUID businessId,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.quantityOnHand <= ps.minimumStockLevel
            AND ps.isExpired = false
            AND ps.isActive = true
    """)
    Page<ProductStock> findLowStockProductsPaginated(
        @Param("businessId") UUID businessId,
        Pageable pageable
    );

    // ========== Financial Queries ==========
    @Query("""
        SELECT SUM(ps.quantityOnHand * ps.priceIn)
        FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.isActive = true
            AND ps.isExpired = false
    """)
    Optional<java.math.BigDecimal> getTotalInventoryValue(
        @Param("businessId") UUID businessId
    );

    @Query("""
        SELECT SUM(ps.quantityOnHand * ps.priceOut)
        FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.isActive = true
            AND ps.isExpired = false
    """)
    Optional<java.math.BigDecimal> getTotalRetailValue(
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

    Long countByBusinessIdAndTrackInventoryTrue(UUID businessId);

    // ========== Tracking Status Queries ==========
    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.trackInventory = true
    """)
    List<ProductStock> findTrackedInventory(
        @Param("businessId") UUID businessId
    );

    @Query("""
        SELECT ps FROM ProductStock ps
        WHERE ps.businessId = :businessId
            AND ps.trackInventory = true
            AND ps.quantityOnHand <= :threshold
            AND ps.isExpired = false
    """)
    List<ProductStock> findAlertableProducts(
        @Param("businessId") UUID businessId,
        @Param("threshold") Integer threshold
    );
}
