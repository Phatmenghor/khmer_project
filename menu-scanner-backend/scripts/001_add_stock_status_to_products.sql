-- ============================================================================
-- MIGRATION: Add stock_status column to products table
-- ============================================================================
-- This migration adds the stock_status enum column to enable/disable
-- stock tracking per product
-- ============================================================================

-- Add the stock_status column if it doesn't exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_status VARCHAR(50) NOT NULL DEFAULT 'ENABLED';

-- Add constraint to ensure valid values (optional but recommended)
ALTER TABLE products
ADD CONSTRAINT products_stock_status_check
CHECK (stock_status IN ('ENABLED', 'DISABLED'));

-- Index for filtering by stock status
CREATE INDEX IF NOT EXISTS idx_products_stock_status ON products(stock_status);

-- Index for filtering by business and stock status
CREATE INDEX IF NOT EXISTS idx_products_business_stock_status ON products(business_id, stock_status);

-- ============================================================================
-- COMPLETED: stock_status column added successfully
-- ============================================================================
