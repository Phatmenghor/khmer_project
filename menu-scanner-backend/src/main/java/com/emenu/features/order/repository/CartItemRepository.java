package com.emenu.features.order.repository;

import com.emenu.features.order.dto.CartQuantityProjection;
import com.emenu.features.order.dto.SizeCartQuantityProjection;
import com.emenu.features.order.models.CartItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, UUID> {

    Optional<CartItem> findByIdAndIsDeletedFalse(UUID id);

    @Query("SELECT ci FROM CartItem ci WHERE ci.cartId = :cartId AND ci.productId = :productId AND ((:productSizeId IS NULL AND ci.productSizeId IS NULL) OR (:productSizeId IS NOT NULL AND ci.productSizeId = :productSizeId)) AND ci.isDeleted = false ORDER BY ci.createdAt DESC LIMIT 1")
    Optional<CartItem> findByCartIdAndProductIdAndSizeId(@Param("cartId") UUID cartId,
                                                          @Param("productId") UUID productId,
                                                          @Param("productSizeId") UUID productSizeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ci FROM CartItem ci WHERE ci.cartId = :cartId AND ci.productId = :productId AND ((:productSizeId IS NULL AND ci.productSizeId IS NULL) OR (:productSizeId IS NOT NULL AND ci.productSizeId = :productSizeId)) AND ci.isDeleted = false ORDER BY ci.createdAt DESC LIMIT 1")
    Optional<CartItem> findByCartIdAndProductIdAndSizeIdForUpdate(@Param("cartId") UUID cartId,
                                                                    @Param("productId") UUID productId,
                                                                    @Param("productSizeId") UUID productSizeId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.productId IN (SELECT p.id FROM Product p WHERE p.isDeleted = true)")
    int deleteCartItemsForDeletedProducts();

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.productId IN (SELECT p.id FROM Product p WHERE p.status != 'ACTIVE')")
    int deleteCartItemsForInactiveProducts();

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.productSizeId IN (SELECT ps.id FROM ProductSize ps WHERE ps.isDeleted = true)")
    int deleteCartItemsForDeletedProductSizes();

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.createdAt < :cutoffDate")
    int deleteOldCartItems(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.isDeleted = false")
    long countActiveCartItems();

    @Query("SELECT COUNT(ci) FROM CartItem ci WHERE ci.createdAt < :cutoffDate")
    long countOldCartItems(@Param("cutoffDate") LocalDateTime cutoffDate);

    @Query("""
            SELECT ci.productId as productId, SUM(ci.quantity) as totalQuantity
            FROM CartItem ci
            JOIN Cart c ON ci.cartId = c.id
            WHERE c.userId = :userId
            AND c.businessId = :businessId
            AND ci.productId IN :productIds
            AND ci.isDeleted = false
            AND c.isDeleted = false
            GROUP BY ci.productId
            """)
    List<CartQuantityProjection> getProductQuantitiesInCart(@Param("userId") UUID userId,
                                                             @Param("businessId") UUID businessId,
                                                             @Param("productIds") List<UUID> productIds);

    @Query("""
            SELECT ci.productId as productId, SUM(ci.quantity) as totalQuantity
            FROM CartItem ci
            JOIN Cart c ON ci.cartId = c.id
            WHERE c.userId = :userId
            AND ci.productId IN :productIds
            AND ci.isDeleted = false
            AND c.isDeleted = false
            GROUP BY ci.productId
            """)
    List<CartQuantityProjection> getProductQuantitiesInCartAllBusinesses(@Param("userId") UUID userId,
                                                                          @Param("productIds") List<UUID> productIds);

    @Query("""
            SELECT ci.productSizeId as productSizeId, ci.quantity as quantity
            FROM CartItem ci
            JOIN Cart c ON ci.cartId = c.id
            WHERE c.userId = :userId
            AND ci.productId = :productId
            AND ci.productSizeId IS NOT NULL
            AND ci.isDeleted = false
            AND c.isDeleted = false
            """)
    List<SizeCartQuantityProjection> getSizeQuantitiesInCart(@Param("userId") UUID userId,
                                                              @Param("productId") UUID productId);
}

