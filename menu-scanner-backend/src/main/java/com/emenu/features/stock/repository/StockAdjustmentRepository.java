package com.emenu.features.stock.repository;

import com.emenu.features.stock.models.StockAdjustment;
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
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, UUID> {

    // ========== Basic Queries ==========
    List<StockAdjustment> findByBusinessId(UUID businessId);

    List<StockAdjustment> findByProductStockId(UUID productStockId);

    // ========== Status Queries ==========
    @Query("""
        SELECT sa FROM StockAdjustment sa
        WHERE sa.businessId = :businessId
            AND sa.requiresApproval = true
            AND sa.approved = false
        ORDER BY sa.adjustedAt DESC
    """)
    List<StockAdjustment> findPendingApprovals(
        @Param("businessId") UUID businessId
    );

    @Query("""
        SELECT sa FROM StockAdjustment sa
        WHERE sa.businessId = :businessId
            AND sa.adjustmentType = :adjustmentType
        ORDER BY sa.adjustedAt DESC
    """)
    List<StockAdjustment> findByBusinessIdAndType(
        @Param("businessId") UUID businessId,
        @Param("adjustmentType") String adjustmentType
    );

    // ========== Pagination Queries ==========
    Page<StockAdjustment> findByBusinessIdOrderByAdjustedAtDesc(
        UUID businessId,
        Pageable pageable
    );

    Page<StockAdjustment> findByProductStockIdOrderByAdjustedAtDesc(
        UUID productStockId,
        Pageable pageable
    );

    // ========== Date Range Queries ==========
    @Query("""
        SELECT sa FROM StockAdjustment sa
        WHERE sa.businessId = :businessId
            AND sa.adjustedAt BETWEEN :from AND :to
        ORDER BY sa.adjustedAt DESC
    """)
    List<StockAdjustment> findByBusinessIdAndDateRange(
        @Param("businessId") UUID businessId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    // ========== User Queries ==========
    @Query("""
        SELECT sa FROM StockAdjustment sa
        WHERE sa.businessId = :businessId
            AND sa.adjustedBy = :userId
        ORDER BY sa.adjustedAt DESC
    """)
    List<StockAdjustment> findByBusinessIdAndAdjustedBy(
        @Param("businessId") UUID businessId,
        @Param("userId") UUID userId
    );

    @Query("""
        SELECT sa FROM StockAdjustment sa
        WHERE sa.businessId = :businessId
            AND sa.approved = true
            AND sa.approvedBy = :userId
        ORDER BY sa.approvedAt DESC
    """)
    List<StockAdjustment> findApprovedByUser(
        @Param("businessId") UUID businessId,
        @Param("userId") UUID userId
    );

    // ========== Count Queries ==========
    Long countByBusinessIdAndRequiresApprovalTrueAndApprovedFalse(UUID businessId);

    @Query("""
        SELECT COUNT(sa)
        FROM StockAdjustment sa
        WHERE sa.businessId = :businessId
            AND sa.adjustedAt >= :since
    """)
    Long countAdjustmentsSince(
        @Param("businessId") UUID businessId,
        @Param("since") LocalDateTime since
    );
}
