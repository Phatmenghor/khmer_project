package com.emenu.features.bakong.repository;

import com.emenu.features.bakong.model.BakongDailyQuotaLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BakongDailyQuotaRepository extends JpaRepository<BakongDailyQuotaLog, UUID> {

    Optional<BakongDailyQuotaLog> findByQuotaDateAndEmail(LocalDate quotaDate, String email);
}
