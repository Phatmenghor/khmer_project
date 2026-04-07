-- Add discount_type column to orders table
-- This field tracks whether order-level discounts are PERCENTAGE or FIXED_AMOUNT
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_discount_type ON orders(discount_type);

-- Add comment for clarity
COMMENT ON COLUMN orders.discount_type IS 'Type of order-level discount: PERCENTAGE, FIXED_AMOUNT, or null if no discount';
