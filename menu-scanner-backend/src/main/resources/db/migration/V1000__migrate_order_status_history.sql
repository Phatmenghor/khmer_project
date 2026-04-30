-- Migration: Clean up order_status_history table
-- This completes the previous migration by also updating status history records

-- Migrate in-progress statuses to CONFIRMED
UPDATE order_status_history SET status = 'CONFIRMED' WHERE status IN ('PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERING') AND status IS NOT NULL;

-- Migrate failed/pending confirmation statuses
UPDATE order_status_history SET status = 'CANCELLED' WHERE status = 'FAILED' AND status IS NOT NULL;
UPDATE order_status_history SET status = 'PENDING' WHERE status = 'PENDING_POS_CONFIRMATION' AND status IS NOT NULL;

-- Ensure all status history records have valid statuses
UPDATE order_status_history SET status = 'PENDING' WHERE status NOT IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') AND status IS NOT NULL;
