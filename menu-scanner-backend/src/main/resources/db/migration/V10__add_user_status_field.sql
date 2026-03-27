-- ============================================================================
-- V10: Add platform-managed status field to users
--      status  = platform enable/disable (ACTIVE | INACTIVE)
--      account_status = business-managed state (ACTIVE | END_WORK | LOCKED)
-- ============================================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
