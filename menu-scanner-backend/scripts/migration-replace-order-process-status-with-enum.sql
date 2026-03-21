-- Migration: Replace OrderProcessStatus entity with OrderStatus enum
-- This migration converts from the legacy OrderProcessStatus management system to a simple enum-based approach

-- Step 1: Add new order_status column to orders table (with default PENDING)
ALTER TABLE orders
ADD COLUMN order_status VARCHAR(50) DEFAULT 'PENDING';

-- Step 2: Create index on new order_status column for better query performance
CREATE INDEX idx_orders_status ON orders(order_status);

-- Step 3: Add order_status column to order_status_history table
ALTER TABLE order_status_history
ADD COLUMN order_status VARCHAR(50);

-- Step 4: Drop the old order_process_status_id and OrderProcessStatus reference
-- First, drop the foreign key constraint
ALTER TABLE order_status_history
DROP CONSTRAINT IF EXISTS fk_order_status_history_order_process_status;

-- Step 5: Drop the old order_process_status_id column after the constraint is gone
ALTER TABLE order_status_history
DROP COLUMN IF EXISTS order_process_status_id;

-- Step 6: Make order_status NOT NULL in order_status_history
ALTER TABLE order_status_history
ALTER COLUMN order_status SET NOT NULL;

-- Step 7: Drop the order_process_statuses table entirely (it's no longer needed)
DROP TABLE IF EXISTS order_process_statuses;

-- Step 8: Drop old column from orders table
ALTER TABLE orders
DROP COLUMN IF EXISTS order_process_status_name;

-- Verify the schema changes
-- SELECT * FROM orders LIMIT 1;
-- SELECT * FROM order_status_history LIMIT 1;
