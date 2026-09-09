package com.emenu.features.master.repository;

import com.emenu.features.master.models.AttendanceCheckInCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceCheckInCounterRepository extends JpaRepository<AttendanceCheckInCounter, UUID> {
    Optional<AttendanceCheckInCounter> findByBusinessIdAndCounterDate(UUID businessId, LocalDate counterDate);
}
