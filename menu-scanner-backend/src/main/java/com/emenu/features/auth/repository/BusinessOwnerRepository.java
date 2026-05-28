package com.emenu.features.auth.repository;

import com.emenu.enums.sub_scription.SubscriptionStatus;
import com.emenu.features.auth.models.User;
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
public interface BusinessOwnerRepository extends JpaRepository<User, UUID> {
    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN FETCH u.business b
        LEFT JOIN FETCH b.subscriptions s
        WHERE u.id = :ownerId
        AND u.userType = 'BUSINESS_USER'
        AND u.isDeleted = false
    """)
    Optional<User> findBusinessOwnerById(@Param("ownerId") UUID ownerId);

    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN u.profile p
        LEFT JOIN u.business b
        LEFT JOIN b.subscriptions s
        WHERE u.userType = 'BUSINESS_USER'
        AND u.isDeleted = false
        AND b.isDeleted = false
        AND (
            :subscriptionStatuses IS NULL
            OR (:hasActive = true AND s.endDate > :now AND s.cancellationReason IS NULL)
            OR (:hasExpired = true AND s.endDate <= :now AND s.cancellationReason IS NULL)
            OR (:hasExpiringSoon = true AND s.endDate > :now AND s.endDate <= :expiryThreshold AND s.cancellationReason IS NULL)
            OR (:hasCancelled = true AND s.cancellationReason IS NOT NULL)
        )
        AND (:autoRenew IS NULL OR s.autoRenew = :autoRenew)
        AND (:search IS NULL OR :search = '' OR
             LOWER(u.userIdentifier) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
             LOWER(b.email) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY u.createdAt DESC
    """)
    Page<User> findAllBusinessOwnersWithFilters(
            @Param("subscriptionStatuses") List<SubscriptionStatus> subscriptionStatuses,
            @Param("hasActive") boolean hasActive,
            @Param("hasExpired") boolean hasExpired,
            @Param("hasExpiringSoon") boolean hasExpiringSoon,
            @Param("hasCancelled") boolean hasCancelled,
            @Param("now") LocalDateTime now,
            @Param("expiryThreshold") LocalDateTime expiryThreshold,
            @Param("autoRenew") Boolean autoRenew,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("""
        SELECT COUNT(u) > 0 FROM User u
        JOIN u.profile p
        WHERE p.email = :email
        AND u.userType = 'BUSINESS_USER'
        AND u.isDeleted = false
    """)
    boolean existsBusinessOwnerByEmail(@Param("email") String email);

    @Query("""
        SELECT COUNT(u) > 0 FROM User u
        WHERE u.userIdentifier = :userIdentifier
        AND u.userType = 'BUSINESS_USER'
        AND u.isDeleted = false
    """)
    boolean existsByUserIdentifierAndIsDeletedFalse(@Param("userIdentifier") String userIdentifier);
}
