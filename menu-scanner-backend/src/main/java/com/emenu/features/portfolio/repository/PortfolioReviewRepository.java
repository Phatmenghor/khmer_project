package com.emenu.features.portfolio.repository;

import com.emenu.features.portfolio.models.PortfolioReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PortfolioReviewRepository extends JpaRepository<PortfolioReview, UUID> {

    @Query("SELECT r.rating, COUNT(r) FROM PortfolioReview r " +
           "WHERE r.profileId = :profileId AND r.isDeleted = false GROUP BY r.rating")
    List<Object[]> countByRatingForProfile(@Param("profileId") UUID profileId);

    @Query("SELECT r FROM PortfolioReview r WHERE r.profileId = :profileId AND r.isDeleted = false " +
           "AND (:search IS NULL OR LOWER(CAST(r.customerName AS String)) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(CAST(r.comment AS String)) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PortfolioReview> findWithFilters(@Param("profileId") UUID profileId,
                                          @Param("search") String search,
                                          Pageable pageable);

    @Query("SELECT r FROM PortfolioReview r WHERE r.businessId = :businessId AND r.isDeleted = false " +
           "AND (:search IS NULL OR LOWER(CAST(r.customerName AS String)) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(CAST(r.comment AS String)) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PortfolioReview> findWithFiltersByBusiness(@Param("businessId") UUID businessId,
                                                     @Param("search") String search,
                                                     Pageable pageable);
}
