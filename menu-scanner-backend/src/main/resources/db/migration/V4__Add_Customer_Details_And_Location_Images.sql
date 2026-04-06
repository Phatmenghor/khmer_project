-- Add customer contact details to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- Add location_id reference to order_delivery_addresses table
-- This allows fetching locationImages from the Location entity without duplication
ALTER TABLE order_delivery_addresses
ADD COLUMN IF NOT EXISTS location_id UUID;

-- Create foreign key constraint for location_id
ALTER TABLE order_delivery_addresses
ADD CONSTRAINT fk_order_delivery_addresses_location_id
FOREIGN KEY (location_id) REFERENCES customer_addresses(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_delivery_addresses_location_id ON order_delivery_addresses(location_id);
