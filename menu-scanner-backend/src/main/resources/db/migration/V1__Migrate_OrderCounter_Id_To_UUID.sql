-- Migrate OrderCounter.id from IDENTITY (Long) to UUID
-- This migration creates a new UUID column, migrates data, and switches the ID

BEGIN;

-- Step 1: Add a new UUID column
ALTER TABLE order_counters ADD COLUMN id_new UUID;

-- Step 2: Generate UUIDs for existing rows
UPDATE order_counters SET id_new = gen_random_uuid();

-- Step 3: Make the new column NOT NULL (now that all rows have values)
ALTER TABLE order_counters ALTER COLUMN id_new SET NOT NULL;

-- Step 4: Drop the old id column (which is the PRIMARY KEY with IDENTITY)
ALTER TABLE order_counters DROP CONSTRAINT pk_order_counters;
ALTER TABLE order_counters DROP COLUMN id;

-- Step 5: Rename the new column to id
ALTER TABLE order_counters RENAME COLUMN id_new TO id;

-- Step 6: Add back the PRIMARY KEY constraint
ALTER TABLE order_counters ADD CONSTRAINT pk_order_counters PRIMARY KEY (id);

-- Step 7: Add back the unique constraint for counter_date
ALTER TABLE order_counters ADD CONSTRAINT uk_order_counter_date UNIQUE (counter_date);

COMMIT;
