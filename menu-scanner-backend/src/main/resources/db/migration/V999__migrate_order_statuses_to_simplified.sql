-- Migration: Migrate old order statuses to simplified enum values
-- Maps old statuses to new ones: PENDING, CONFIRMED, COMPLETED, CANCELLED

-- Migrate in-progress statuses to CONFIRMED
UPDATE orders SET order_status = 'CONFIRMED' WHERE order_status IN ('PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERING') AND order_status IS NOT NULL;

-- Migrate failed/pending confirmation statuses
UPDATE orders SET order_status = 'CANCELLED' WHERE order_status = 'FAILED' AND order_status IS NOT NULL;
UPDATE orders SET order_status = 'PENDING' WHERE order_status = 'PENDING_POS_CONFIRMATION' AND order_status IS NOT NULL;

-- Ensure all orders have valid statuses
UPDATE orders SET order_status = 'PENDING' WHERE order_status NOT IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') AND order_status IS NOT NULL;

-- Also update order_status_history table to maintain referential integrity
UPDATE order_status_history SET status = 'CONFIRMED' WHERE status IN ('PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERING') AND status IS NOT NULL;
UPDATE order_status_history SET status = 'CANCELLED' WHERE status = 'FAILED' AND status IS NOT NULL;
UPDATE order_status_history SET status = 'PENDING' WHERE status = 'PENDING_POS_CONFIRMATION' AND status IS NOT NULL;
UPDATE order_status_history SET status = 'PENDING' WHERE status NOT IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') AND status IS NOT NULL;
