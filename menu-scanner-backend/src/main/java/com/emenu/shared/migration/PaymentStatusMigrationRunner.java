package com.emenu.shared.migration;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * One-time migration: replaces removed PaymentStatus values (PENDING, COMPLETED, FAILED, CANCELLED)
 * with their new equivalents (UNPAID, PAID) in all affected tables.
 */
@Slf4j
@Component
public class PaymentStatusMigrationRunner implements ApplicationRunner {

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        migrateTable("orders", "payment_status");
        migrateTable("payments", "status");
        migrateTable("order_payments", "status");
    }

    private void migrateTable(String table, String column) {
        int pending   = update(table, column, "PENDING",   "UNPAID");
        int completed = update(table, column, "COMPLETED", "PAID");
        int failed    = update(table, column, "FAILED",    "UNPAID");
        int cancelled = update(table, column, "CANCELLED", "UNPAID");
        int total = pending + completed + failed + cancelled;
        if (total > 0) {
            log.info("[PaymentStatusMigration] {}.{}: {} rows updated (PENDING={}, COMPLETED={}, FAILED={}, CANCELLED={})",
                    table, column, total, pending, completed, failed, cancelled);
        }
    }

    private int update(String table, String column, String from, String to) {
        return em.createNativeQuery(
                "UPDATE " + table + " SET " + column + " = :to WHERE " + column + " = :from")
                .setParameter("to", to)
                .setParameter("from", from)
                .executeUpdate();
    }
}
