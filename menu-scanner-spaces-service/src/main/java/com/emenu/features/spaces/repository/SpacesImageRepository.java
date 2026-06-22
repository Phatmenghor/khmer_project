package com.emenu.features.spaces.repository;

import com.emenu.features.spaces.model.SpacesImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpacesImageRepository extends JpaRepository<SpacesImage, UUID> {

    /** Fetch all log entries for a given project + path (from the API key). */
    List<SpacesImage> findByProjectCodeAndPathOrderByCreatedAtDesc(String projectCode, String path);

    void deleteByObjectKey(String objectKey);

    void deleteByProjectCodeAndPath(String projectCode, String path);
}
