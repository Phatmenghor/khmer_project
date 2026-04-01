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

    /**
     * Get total quantity on hand per product for a list of product IDs (for product listing enrichment).
     * Returns Object[] where [0] = productId (UUID), [1] = totalStock (Long).
     */
    @Query("""
        SELECT ps.productId, COALESCE(SUM(ps.quantityOnHand), 0)
        FROM ProductStock ps
        WHERE ps.productId IN :productIds
            AND ps.isExpired = false
            AND ps.status = 'ACTIVE'
        GROUP BY ps.productId
    """)
    List<Object[]> sumOnHandQuantityByProductIds(@Param("productIds") List<UUID> productIds);

    /**
     * Get total quantity on hand for a specific product size ID (for size-level stock enrichment).
     */
    @Query("""
        SELECT COALESCE(SUM(ps.quantityOnHand), 0)
        FROM ProductStock ps
        WHERE ps.productSizeId = :productSizeId
            AND ps.isExpired = false
            AND ps.status = 'ACTIVE'
    """)
    Integer sumOnHandQuantityByProductSizeId(@Param("productSizeId") UUID productSizeId);

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
        SELECT ps.* FROM product_stock ps
        LEFT JOIN products p ON ps.product_id = p.id
        WHERE ps.business_id = :businessId
            AND (CAST(:productId AS uuid) IS NULL OR ps.product_id = :productId)
            AND (CAST(:productSizeId AS uuid) IS NULL OR ps.product_size_id = :productSizeId)
            AND (CAST(:status AS text) IS NULL OR p.status = :status)
            AND (CAST(:stockStatus AS text) IS NULL OR p.stock_status = :stockStatus)
            AND (CAST(:lowStockThreshold AS integer) IS NULL OR ps.quantity_on_hand < :lowStockThreshold)
            AND (CAST(:expiredBefore AS timestamp) IS NULL OR (ps.expiry_date IS NOT NULL AND ps.expiry_date <= :expiredBefore))
            AND (CAST(:search AS text) IS NULL OR p.name ILIKE '%' || CAST(:search AS text) || '%')
    """,
    countQuery = """
        SELECT COUNT(*) FROM product_stock ps
        LEFT JOIN products p ON ps.product_id = p.id
        WHERE ps.business_id = :businessId
            AND (CAST(:productId AS uuid) IS NULL OR ps.product_id = :productId)
            AND (CAST(:productSizeId AS uuid) IS NULL OR ps.product_size_id = :productSizeId)
            AND (CAST(:status AS text) IS NULL OR p.status = :status)
            AND (CAST(:stockStatus AS text) IS NULL OR p.stock_status = :stockStatus)
            AND (CAST(:lowStockThreshold AS integer) IS NULL OR ps.quantity_on_hand < :lowStockThreshold)
            AND (CAST(:expiredBefore AS timestamp) IS NULL OR (ps.expiry_date IS NOT NULL AND ps.expiry_date <= :expiredBefore))
            AND (CAST(:search AS text) IS NULL OR p.name ILIKE '%' || CAST(:search AS text) || '%')
    """,
    nativeQuery = true)
    /**
     * Find product stocks with filtering and sorting.
     * Pagination and sorting are handled by Spring Data Pageable (no hardcoded ORDER BY).
     * Supports sorting by: date_in, created_at, updated_at, quantity_on_hand, etc.
     */
    Page<ProductStock> findWithFilters(
        @Param("businessId") UUID businessId,
        @Param("productId") UUID productId,
        @Param("productSizeId") UUID productSizeId,
        @Param("status") String status,
        @Param("stockStatus") String stockStatus,
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

    // ========== Product Stock Items (Flat List) Query ==========
    /**
     * Get flattened product stock items for listing (products and sizes as separate items).
     * Returns a flat list where:
     * - Products without sizes: 1 item per product (type=PRODUCT, sizeName=null)
     * - Products with sizes: 1 item per size (type=SIZE, sizeName=size name)
     * Each item contains aggregated stock data (summed from all batches of that product/size).
     */
    @Query(value = """
        SELECT * FROM (
            (
                -- Products without sizes
                SELECT
                    p.id as product_id,
                    NULL::uuid as product_size_id,
                    p.name as product_name,
                    p.category_name,
                    p.brand_name,
                    p.sku,
                    p.barcode,
                    NULL::varchar as size_name,
                    COALESCE(SUM(ps.quantity_on_hand), 0)::bigint as total_stock,
                    p.status,
                    p.stock_status,
                    'PRODUCT'::varchar as item_type,
                    COALESCE(MAX(ps.created_at), p.created_at) as created_at,
                    COALESCE(MAX(ps.updated_at), p.updated_at) as updated_at
                FROM products p
                LEFT JOIN product_stock ps ON p.id = ps.product_id
                    AND ps.is_expired = false
                    AND ps.status = 'ACTIVE'
                WHERE p.business_id = :businessId
                    AND p.is_deleted = false
                    AND p.has_sizes = false
                    AND (CAST(:hasSizes AS boolean) IS NULL OR CAST(:hasSizes AS boolean) = false)
                    AND (CAST(:search AS text) IS NULL OR p.name ILIKE '%' || CAST(:search AS text) || '%')
                    AND (CAST(:status AS text) IS NULL OR p.status = :status)
                    AND (CAST(:stockStatus AS text) IS NULL OR p.stock_status = :stockStatus)
                GROUP BY p.id, p.name, p.category_name, p.brand_name, p.sku, p.barcode, p.status, p.stock_status, p.created_at, p.updated_at
                HAVING (CAST(:lowStockThreshold AS integer) IS NULL OR COALESCE(SUM(ps.quantity_on_hand), 0) < :lowStockThreshold)
            )
            UNION ALL
            (
                -- Products with sizes
                SELECT
                    p.id as product_id,
                    psz.id as product_size_id,
                    p.name as product_name,
                    p.category_name,
                    p.brand_name,
                    p.sku,
                    p.barcode,
                    psz.name as size_name,
                    COALESCE(SUM(ps.quantity_on_hand), 0)::bigint as total_stock,
                    p.status,
                    p.stock_status,
                    'SIZE'::varchar as item_type,
                    COALESCE(MAX(ps.created_at), psz.created_at) as created_at,
                    COALESCE(MAX(ps.updated_at), psz.updated_at) as updated_at
                FROM products p
                INNER JOIN product_sizes psz ON p.id = psz.product_id AND psz.is_deleted = false
                LEFT JOIN product_stock ps ON p.id = ps.product_id
                    AND psz.id = ps.product_size_id
                    AND ps.is_expired = false
                    AND ps.status = 'ACTIVE'
                WHERE p.business_id = :businessId
                    AND p.is_deleted = false
                    AND p.has_sizes = true
                    AND (CAST(:hasSizes AS boolean) IS NULL OR CAST(:hasSizes AS boolean) = true)
                    AND (CAST(:search AS text) IS NULL OR p.name ILIKE '%' || CAST(:search AS text) || '%')
                    AND (CAST(:status AS text) IS NULL OR p.status = :status)
                    AND (CAST(:stockStatus AS text) IS NULL OR p.stock_status = :stockStatus)
                GROUP BY p.id, psz.id, p.name, p.category_name, p.brand_name, p.sku, p.barcode, psz.name, p.status, p.stock_status, psz.created_at, psz.updated_at
                HAVING (CAST(:lowStockThreshold AS integer) IS NULL OR COALESCE(SUM(ps.quantity_on_hand), 0) < :lowStockThreshold)
            )
        ) AS result
    """,
    countQuery = """
        SELECT COUNT(*) FROM (
            (
                -- Products without sizes
                SELECT p.id
                FROM products p
                LEFT JOIN product_stock ps ON p.id = ps.product_id
                    AND ps.is_expired = false
                    AND ps.status = 'ACTIVE'
                WHERE p.business_id = :businessId
                    AND p.is_deleted = false
                    AND p.has_sizes = false
                    AND (CAST(:hasSizes AS boolean) IS NULL OR CAST(:hasSizes AS boolean) = false)
                    AND (CAST(:search AS text) IS NULL OR p.name ILIKE '%' || CAST(:search AS text) || '%')
                    AND (CAST(:status AS text) IS NULL OR p.status = :status)
                    AND (CAST(:stockStatus AS text) IS NULL OR p.stock_status = :stockStatus)
                GROUP BY p.id, p.name, p.category_name, p.brand_name, p.sku, p.barcode, p.status, p.stock_status, p.created_at, p.updated_at
                HAVING (CAST(:lowStockThreshold AS integer) IS NULL OR COALESCE(SUM(ps.quantity_on_hand), 0) < :lowStockThreshold)
            )
            UNION ALL
            (
                -- Products with sizes
                SELECT p.id
                FROM products p
                INNER JOIN product_sizes psz ON p.id = psz.product_id AND psz.is_deleted = false
                LEFT JOIN product_stock ps ON p.id = ps.product_id
                    AND psz.id = ps.product_size_id
                    AND ps.is_expired = false
                    AND ps.status = 'ACTIVE'
                WHERE p.business_id = :businessId
                    AND p.is_deleted = false
                    AND p.has_sizes = true
                    AND (CAST(:hasSizes AS boolean) IS NULL OR CAST(:hasSizes AS boolean) = true)
                    AND (CAST(:search AS text) IS NULL OR p.name ILIKE '%' || CAST(:search AS text) || '%')
                    AND (CAST(:status AS text) IS NULL OR p.status = :status)
                    AND (CAST(:stockStatus AS text) IS NULL OR p.stock_status = :stockStatus)
                GROUP BY p.id, psz.id, p.name, p.category_name, p.brand_name, p.sku, p.barcode, psz.name, p.status, p.stock_status, psz.created_at, psz.updated_at
                HAVING (CAST(:lowStockThreshold AS integer) IS NULL OR COALESCE(SUM(ps.quantity_on_hand), 0) < :lowStockThreshold)
            )
        ) AS count_result
    """,
    nativeQuery = true)
    /**
     * Find product stock items with filtering and sorting.
     * Wrapped in subquery to allow Spring Data Pageable to properly apply ORDER BY and pagination.
     * Supports sorting by: product_name, total_stock, status, stock_status, sku, barcode, created_at, updated_at
     */
    Page<Object[]> findProductStockItems(
        @Param("businessId") UUID businessId,
        @Param("search") String search,
        @Param("status") String status,
        @Param("stockStatus") String stockStatus,
        @Param("lowStockThreshold") Integer lowStockThreshold,
        @Param("hasSizes") Boolean hasSizes,
        Pageable pageable
    );
}
