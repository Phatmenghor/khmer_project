package com.emenu.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
public class DatabaseConstraintFixer {

    @PersistenceContext
    private EntityManager entityManager;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void fixConstraints() {
        try {
            log.info("DatabaseConstraintFixer: Updating unique constraint uk_business_user_identifier...");
            // 1. Drop existing unique constraint if it exists
            entityManager.createNativeQuery("ALTER TABLE users DROP CONSTRAINT IF EXISTS uk_business_user_identifier").executeUpdate();
            
            // 2. Add the updated unique constraint covering user_identifier, user_type, and business_id
            entityManager.createNativeQuery(
                "ALTER TABLE users ADD CONSTRAINT uk_business_user_identifier UNIQUE (user_identifier, user_type, business_id)"
            ).executeUpdate();
            log.info("DatabaseConstraintFixer: Unique constraint uk_business_user_identifier updated successfully.");

            // 3. Drop the old check constraint on user_profiles gender to allow 'OTHER'
            log.info("DatabaseConstraintFixer: Dropping user_profiles_gender_check constraint if exists...");
            entityManager.createNativeQuery("ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_gender_check").executeUpdate();
            log.info("DatabaseConstraintFixer: Check constraint user_profiles_gender_check dropped successfully.");
        } catch (Exception e) {
            log.warn("DatabaseConstraintFixer: Could not update database constraints automatically: {}", e.getMessage());
        }
    }
}
