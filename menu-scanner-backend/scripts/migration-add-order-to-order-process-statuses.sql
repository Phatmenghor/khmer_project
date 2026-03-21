-- ============================================================================
-- MIGRATION: Add order column to order_process_statuses table
-- ============================================================================
-- This migration adds the "order" column to the order_process_statuses table
-- for sorting order statuses by their sequence (1, 2, 3, 4, etc.)
--
-- Run this migration before running test-data-full-comprehensive.sql
-- Command: psql -h localhost -U postgres -d emenu_db -f migration-add-order-to-order-process-statuses.sql

BEGIN;

-- Check if column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'order_process_statuses'
        AND column_name = 'order'
    ) THEN
        -- Add the order column with default value 1
        ALTER TABLE order_process_statuses
        ADD COLUMN "order" INTEGER NOT NULL DEFAULT 1;

        RAISE NOTICE 'Column "order" added to order_process_statuses table';
    ELSE
        RAISE NOTICE 'Column "order" already exists in order_process_statuses table';
    END IF;
END $$;

COMMIT;
