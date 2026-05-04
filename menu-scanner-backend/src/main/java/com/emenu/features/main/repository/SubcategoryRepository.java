package com.emenu.features.main.repository;

import com.emenu.enums.common.Status;
import com.emenu.features.main.models.Subcategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, UUID> {

    /**
     * Finds a non-deleted subcategory by ID
     */
    Optional<Subcategory> findByIdAndIsDeletedFalse(UUID id);

    /**
     * Finds a non-deleted subcategory by ID with business and category details eagerly fetched
     */
    @Query("SELECT s FROM Subcategory s " +
           "LEFT JOIN FETCH s.business " +
           "LEFT JOIN FETCH s.category " +
           "WHERE s.id = :id AND s.isDeleted = false")
    Optional<Subcategory> findByIdWithBusiness(@Param("id") UUID id);

    /**
     * Checks if a non-deleted subcategory exists with the given name, category ID, and business ID
     */
    boolean existsByNameAndCategoryIdAndBusinessIdAndIsDeletedFalse(
            String name,
            UUID categoryId,
            UUID businessId
    );

    /**
     * Find all subcategories with dynamic filtering - paginated
     */
    @Query("SELECT DISTINCT s FROM Subcategory s " +
           "LEFT JOIN s.business b " +
           "LEFT JOIN s.category c " +
           "WHERE s.isDeleted = false " +
           "AND (:businessId IS NULL OR s.businessId = :businessId) " +
           "AND (:categoryId IS NULL OR s.categoryId = :categoryId) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Subcategory> findAllWithFilters(
            @Param("businessId") UUID businessId,
            @Param("categoryId") UUID categoryId,
            @Param("status") Status status,
            @Param("search") String search,
            Pageable pageable
    );

    /**
     * Find all subcategories with dynamic filtering - non-paginated
     */
    @Query("SELECT DISTINCT s FROM Subcategory s " +
           "LEFT JOIN s.business b " +
           "LEFT JOIN s.category c " +
           "WHERE s.isDeleted = false " +
           "AND (:businessId IS NULL OR s.businessId = :businessId) " +
           "AND (:categoryId IS NULL OR s.categoryId = :categoryId) " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "     LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(b.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "     LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Subcategory> findAllWithFilters(
            @Param("businessId") UUID businessId,
            @Param("categoryId") UUID categoryId,
            @Param("status") Status status,
            @Param("search") String search,
            Sort sort
    );
}
