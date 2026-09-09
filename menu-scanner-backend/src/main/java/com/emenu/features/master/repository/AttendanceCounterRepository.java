package com.emenu.features.master.repository;

import com.emenu.features.master.models.AttendanceCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceCounterRepository extends JpaRepository<AttendanceCounter, UUID> {
    Optional<AttendanceCounter> findByBusinessIdAndCounterDate(UUID businessId, LocalDate counterDate);
}
