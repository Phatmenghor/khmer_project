package com.emenu.features.location.repository;

import com.emenu.features.location.models.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID>, JpaSpecificationExecutor<Location> {

    List<Location> findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(UUID userId);

    Optional<Location> findByUserIdAndIsDefaultTrueAndIsDeletedFalse(UUID userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("UPDATE Location ca SET ca.isDefault = false WHERE ca.userId = :userId AND ca.isDeleted = false")
    void clearDefaultForUser(@Param("userId") UUID userId);

    Optional<Location> findByIdAndIsDeletedFalse(UUID id);

    @Query("SELECT ca FROM Location ca " +
           "WHERE ca.isDeleted = false " +
           "AND (:userId IS NULL OR ca.userId = :userId) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(ca.province) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(ca.district) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(ca.commune) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(ca.village) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(ca.streetNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(ca.note) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY ca.isDefault DESC, ca.createdAt DESC")
    Page<Location> findAllWithFilters(
        @Param("userId") UUID userId,
        @Param("search") String search,
        Pageable pageable
    );
}