package com.emenu.features.order.repository;

import com.emenu.enums.common.Status;
import com.emenu.features.order.models.PaymentOption;
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
public interface PaymentOptionRepository extends JpaRepository<PaymentOption, UUID> {

    /**
     * Find all payment options by business ID
     */
    List<PaymentOption> findByBusinessIdAndIsDeletedFalse(UUID businessId);

    /**
     * Find all active payment options by business ID
     */
    @Query("""
        SELECT p FROM PaymentOption p
        WHERE p.businessId = :businessId
        AND p.status = 'ACTIVE'
        AND p.isDeleted = false
        ORDER BY p.createdAt DESC
    """)
    List<PaymentOption> findActiveByBusinessId(@Param("businessId") UUID businessId);

    /**
     * Find a specific payment option by ID and business ID
     */
    Optional<PaymentOption> findByIdAndBusinessIdAndIsDeletedFalse(UUID id, UUID businessId);

    /**
     * Find payment option by name and business ID
     */
    @Query("""
        SELECT p FROM PaymentOption p
        WHERE p.businessId = :businessId
        AND LOWER(p.name) = LOWER(:name)
        AND p.isDeleted = false
    """)
    Optional<PaymentOption> findByNameAndBusinessId(
            @Param("businessId") UUID businessId,
            @Param("name") String name
    );

    /**
     * Search payment options with pagination
     */
    @Query("""
        SELECT p FROM PaymentOption p
        WHERE p.businessId = :businessId
        AND p.isDeleted = false
        AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:status IS NULL OR p.status = :status)
        ORDER BY p.createdAt DESC
    """)
    Page<PaymentOption> searchByBusinessId(
            @Param("businessId") UUID businessId,
            @Param("search") String search,
            @Param("status") Status status,
            Pageable pageable
    );

    /**
     * Get all payment options for a business with pagination and filters
     */
    @Query("""
        SELECT p FROM PaymentOption p
        WHERE p.businessId = :businessId
        AND p.isDeleted = false
        AND (:search IS NULL OR :search = '' OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (COALESCE(:statuses, NULL) IS NULL OR p.status IN :statuses)
        ORDER BY p.createdAt DESC
    """)
    Page<PaymentOption> findAllByBusinessIdWithFilters(
            @Param("businessId") UUID businessId,
            @Param("search") String search,
            @Param("statuses") List<Status> statuses,
            Pageable pageable
    );

    /**
     * Get all active payment options (public - no pagination)
     */
    @Query("""
        SELECT p FROM PaymentOption p
        WHERE p.status = 'ACTIVE'
        AND p.isDeleted = false
        ORDER BY p.name ASC
    """)
    List<PaymentOption> findAllActive();
}
