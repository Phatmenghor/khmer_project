package com.emenu.features.bakong.repository;

import com.emenu.features.bakong.model.BakongTokenLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BakongTokenRepository extends JpaRepository<BakongTokenLog, UUID> {

    Optional<BakongTokenLog> findTopByEmailAndStatusOrderByCreatedAtDesc(String email, String status);
}
