package com.emenu.features.hr.repository;

import com.emenu.enums.hr.LeaveStatusEnum;
import com.emenu.features.hr.models.Leave;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, UUID>, JpaSpecificationExecutor<Leave> {

    Optional<Leave> findByIdAndIsDeletedFalse(UUID id);

    @Query("SELECT l FROM Leave l LEFT JOIN l.user u LEFT JOIN u.profile p WHERE l.isDeleted = false " +
            "AND (:businessId IS NULL OR l.businessId = :businessId) " +
            "AND (:userId IS NULL OR l.userId = :userId) " +
            "AND (:leaveTypeEnum IS NULL OR l.leaveTypeEnum = :leaveTypeEnum) " +
            "AND (:status IS NULL OR l.status IN :status) " +
            "AND (:startDate IS NULL OR l.startDate >= :startDate) " +
            "AND (:endDate IS NULL OR l.endDate <= :endDate) " +
            "AND (:search IS NULL OR :search = '' OR " +
            "LOWER(l.reason) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(u.userIdentifier) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Leave> findWithFilters(
            @Param("businessId") UUID businessId,
            @Param("userId") UUID userId,
            @Param("leaveTypeEnum") String leaveTypeEnum,
            @Param("status") List<LeaveStatusEnum> status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT COUNT(l) FROM Leave l WHERE l.businessId = :businessId AND l.createdAt >= :startOfDay")
    long countTodayLeaves(@Param("businessId") UUID businessId, @Param("startOfDay") LocalDateTime startOfDay);

    @Query("SELECT COALESCE(SUM(l.totalDays), 0.0) FROM Leave l WHERE l.isDeleted = false " +
           "AND l.userId = :userId AND l.businessId = :businessId " +
           "AND (:leaveTypeEnum IS NULL OR l.leaveTypeEnum = :leaveTypeEnum) " +
           "AND l.status IN :statuses " +
           "AND l.startDate >= :startOfYear AND l.endDate <= :endOfYear")
    Double sumUsedLeaveDays(
            @Param("userId") UUID userId,
            @Param("businessId") UUID businessId,
            @Param("leaveTypeEnum") String leaveTypeEnum,
            @Param("statuses") List<LeaveStatusEnum> statuses,
            @Param("startOfYear") LocalDate startOfYear,
            @Param("endOfYear") LocalDate endOfYear
    );
}