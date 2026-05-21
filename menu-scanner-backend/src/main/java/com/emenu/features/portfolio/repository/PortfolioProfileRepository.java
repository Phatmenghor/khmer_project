package com.emenu.features.portfolio.repository;

import com.emenu.features.portfolio.models.PortfolioProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioProfileRepository extends JpaRepository<PortfolioProfile, UUID> {

    Optional<PortfolioProfile> findByBusinessIdAndIsDeletedFalse(UUID businessId);

    Optional<PortfolioProfile> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndBusinessIdNotAndIsDeletedFalse(String slug, UUID businessId);
}
