package com.emenu.shared.init;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseConstraintInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            log.info("Checking and dropping outdated database check constraints...");
            jdbcTemplate.execute("ALTER TABLE subscription_plans DROP CONSTRAINT IF EXISTS subscription_plans_duration_type_check;");
            jdbcTemplate.execute("ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_duration_type_check;");
            log.info("Database check constraints initialized successfully.");
        } catch (Exception e) {
            log.warn("Failed to drop database check constraint (may not exist or DB user lacks permission): {}", e.getMessage());
        }
    }
}
