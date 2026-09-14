package com.emenu.features.bakong.repository;

import com.emenu.features.bakong.model.BakongConfig;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BakongConfigRepository extends JpaRepository<BakongConfig, UUID> {

    Optional<BakongConfig> findByConfigName(String configName);

    Optional<BakongConfig> findTopByEnabledTrue();

    List<BakongConfig> findAllByEnabledTrue();

    @Query("SELECT c FROM BakongConfig c WHERE c.isDeleted = false AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(c.configName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.apiUrl) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<BakongConfig> searchConfigs(@Param("search") String search, Pageable pageable);
}
