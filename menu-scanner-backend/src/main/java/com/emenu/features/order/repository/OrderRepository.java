package com.emenu.features.order.repository;

import com.emenu.enums.order.OrderStatus;
import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.models.Order;
import com.emenu.features.order.models.OrderStatusHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

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

    @Query("SELECT h FROM OrderStatusHistory h " +
           "LEFT JOIN FETCH h.changedByUser " +
           "WHERE h.orderId = :orderId " +
           "ORDER BY h.createdAt ASC")
    List<OrderStatusHistory> findStatusHistoryByOrderId(@Param("orderId") UUID orderId);

    @Query("SELECT o FROM Order o WHERE o.customerId = :customerId AND o.isDeleted = false ORDER BY o.createdAt DESC")
    List<Order> findByCustomerIdOrderByCreatedAtDesc(@Param("customerId") UUID customerId);

    @Query("SELECT o FROM Order o WHERE o.businessId = :businessId AND o.isDeleted = false ORDER BY o.createdAt DESC")
    List<Order> findByBusinessIdOrderByCreatedAtDesc(@Param("businessId") UUID businessId);

    @Query("SELECT o FROM Order o WHERE o.businessId = :businessId AND o.orderStatus = :orderStatus AND o.isDeleted = false ORDER BY o.createdAt DESC")
    List<Order> findByBusinessIdAndOrderStatusOrderByCreatedAtDesc(@Param("businessId") UUID businessId, @Param("orderStatus") OrderStatus orderStatus);

    boolean existsByOrderNumber(String orderNumber);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.businessId = :businessId AND o.orderStatus = :orderStatus AND o.isDeleted = false")
    long countByBusinessIdAndOrderStatus(@Param("businessId") UUID businessId, @Param("orderStatus") OrderStatus orderStatus);

    @Query("SELECT DISTINCT o FROM Order o " +
           "LEFT JOIN FETCH o.business b " +
           "LEFT JOIN FETCH o.customer c " +
           "LEFT JOIN FETCH o.deliveryAddress " +
           "LEFT JOIN FETCH o.deliveryOption " +
           "WHERE o.customerId = :customerId AND o.isDeleted = false " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findByCustomerIdAndIsDeletedFalseOrderByCreatedAtDesc(@Param("customerId") UUID customerId, Pageable pageable);

    @Query(value = "SELECT * FROM orders o " +
           "WHERE o.is_deleted = false " +
           "AND (:businessId IS NULL OR o.business_id = CAST(:businessId AS uuid)) " +
           "AND (:orderStatus IS NULL OR o.order_status = :orderStatus) " +
           "AND (:paymentStatus IS NULL OR o.payment_status = :paymentStatus) " +
           "AND (:startDate IS NULL OR o.created_at >= :startDate) " +
           "AND (:endDate IS NULL OR o.created_at <= :endDate) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(o.order_number) LIKE LOWER(CONCAT('%', :search, '%')))",
           countQuery = "SELECT COUNT(*) FROM orders o " +
           "WHERE o.is_deleted = false " +
           "AND (:businessId IS NULL OR o.business_id = CAST(:businessId AS uuid)) " +
           "AND (:orderStatus IS NULL OR o.order_status = :orderStatus) " +
           "AND (:paymentStatus IS NULL OR o.payment_status = :paymentStatus) " +
           "AND (:startDate IS NULL OR o.created_at >= :startDate) " +
           "AND (:endDate IS NULL OR o.created_at <= :endDate) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(o.order_number) LIKE LOWER(CONCAT('%', :search, '%')))",
           nativeQuery = true)
    Page<Order> findByFiltersAndOrderNumber(
            @Param("businessId") UUID businessId,
            @Param("orderStatus") String orderStatus,
            @Param("paymentStatus") String paymentStatus,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("search") String search,
            Pageable pageable);

}

