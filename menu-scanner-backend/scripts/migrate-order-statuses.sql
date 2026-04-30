-- ============================================================
-- Database Migration Script: Order Status Simplification
-- ============================================================
-- This script migrates old order statuses to the simplified 4-status model
-- Run this in pgAdmin or psql before/after deploying the updated OrderStatus enum
--
-- Old statuses → New statuses:
-- PREPARING → CONFIRMED
-- READY → CONFIRMED
-- IN_TRANSIT → CONFIRMED
-- DELIVERING → CONFIRMED
-- FAILED → CANCELLED
-- PENDING_POS_CONFIRMATION → PENDING
-- ============================================================

BEGIN;

-- Check what old statuses exist
SELECT DISTINCT order_status FROM orders WHERE order_status NOT IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- Migrate in-progress statuses to CONFIRMED
UPDATE orders SET order_status = 'CONFIRMED'
WHERE order_status IN ('PREPARING', 'READY', 'IN_TRANSIT', 'DELIVERING')
AND order_status IS NOT NULL;

-- Migrate failed statuses to CANCELLED
UPDATE orders SET order_status = 'CANCELLED'
WHERE order_status = 'FAILED'
AND order_status IS NOT NULL;

-- Migrate pending confirmation statuses to PENDING
UPDATE orders SET order_status = 'PENDING'
WHERE order_status = 'PENDING_POS_CONFIRMATION'
AND order_status IS NOT NULL;

-- Ensure all orders have valid statuses (safety net)
UPDATE orders SET order_status = 'PENDING'
WHERE order_status NOT IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')
AND order_status IS NOT NULL;

-- Verify migration results
SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status ORDER BY count DESC;

COMMIT;
