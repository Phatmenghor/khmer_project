-- Add customer contact details to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- Add location_id reference and location_images snapshot to order_delivery_addresses table
-- location_id: Reference to original Location entity
-- location_images: Snapshot of images at order time (preserves history if images are later updated)
ALTER TABLE order_delivery_addresses
ADD COLUMN IF NOT EXISTS location_id UUID,
ADD COLUMN IF NOT EXISTS location_images jsonb DEFAULT '[]'::jsonb;

-- Create foreign key constraint for location_id
ALTER TABLE order_delivery_addresses
ADD CONSTRAINT fk_order_delivery_addresses_location_id
FOREIGN KEY (location_id) REFERENCES customer_addresses(id) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_delivery_addresses_location_id ON order_delivery_addresses(location_id);
