package com.emenu.features.order.repository;

import com.emenu.features.order.models.BusinessExchangeRate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BusinessExchangeRateRepository extends JpaRepository<BusinessExchangeRate, UUID> {

    /**
     * Finds a non-deleted business exchange rate by ID
     */
    Optional<BusinessExchangeRate> findByIdAndIsDeletedFalse(UUID id);

    /**
     * Finds the active exchange rate for a business
     */
    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.status = 'ACTIVE' AND ber.isDeleted = false")
    Optional<BusinessExchangeRate> findActiveRateByBusinessId(@Param("businessId") UUID businessId);

    /**
     * Finds all non-deleted exchange rates for a business, ordered by creation date descending
     */
    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.isDeleted = false ORDER BY ber.createdAt DESC")
    List<BusinessExchangeRate> findAllByBusinessId(@Param("businessId") UUID businessId);

    /**
     * Checks if a business has any non-deleted exchange rate
     */
    @Query("SELECT COUNT(ber) > 0 FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.isDeleted = false")
    boolean existsByBusinessId(@Param("businessId") UUID businessId);

    /**
     * Checks if a business has an active exchange rate
     */
    @Query("SELECT COUNT(ber) > 0 FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.status = 'ACTIVE' AND ber.isDeleted = false")
    boolean hasActiveRate(@Param("businessId") UUID businessId);

    /**
     * Deactivates all active exchange rates for a business
     */
    @Modifying
    @Query("UPDATE BusinessExchangeRate ber SET ber.status = 'INACTIVE' WHERE ber.businessId = :businessId AND ber.status = 'ACTIVE' AND ber.isDeleted = false")
    int deactivateAllRatesForBusiness(@Param("businessId") UUID businessId);

    /**
     * Counts active exchange rates for a business
     */
    @Query("SELECT COUNT(ber) FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.status = 'ACTIVE' AND ber.isDeleted = false")
    long countActiveRates(@Param("businessId") UUID businessId);

    /**
     * Finds all active exchange rates across all businesses, ordered by creation date descending
     */
    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.status = 'ACTIVE' AND ber.isDeleted = false ORDER BY ber.createdAt DESC")
    List<BusinessExchangeRate> findAllActiveRates();

    /**
     * Finds the most recently created inactive exchange rate for a business
     */
    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.status = 'INACTIVE' AND ber.isDeleted = false ORDER BY ber.createdAt DESC LIMIT 1")
    Optional<BusinessExchangeRate> findMostRecentInactiveRateByBusinessId(@Param("businessId") UUID businessId);

    /**
     * Find all business exchange rates with dynamic filtering
     */
    @Query("SELECT ber FROM BusinessExchangeRate ber " +
           "LEFT JOIN ber.business b " +
           "WHERE ber.isDeleted = false " +
           "AND (:businessId IS NULL OR ber.businessId = :businessId) " +
           "AND (:status IS NULL OR ber.status = :status) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     CAST(ber.usdToKhrRate AS string) LIKE CONCAT('%', :search, '%') OR " +
           "     LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<BusinessExchangeRate> findAllWithFilters(
        @Param("businessId") UUID businessId,
        @Param("status") BusinessExchangeRate.ExchangeRateStatus status,
        @Param("search") String search,
        Pageable pageable
    );
}