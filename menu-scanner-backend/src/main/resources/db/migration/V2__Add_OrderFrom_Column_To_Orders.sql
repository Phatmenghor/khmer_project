-- Add orderFrom column to orders table to distinguish between CUSTOMER and BUSINESS orders
ALTER TABLE orders ADD COLUMN order_from VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' AFTER source;

-- Add index for efficient filtering by order_from
CREATE INDEX idx_orders_order_from ON orders(order_from);

-- Update existing orders based on source column for backward compatibility
-- Orders with source='POS' are marked as BUSINESS, otherwise CUSTOMER
UPDATE orders SET order_from = CASE WHEN source = 'POS' THEN 'BUSINESS' ELSE 'CUSTOMER' END;

-- Add comment to document the column
ALTER TABLE orders MODIFY COLUMN order_from VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' COMMENT 'Order source: CUSTOMER (public checkout) or BUSINESS (admin/POS)';
