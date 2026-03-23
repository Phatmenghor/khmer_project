package com.emenu.features.stock.repository;

import com.emenu.features.stock.models.StockAlert;
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
public interface StockAlertRepository extends JpaRepository<StockAlert, UUID> {

    // ========== Basic Queries ==========
    List<StockAlert> findByBusinessId(UUID businessId);

    List<StockAlert> findByProductStockId(UUID productStockId);

    // ========== Status Queries ==========
    @Query("""
        SELECT sa FROM StockAlert sa
        WHERE sa.businessId = :businessId
            AND sa.status = 'ACTIVE'
        ORDER BY sa.createdAt DESC
    """)
    List<StockAlert> findActiveAlerts(
        @Param("businessId") UUID businessId
    );

    @Query("""
        SELECT sa FROM StockAlert sa
        WHERE sa.businessId = :businessId
            AND sa.status = 'ACTIVE'
            AND (sa.alertType = :alertType)
        ORDER BY sa.createdAt DESC
    """)
    List<StockAlert> findActiveAlertsByType(
        @Param("businessId") UUID businessId,
        @Param("alertType") String alertType
    );

    @Query("""
        SELECT COUNT(sa)
        FROM StockAlert sa
        WHERE sa.businessId = :businessId
            AND sa.status = 'ACTIVE'
    """)
    Long countActiveAlerts(
        @Param("businessId") UUID businessId
    );

    // ========== Alert Type Queries ==========
    @Query("""
        SELECT sa FROM StockAlert sa
        WHERE sa.businessId = :businessId
            AND sa.alertType IN ('EXPIRED', 'OUT_OF_STOCK', 'NEGATIVE_STOCK')
            AND sa.status = 'ACTIVE'
        ORDER BY sa.createdAt DESC
    """)
    List<StockAlert> findCriticalAlerts(
        @Param("businessId") UUID businessId
    );

    @Query("""
        SELECT sa FROM StockAlert sa
        WHERE sa.businessId = :businessId
            AND sa.alertType IN ('LOW_STOCK', 'EXPIRING_SOON')
            AND sa.status = 'ACTIVE'
        ORDER BY sa.createdAt DESC
    """)
    List<StockAlert> findWarningAlerts(
        @Param("businessId") UUID businessId
    );

    // ========== Pagination Queries ==========
    Page<StockAlert> findByBusinessIdOrderByCreatedAtDesc(
        UUID businessId,
        Pageable pageable
    );

    @Query("""
        SELECT sa FROM StockAlert sa
        WHERE sa.businessId = :businessId
            AND sa.alertType = :alertType
        ORDER BY sa.createdAt DESC
    """)
    Page<StockAlert> findByBusinessIdAndAlertTypeOrderByCreatedAtDesc(
        @Param("businessId") UUID businessId,
        @Param("alertType") String alertType,
        Pageable pageable
    );

    // ========== Filter Query ==========
    @Query("""
        SELECT sa FROM StockAlert sa
        WHERE sa.businessId = :businessId
            AND (:productId IS NULL OR sa.productId = :productId)
            AND (:alertType IS NULL OR sa.alertType = :alertType)
            AND (:status IS NULL OR sa.status = :status)
        ORDER BY sa.createdAt DESC
    """)
    Page<StockAlert> findWithFilters(
        @Param("businessId") UUID businessId,
        @Param("productId") UUID productId,
        @Param("alertType") String alertType,
        @Param("status") String status,
        Pageable pageable
    );

    // ========== Notification Queries ==========
    @Query("""
        SELECT sa FROM StockAlert sa
        WHERE sa.businessId = :businessId
            AND sa.notificationSent = false
            AND sa.status = 'ACTIVE'
        ORDER BY sa.createdAt ASC
    """)
    List<StockAlert> findUnsentAlerts(
        @Param("businessId") UUID businessId
    );

    @Query("""
        UPDATE StockAlert sa
        SET sa.notificationSent = true
        WHERE sa.id IN :alertIds
    """)
    void markAsNotificationSent(@Param("alertIds") List<UUID> alertIds);

    // ========== Date Range Queries ==========
    @Query("""
        SELECT sa FROM StockAlert sa
        WHERE sa.businessId = :businessId
            AND sa.createdAt BETWEEN :from AND :to
        ORDER BY sa.createdAt DESC
    """)
    List<StockAlert> findByBusinessIdAndDateRange(
        @Param("businessId") UUID businessId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    // ========== Duplicate Alert Check ==========
    // Find if there's already an active alert for this product and alert type
    List<StockAlert> findByProductStockIdAndAlertTypeAndStatusOrderByCreatedAtDesc(
        UUID productStockId,
        String alertType,
        String status
    );
}
