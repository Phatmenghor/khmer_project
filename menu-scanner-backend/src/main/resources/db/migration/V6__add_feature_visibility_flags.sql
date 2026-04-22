-- Add feature visibility flags to business_settings
ALTER TABLE business_settings
ADD COLUMN use_categories BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN use_subcategories BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN use_brands BOOLEAN DEFAULT false NOT NULL;

-- Make category_id nullable in products table
ALTER TABLE products
ALTER COLUMN category_id DROP NOT NULL;

-- Add subcategory_id to products table
ALTER TABLE products
ADD COLUMN subcategory_id UUID,
ADD CONSTRAINT fk_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id);

-- Create index for subcategory lookups
CREATE INDEX idx_products_subcategory_id ON products(subcategory_id);
