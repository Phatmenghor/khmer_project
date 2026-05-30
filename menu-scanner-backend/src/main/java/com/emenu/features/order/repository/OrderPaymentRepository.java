package com.emenu.features.order.repository;

import com.emenu.enums.payment.PaymentMethod;
import com.emenu.enums.payment.PaymentStatus;
import com.emenu.features.order.models.OrderPayment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderPaymentRepository extends JpaRepository<OrderPayment, UUID>, JpaSpecificationExecutor<OrderPayment> {

    Optional<OrderPayment> findByIdAndIsDeletedFalse(UUID id);

    Optional<OrderPayment> findByOrderIdAndIsDeletedFalse(UUID orderId);

    @Query("SELECT bop FROM OrderPayment bop " +
           "LEFT JOIN FETCH bop.business " +
           "LEFT JOIN FETCH bop.order o " +
           "LEFT JOIN FETCH o.customer " +
           "WHERE bop.id = :id AND bop.isDeleted = false")
    Optional<OrderPayment> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT bop FROM OrderPayment bop WHERE bop.businessId = :businessId AND bop.isDeleted = false ORDER BY bop.createdAt DESC")
    List<OrderPayment> findByBusinessIdOrderByCreatedAtDesc(@Param("businessId") UUID businessId);

    boolean existsByPaymentReferenceAndIsDeletedFalse(String paymentReference);

    @Query("SELECT SUM(bop.totalAmount) FROM OrderPayment bop WHERE bop.businessId = :businessId AND bop.status = 'COMPLETED' AND bop.isDeleted = false")
    BigDecimal getTotalRevenue(@Param("businessId") UUID businessId);

    @Query("SELECT SUM(bop.totalAmount) FROM OrderPayment bop WHERE bop.businessId = :businessId AND bop.status = 'COMPLETED' AND bop.createdAt >= :fromDate AND bop.createdAt <= :toDate AND bop.isDeleted = false")
    BigDecimal getRevenueByDateRange(@Param("businessId") UUID businessId, @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);
}

