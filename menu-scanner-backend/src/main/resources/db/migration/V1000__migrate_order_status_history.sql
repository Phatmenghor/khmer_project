-- Migration: Clean up order_status_history table
-- This completes the previous migration by also updating status history records

-- Migrate in-progress statuses to CONFIRMED
UPDATE order_status_history SET order_status = 'CONFIRMED' WHERE order_status IN ('PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERING') AND order_status IS NOT NULL;

-- Migrate failed/pending confirmation statuses
UPDATE order_status_history SET order_status = 'CANCELLED' WHERE order_status = 'FAILED' AND order_status IS NOT NULL;
UPDATE order_status_history SET order_status = 'PENDING' WHERE order_status = 'PENDING_POS_CONFIRMATION' AND order_status IS NOT NULL;

-- Ensure all status history records have valid statuses
UPDATE order_status_history SET order_status = 'PENDING' WHERE order_status NOT IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') AND order_status IS NOT NULL;
