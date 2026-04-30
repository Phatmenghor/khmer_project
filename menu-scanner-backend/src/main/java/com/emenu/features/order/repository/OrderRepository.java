package com.emenu.features.order.repository;

import com.emenu.enums.order.OrderStatus;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderStatusHistory;
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
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Finds a non-deleted order by ID with items, products, sizes, business, customer, and delivery snapshots eagerly fetched
     * NOTE: statusHistory is loaded lazily to avoid MultipleBagFetchException with multiple collections
     */
    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.items oi " +
           "LEFT JOIN FETCH oi.product p " +
           "LEFT JOIN FETCH oi.productSize ps " +
           "LEFT JOIN FETCH o.business " +
           "LEFT JOIN FETCH o.customer " +
           "LEFT JOIN FETCH o.deliveryAddress " +
           "LEFT JOIN FETCH o.deliveryOption " +
           "WHERE o.id = :id AND o.isDeleted = false")
    Optional<Order> findByIdWithDetails(@Param("id") UUID id);

    /**
     * Finds status history for an order with changed by user eagerly fetched
     */
    @Query("SELECT h FROM OrderStatusHistory h " +
           "LEFT JOIN FETCH h.changedByUser " +
           "WHERE h.orderId = :orderId " +
           "ORDER BY h.createdAt ASC")
    List<OrderStatusHistory> findStatusHistoryByOrderId(@Param("orderId") UUID orderId);

    /**
     * Finds all non-deleted orders by customer ID, ordered by creation date descending
     */
    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId AND o.isDeleted = false ORDER BY o.createdAt DESC")
    List<Order> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") UUID customerId);

    /**
     * Finds all non-deleted orders by business ID, ordered by creation date descending
     */
    @Query("SELECT o FROM Order o WHERE o.businessId = :businessId AND o.isDeleted = false ORDER BY o.createdAt DESC")
    List<Order> findByBusinessIdOrderByCreatedAtDesc(@Param("businessId") UUID businessId);

    /**
     * Finds non-deleted orders by business ID and order status, ordered by creation date descending
     */
    @Query("SELECT o FROM Order o WHERE o.businessId = :businessId AND o.orderStatus = :orderStatus AND o.isDeleted = false ORDER BY o.createdAt DESC")
    List<Order> findByBusinessIdAndOrderStatusOrderByCreatedAtDesc(@Param("businessId") UUID businessId, @Param("orderStatus") OrderStatus orderStatus);

    /**
     * Checks if an order exists with the given order number
     */
    boolean existsByOrderNumber(String orderNumber);

    /**
     * Counts non-deleted orders by business ID and order status
     */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.businessId = :businessId AND o.orderStatus = :orderStatus AND o.isDeleted = false")
    long countByBusinessIdAndOrderStatus(@Param("businessId") UUID businessId, @Param("orderStatus") OrderStatus orderStatus);

    /**
     * Finds paginated non-deleted orders by customer ID with eager loading of related entities
     * Uses JOIN FETCH to prevent N+1 query problem
     * NOTE: statusHistory is loaded separately to avoid MultipleBagFetchException
     */
    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.business b " +
           "LEFT JOIN FETCH o.customer c " +
           "LEFT JOIN FETCH o.deliveryAddress " +
           "LEFT JOIN FETCH o.deliveryOption " +
           "WHERE o.customerId = :customerId AND o.isDeleted = false " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(@Param("customerId") UUID customerId, Pageable pageable);

    /**
     * Find all non-deleted orders with optional filters and eager loading of related entities
     * Supports filtering by:
     * - businessId (required for business users, optional for admin)
     * - orderStatus
     * - paymentMethod
     * - paymentStatus
     * - date range (startDate to endDate)
     *
     * Uses JOIN FETCH to prevent N+1 query problem
     * NOTE: statusHistory is loaded separately to avoid MultipleBagFetchException
     */
    @Query(value = "SELECT DISTINCT o.* FROM orders o " +
           "LEFT JOIN businesses b ON b.id = o.business_id " +
           "LEFT JOIN users c ON c.id = o.customer_id " +
           "LEFT JOIN order_delivery_addresses da ON o.id = da.order_id " +
           "LEFT JOIN order_delivery_options dopt ON o.id = dopt.order_id " +
           "WHERE o.is_deleted = false " +
           "AND (CAST(:businessId AS uuid) IS NULL OR o.business_id = CAST(:businessId AS uuid)) " +
           "AND (:orderStatus IS NULL OR o.order_status = :orderStatus) " +
           "AND (:paymentMethod IS NULL OR o.payment_method = :paymentMethod) " +
           "AND (:paymentStatus IS NULL OR o.payment_status = :paymentStatus) " +
           "AND (CAST(:startDate AS timestamp) IS NULL OR o.created_at >= CAST(:startDate AS timestamp)) " +
           "AND (CAST(:endDate AS timestamp) IS NULL OR o.created_at <= CAST(:endDate AS timestamp)) " +
           "ORDER BY o.created_at DESC",
           nativeQuery = true,
           countQuery = "SELECT COUNT(DISTINCT o.id) FROM orders o " +
                   "WHERE o.is_deleted = false " +
                   "AND (CAST(:businessId AS uuid) IS NULL OR o.business_id = CAST(:businessId AS uuid)) " +
                   "AND (:orderStatus IS NULL OR o.order_status = :orderStatus) " +
                   "AND (:paymentMethod IS NULL OR o.payment_method = :paymentMethod) " +
                   "AND (:paymentStatus IS NULL OR o.payment_status = :paymentStatus) " +
                   "AND (CAST(:startDate AS timestamp) IS NULL OR o.created_at >= CAST(:startDate AS timestamp)) " +
                   "AND (CAST(:endDate AS timestamp) IS NULL OR o.created_at <= CAST(:endDate AS timestamp))")
    Page<Order> findAllWithFilters(
            @Param("businessId") String businessId,
            @Param("orderStatus") String orderStatus,
            @Param("paymentMethod") String paymentMethod,
            @Param("paymentStatus") String paymentStatus,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate,
            Pageable pageable);
}
