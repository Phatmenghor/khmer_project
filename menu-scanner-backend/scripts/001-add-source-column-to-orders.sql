-- ============================================================================
-- MIGRATION: Add 'source' column to orders table
-- Purpose: Track order origin (POS vs PUBLIC/customer-created)
-- ============================================================================

-- Add source column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'PUBLIC';

-- Add comment to clarify the column
COMMENT ON COLUMN orders.source IS 'Order source: PUBLIC (customer-created) or POS (admin-created)';

-- Create index on source for filtering
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);

-- Optional: Set all existing orders to PUBLIC (if not already set)
UPDATE orders SET source = 'PUBLIC' WHERE source IS NULL;

-- Add NOT NULL constraint after data update
ALTER TABLE orders ALTER COLUMN source SET NOT NULL;

SELECT '✅ Migration complete: source column added to orders table' as status;
