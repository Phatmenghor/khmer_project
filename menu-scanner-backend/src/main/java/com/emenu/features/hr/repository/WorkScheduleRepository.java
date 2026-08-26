package com.emenu.features.hr.repository;

import com.emenu.features.hr.models.WorkSchedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, UUID>, JpaSpecificationExecutor<WorkSchedule> {

    Optional<WorkSchedule> findByIdAndIsDeletedFalse(UUID id);

    List<WorkSchedule> findByUserIdAndIsDeletedFalse(UUID userId);

    List<WorkSchedule> findByBusinessIdAndIsDeletedFalse(UUID businessId);

    @Query("SELECT w FROM WorkSchedule w LEFT JOIN w.user u LEFT JOIN u.profile p WHERE w.isDeleted = false " +
           "AND (:businessId IS NULL OR w.businessId = :businessId) " +
           "AND (:userId IS NULL OR w.userId = :userId) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "LOWER(w.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.userIdentifier) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<WorkSchedule> findWithFilters(
        @Param("businessId") UUID businessId,
        @Param("userId") UUID userId,
        @Param("search") String search,
        Pageable pageable
    );
}
