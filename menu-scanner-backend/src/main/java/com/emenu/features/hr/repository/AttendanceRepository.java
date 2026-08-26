package com.emenu.features.hr.repository;

import com.emenu.enums.hr.AttendanceStatusEnum;
import com.emenu.features.hr.models.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID>, JpaSpecificationExecutor<Attendance> {

    Optional<Attendance> findByIdAndIsDeletedFalse(UUID id);

    Optional<Attendance> findByUserIdAndAttendanceDateAndIsDeletedFalse(UUID userId, LocalDate date);

    List<Attendance> findByBusinessIdAndAttendanceDateAndIsDeletedFalseOrderByCreatedAtDesc(UUID businessId, LocalDate attendanceDate);

    @Query("SELECT a FROM Attendance a LEFT JOIN a.user u LEFT JOIN u.profile p WHERE a.isDeleted = false " +
           "AND (:businessId IS NULL OR a.businessId = :businessId) " +
           "AND (:userId IS NULL OR a.userId = :userId) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:startDate IS NULL OR a.attendanceDate >= :startDate) " +
           "AND (:endDate IS NULL OR a.attendanceDate <= :endDate) " +
           "AND (:search IS NULL OR :search = '' OR " +
           "LOWER(a.remarks) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.userIdentifier) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Attendance> findWithFilters(
        @Param("businessId") UUID businessId,
        @Param("userId") UUID userId,
        @Param("status") AttendanceStatusEnum status,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate,
        @Param("search") String search,
        Pageable pageable
    );
}