package com.emenu.features.spaces.repository;

import com.emenu.features.spaces.model.SpacesImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpacesImageRepository extends JpaRepository<SpacesImage, UUID> {

    List<SpacesImage> findByBusinessIdOrderByCreatedAtDesc(UUID businessId);

    void deleteByObjectKey(String objectKey);

    void deleteByBusinessId(UUID businessId);
}
