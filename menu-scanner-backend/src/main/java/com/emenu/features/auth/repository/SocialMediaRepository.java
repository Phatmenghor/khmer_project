package com.emenu.features.auth.repository;

import com.emenu.features.auth.models.SocialMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Social Media Repository
 * Data access layer for SocialMedia entity
 */
@Repository
public interface SocialMediaRepository extends JpaRepository<SocialMedia, UUID> {

    /**
     * Find all active social media for a business setting
     */
    List<SocialMedia> findByBusinessSettingIdAndIsDeletedFalse(UUID businessSettingId);

    /**
     * Delete all social media for a business setting
     */
    void deleteByBusinessSettingId(UUID businessSettingId);
}
