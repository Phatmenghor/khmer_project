package com.emenu.features.auth.repository;

import com.emenu.features.auth.models.SocialMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SocialMediaRepository extends JpaRepository<SocialMedia, UUID> {
    List<SocialMedia> findByBusinessSettingIdAndIsDeletedFalse(UUID businessSettingId);

    void deleteByBusinessSettingId(UUID businessSettingId);
}
