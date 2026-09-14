package com.emenu.features.bakong.repository;

import com.emenu.features.bakong.model.BakongConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BakongConfigRepository extends JpaRepository<BakongConfig, UUID> {

    Optional<BakongConfig> findByConfigName(String configName);

    Optional<BakongConfig> findTopByEnabledTrue();

    List<BakongConfig> findAllByEnabledTrue();
}


