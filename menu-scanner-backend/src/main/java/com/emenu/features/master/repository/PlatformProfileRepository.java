package com.emenu.features.master.repository;

import com.emenu.features.master.models.PlatformProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlatformProfileRepository extends JpaRepository<PlatformProfile, Long> {

    Optional<PlatformProfile> findFirstByOrderByIdAsc();
}
