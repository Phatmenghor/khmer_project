package com.emenu.features.storage.repository;

import com.emenu.features.storage.model.StorageBase64;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StorageBase64Repository extends JpaRepository<StorageBase64, UUID> {

    Optional<StorageBase64> findByObjectKey(String objectKey);

    void deleteByObjectKey(String objectKey);

    @Modifying
    @Query("DELETE FROM StorageBase64 sb WHERE sb.objectKey LIKE :prefix%")
    void deleteByObjectKeyPrefix(@Param("prefix") String prefix);
}
