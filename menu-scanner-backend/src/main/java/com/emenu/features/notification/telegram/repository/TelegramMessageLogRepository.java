package com.emenu.features.notification.telegram.repository;

import com.emenu.features.notification.telegram.models.TelegramMessageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TelegramMessageLogRepository extends JpaRepository<TelegramMessageLog, UUID> {
    long countByBusinessIdAndIsDeletedFalse(UUID businessId);
    void deleteByBusinessId(UUID businessId);
}
