package com.emenu.features.stock.repository;

import com.emenu.features.stock.models.BarcodeMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BarcodeMappingRepository extends JpaRepository<BarcodeMapping, UUID> {

    // ========== Basic Queries ==========
    Optional<BarcodeMapping> findByBarcode(String barcode);

    Optional<BarcodeMapping> findByBarcodeAndBusinessId(String barcode, UUID businessId);

    Optional<BarcodeMapping> findByProductStockId(UUID productStockId);

    // ========== List Queries ==========
    List<BarcodeMapping> findByBusinessId(UUID businessId);

    List<BarcodeMapping> findByBusinessIdAndActive(UUID businessId, Boolean active);

    List<BarcodeMapping> findByProductId(UUID productId);

    List<BarcodeMapping> findByBusinessIdAndProductId(UUID businessId, UUID productId);

    // ========== Search Queries ==========
    @Query("""
        SELECT bm FROM BarcodeMapping bm
        WHERE bm.businessId = :businessId
            AND (LOWER(bm.barcode) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(bm.productName) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    List<BarcodeMapping> searchByBusinessIdAndBarcodeOrProductName(
        @Param("businessId") UUID businessId,
        @Param("search") String search
    );

    @Query("""
        SELECT bm FROM BarcodeMapping bm
        WHERE bm.businessId = :businessId
            AND bm.barcode LIKE CONCAT(:prefix, '%')
            AND bm.active = true
    """)
    List<BarcodeMapping> findByBusinessIdAndBarcodePrefix(
        @Param("businessId") UUID businessId,
        @Param("prefix") String prefix
    );

    // ========== Pagination Queries ==========
    Page<BarcodeMapping> findByBusinessIdOrderByCreatedAtDesc(
        UUID businessId,
        Pageable pageable
    );

    @Query("""
        SELECT bm FROM BarcodeMapping bm
        WHERE bm.businessId = :businessId
            AND bm.active = true
    """)
    Page<BarcodeMapping> findActiveByBusinessId(
        @Param("businessId") UUID businessId,
        Pageable pageable
    );

    // ========== Status Queries ==========
    @Query("""
        SELECT COUNT(bm)
        FROM BarcodeMapping bm
        WHERE bm.businessId = :businessId
            AND bm.active = true
    """)
    Long countActiveBarcodesByBusinessId(
        @Param("businessId") UUID businessId
    );

    @Query("""
        SELECT bm FROM BarcodeMapping bm
        WHERE bm.barcode LIKE CONCAT(:prefix, '%')
            AND bm.active = true
    """)
    List<BarcodeMapping> findActiveBarcodesByPrefix(
        @Param("prefix") String prefix
    );

    // ========== Barcode Format Queries ==========
    List<BarcodeMapping> findByBusinessIdAndBarcodeFormat(
        UUID businessId,
        String barcodeFormat
    );

    // ========== Duplicate Check ==========
    @Query("""
        SELECT COUNT(bm) > 0
        FROM BarcodeMapping bm
        WHERE bm.barcode = :barcode
            AND bm.businessId = :businessId
            AND bm.id != :excludeId
    """)
    Boolean existsByBarcodeAndBusinessIdExcluding(
        @Param("barcode") String barcode,
        @Param("businessId") UUID businessId,
        @Param("excludeId") UUID excludeId
    );
}
