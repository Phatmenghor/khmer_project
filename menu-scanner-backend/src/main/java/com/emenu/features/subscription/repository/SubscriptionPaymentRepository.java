package com.emenu.features.subscription.repository;

import com.emenu.enums.sub_scription.SubscriptionPaymentStatus;
import com.emenu.features.subscription.models.SubscriptionPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPaymentRepository extends JpaRepository<SubscriptionPayment, UUID>, JpaSpecificationExecutor<SubscriptionPayment> {

    @Query("SELECT sp FROM SubscriptionPayment sp WHERE sp.subscriptionId = :subscriptionId AND sp.isDeleted = false")
    Optional<SubscriptionPayment> findBySubscriptionIdAndIsDeletedFalse(@Param("subscriptionId") UUID subscriptionId);

    @Query("""
                SELECT sp FROM SubscriptionPayment sp
                WHERE sp.subscriptionId = :subscriptionId
                AND sp.status = :status
                AND sp.isDeleted = false
            """)
    Optional<SubscriptionPayment> findBySubscriptionIdAndStatusAndIsDeletedFalse(
            @Param("subscriptionId") UUID subscriptionId,
            @Param("status") SubscriptionPaymentStatus status
    );
}
