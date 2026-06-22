package com.emenu.features.storage.repository;

import com.emenu.features.storage.model.StorageResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StorageResourceRepository extends JpaRepository<StorageResource, UUID> {

    void deleteByPath(String path);
}
