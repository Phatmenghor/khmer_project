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
     * Finds a non-deleted order by ID with items, products, sizes, business, and customer eagerly fetched
     * NOTE: statusHistory is loaded lazily to avoid MultipleBagFetchException with multiple collections
     */
    @Query("SELECT o FROM Order o " +
           "LEFT JOIN FETCH o.items oi " +
           "LEFT JOIN FETCH oi.product p " +
           "LEFT JOIN FETCH oi.productSize ps " +
           "LEFT JOIN FETCH o.business " +
           "LEFT JOIN FETCH o.customer " +
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
     * Finds paginated non-deleted orders by customer ID, ordered by creation date descending
     */
    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId AND o.isDeleted = false ORDER BY o.createdAt DESC")
    Page<Order> findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(@Param("customerId") UUID customerId, Pageable pageable);

    /**
     * Find all non-deleted orders with optional filters for business, order status, payment method, and payment status
     */
    @Query("SELECT o FROM Order o WHERE o.isDeleted = false " +
           "AND (:businessId IS NULL OR o.businessId = :businessId) " +
           "AND (:orderStatus IS NULL OR o.orderStatus = :orderStatus) " +
           "AND (:paymentMethod IS NULL OR o.paymentMethod = :paymentMethod) " +
           "AND (:paymentStatus IS NULL OR o.paymentStatus = :paymentStatus)")
    Page<Order> findAllWithFilters(
            @Param("businessId") UUID businessId,
            @Param("orderStatus") OrderStatus orderStatus,
            @Param("paymentMethod") com.emenu.enums.payment.PaymentMethod paymentMethod,
            @Param("paymentStatus") com.emenu.enums.payment.PaymentStatus paymentStatus,
            Pageable pageable);
}
