package com.emenu.features.spaces.repository;

import com.emenu.features.spaces.model.SpacesImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpacesImageRepository extends JpaRepository<SpacesImage, UUID> {

    List<SpacesImage> findByBusinessIdOrderByCreatedAtDesc(UUID businessId);

    List<SpacesImage> findByBusinessIdAndEntityTypeAndEntityId(
            UUID businessId, String entityType, String entityId);

    List<SpacesImage> findByBusinessIdAndEntityType(UUID businessId, String entityType);

    Optional<SpacesImage> findByObjectKey(String objectKey);

    void deleteByObjectKey(String objectKey);

    void deleteByBusinessId(UUID businessId);
}
