package com.emenu.features.stock.repository;

import com.emenu.features.stock.models.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, UUID> {

    // ========== Basic Queries ==========
    List<StockMovement> findByBusinessId(UUID businessId);

    List<StockMovement> findByProductStockId(UUID productStockId);

    // ========== Paginated Queries ==========
    Page<StockMovement> findByBusinessIdOrderByCreatedAtDesc(UUID businessId, Pageable pageable);

    Page<StockMovement> findByProductStockIdOrderByCreatedAtDesc(UUID productStockId, Pageable pageable);

    // ========== Movement Type Queries ==========
    @Query("""
        SELECT sm FROM StockMovement sm
        WHERE sm.businessId = :businessId
            AND sm.movementType = :movementType
        ORDER BY sm.createdAt DESC
    """)
    List<StockMovement> findByBusinessIdAndMovementType(
        @Param("businessId") UUID businessId,
        @Param("movementType") String movementType
    );

    @Query("""
        SELECT sm FROM StockMovement sm
        WHERE sm.productStockId = :productStockId
            AND sm.movementType = :movementType
        ORDER BY sm.createdAt DESC
    """)
    List<StockMovement> findByProductStockIdAndMovementType(
        @Param("productStockId") UUID productStockId,
        @Param("movementType") String movementType
    );

    // ========== Date Range Queries ==========
    @Query("""
        SELECT sm FROM StockMovement sm
        WHERE sm.businessId = :businessId
            AND sm.createdAt BETWEEN :from AND :to
        ORDER BY sm.createdAt DESC
    """)
    Page<StockMovement> findByBusinessIdAndDateRange(
        @Param("businessId") UUID businessId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        Pageable pageable
    );

    @Query("""
        SELECT sm FROM StockMovement sm
        WHERE sm.productStockId = :productStockId
            AND sm.createdAt BETWEEN :from AND :to
        ORDER BY sm.createdAt DESC
    """)
    List<StockMovement> findByProductStockIdAndDateRange(
        @Param("productStockId") UUID productStockId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    // ========== Order-Related Queries ==========
    @Query("""
        SELECT sm FROM StockMovement sm
        WHERE sm.orderId = :orderId
        ORDER BY sm.createdAt DESC
    """)
    List<StockMovement> findByOrderId(
        @Param("orderId") UUID orderId
    );

    @Query("""
        SELECT COUNT(sm) FROM StockMovement sm
        WHERE sm.orderId = :orderId
            AND sm.movementType = 'STOCK_OUT'
    """)
    Long countStockOutByOrderId(
        @Param("orderId") UUID orderId
    );

    // ========== Financial Queries ==========
    @Query("""
        SELECT SUM(sm.costImpact)
        FROM StockMovement sm
        WHERE sm.businessId = :businessId
            AND sm.movementType = 'STOCK_OUT'
            AND sm.createdAt BETWEEN :from AND :to
    """)
    java.math.BigDecimal sumCostOfGoodsSold(
        @Param("businessId") UUID businessId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    // ========== Summary Statistics ==========
    @Query("""
        SELECT COUNT(DISTINCT sm.productStockId)
        FROM StockMovement sm
        WHERE sm.businessId = :businessId
            AND sm.createdAt >= :since
    """)
    Long countUniqueProductsMovedSince(
        @Param("businessId") UUID businessId,
        @Param("since") LocalDateTime since
    );

    @Query("""
        SELECT sm.movementType, COUNT(sm)
        FROM StockMovement sm
        WHERE sm.businessId = :businessId
            AND sm.createdAt BETWEEN :from AND :to
        GROUP BY sm.movementType
    """)
    List<Object[]> countByMovementTypeBetweenDates(
        @Param("businessId") UUID businessId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );
}
