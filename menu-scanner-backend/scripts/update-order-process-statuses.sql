-- ============================================================================
-- SQL SCRIPT: Add and Update "order" Column in order_process_statuses
-- ============================================================================
-- Run this script in pgAdmin for your database
-- This will:
-- 1. Add the "order" column if it doesn't exist
-- 2. Set order values based on status name (1-10)
-- 3. Set NOT NULL constraint

BEGIN TRANSACTION;

-- Step 1: Add the "order" column if it doesn't exist
ALTER TABLE order_process_statuses
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 1;

-- Step 2: Update order values based on status name
UPDATE order_process_statuses
SET "order" = CASE
    WHEN name = 'Pending' THEN 1
    WHEN name = 'Confirmed' THEN 2
    WHEN name = 'Preparing' THEN 3
    WHEN name = 'Ready' THEN 4
    WHEN name = 'In Delivery' THEN 5
    WHEN name = 'Delivered' THEN 6
    WHEN name = 'Completed' THEN 7
    WHEN name = 'Cancelled' THEN 8
    WHEN name = 'Refunded' THEN 9
    WHEN name = 'Failed' THEN 10
    ELSE "order" -- Keep existing value if not in the list
END
WHERE "order" = 1; -- Only update records still at default value

-- Step 3: Add NOT NULL constraint
ALTER TABLE order_process_statuses
ALTER COLUMN "order" SET NOT NULL;

-- Step 4: Verify the update
SELECT id, name, "order", status FROM order_process_statuses ORDER BY "order";

COMMIT;
