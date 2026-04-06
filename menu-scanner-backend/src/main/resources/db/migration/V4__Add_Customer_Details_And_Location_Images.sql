-- Add customer contact details to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- Add location images to order_delivery_addresses table
ALTER TABLE order_delivery_addresses
ADD COLUMN IF NOT EXISTS location_images jsonb DEFAULT '[]'::jsonb;

-- Create index on customer_email for lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
