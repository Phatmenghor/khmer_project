package com.emenu.features.subscription.repository;

import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.features.subscription.models.SubscriptionPayment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, UUID> {

    Optional<SubscriptionPayment> findByIdAndIsDeletedFalse(UUID id);

    @Query("""
                SELECT sp FROM SubscriptionPayment sp
                LEFT JOIN FETCH sp.business
                LEFT JOIN FETCH sp.plan
                LEFT JOIN FETCH sp.subscription
                WHERE sp.id = :id
            """)
    Optional<SubscriptionPayment> findByIdWithRelationships(@Param("id") UUID id);

    @Query("SELECT sp FROM SubscriptionPayment sp WHERE sp.subscriptionId = :subscriptionId AND sp.isDeleted = false")
    List<SubscriptionPayment> findBySubscriptionIdAndIsDeletedFalse(@Param("subscriptionId") UUID subscriptionId);

    @Query("""
                SELECT sp FROM SubscriptionPayment sp
                WHERE sp.subscriptionId = :subscriptionId
                AND sp.status = :status
                AND sp.isDeleted = false
            """)
    List<SubscriptionPayment> findBySubscriptionIdAndStatusAndIsDeletedFalse(
            @Param("subscriptionId") UUID subscriptionId,
            @Param("status") SubscriptionPaymentStatus status
    );

    @Query("""
                SELECT sp FROM SubscriptionPayment sp
                LEFT JOIN sp.business b
                LEFT JOIN sp.plan pl
                WHERE sp.isDeleted = false
                AND (:businessId IS NULL OR sp.businessId = :businessId)
                AND (:subscriptionId IS NULL OR sp.subscriptionId = :subscriptionId)
                AND (:planId IS NULL OR sp.planId = :planId)
                AND (:paymentMethods IS NULL OR sp.paymentMethod IN :paymentMethods)
                AND (:statuses IS NULL OR sp.status IN :statuses)
                AND (:paymentTypes IS NULL OR sp.paymentType IN :paymentTypes)
                AND (:createdFrom IS NULL OR CAST(sp.createdAt AS date) >= :createdFrom)
                AND (:createdTo IS NULL OR CAST(sp.createdAt AS date) <= :createdTo)
                AND (:search IS NULL OR :search = '' OR
                     LOWER(sp.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
                     LOWER(pl.name) LIKE LOWER(CONCAT('%', :search, '%')))
                ORDER BY sp.createdAt DESC
            """)
    Page<SubscriptionPayment> findAllWithFilters(
            @Param("businessId") UUID businessId,
            @Param("subscriptionId") UUID subscriptionId,
            @Param("planId") UUID planId,
            @Param("paymentMethods") List<com.emenu.enums.payment.PaymentMethod> paymentMethods,
            @Param("statuses") List<SubscriptionPaymentStatus> statuses,
            @Param("paymentTypes") List<com.emenu.enums.sub_scription.SubscriptionPaymentType> paymentTypes,
            @Param("createdFrom") LocalDate createdFrom,
            @Param("createdTo") LocalDate createdTo,
            @Param("search") String search,
            Pageable pageable
    );
}
