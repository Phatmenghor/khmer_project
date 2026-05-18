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

    Optional<BusinessExchangeRate> findByIdAndIsDeletedFalse(UUID id);

    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.status = 'ACTIVE' AND ber.isDeleted = false")
    Optional<BusinessExchangeRate> findActiveRateByBusinessId(@Param("businessId") UUID businessId);

    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.isDeleted = false ORDER BY ber.createdAt DESC")
    List<BusinessExchangeRate> findAllByBusinessId(@Param("businessId") UUID businessId);

    @Query("SELECT COUNT(ber) > 0 FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.isDeleted = false")
    boolean existsByBusinessId(@Param("businessId") UUID businessId);

    @Query("SELECT COUNT(ber) > 0 FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.status = 'ACTIVE' AND ber.isDeleted = false")
    boolean hasActiveRate(@Param("businessId") UUID businessId);

    @Modifying
    @Query("UPDATE BusinessExchangeRate ber SET ber.status = 'INACTIVE' WHERE ber.businessId = :businessId AND ber.status = 'ACTIVE' AND ber.isDeleted = false")
    int deactivateAllRatesForBusiness(@Param("businessId") UUID businessId);

    @Modifying
    @Query("UPDATE BusinessExchangeRate ber SET ber.status = 'INACTIVE' WHERE ber.businessId = :businessId AND ber.id != :excludeId AND ber.status = 'ACTIVE' AND ber.isDeleted = false")
    int deactivateAllRatesForBusinessExcept(@Param("businessId") UUID businessId, @Param("excludeId") UUID excludeId);

    @Query("SELECT COUNT(ber) FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.status = 'ACTIVE' AND ber.isDeleted = false")
    long countActiveRates(@Param("businessId") UUID businessId);

    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.status = 'ACTIVE' AND ber.isDeleted = false ORDER BY ber.createdAt DESC")
    List<BusinessExchangeRate> findAllActiveRates();

    @Query("SELECT ber FROM BusinessExchangeRate ber WHERE ber.businessId = :businessId AND ber.status = 'INACTIVE' AND ber.isDeleted = false ORDER BY ber.createdAt DESC LIMIT 1")
    Optional<BusinessExchangeRate> findMostRecentInactiveRateByBusinessId(@Param("businessId") UUID businessId);

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
