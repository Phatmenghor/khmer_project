package com.emenu.features.counter.repository;

import com.emenu.features.counter.models.LeaveCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveCounterRepository extends JpaRepository<LeaveCounter, UUID> {
    Optional<LeaveCounter> findByBusinessIdAndCounterDate(UUID businessId, LocalDate counterDate);
}
