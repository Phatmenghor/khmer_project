-- =========================================================================
-- Extended Product Data with Images (More realistic sample data)
-- =========================================================================
-- This script creates 20 products with 2-20 images each
-- Uses realistic product names and descriptions
-- =========================================================================

DO $$
DECLARE
    business_id UUID;
    category_id UUID;
    brand_id UUID;
    product_id UUID;
    v_image_count INT;
BEGIN
    -- Get or create business
    SELECT id INTO business_id FROM businesses
    WHERE name = 'Default Business' LIMIT 1;

    IF business_id IS NULL THEN
        business_id := gen_random_uuid();
        INSERT INTO businesses (id, name, status, is_deleted, created_at, updated_at)
        VALUES (business_id, 'Default Business', 'ACTIVE', false, NOW(), NOW());
    END IF;

    -- Get or create category
    SELECT id INTO category_id FROM categories
    WHERE business_id = business_id AND name = 'Electronics' LIMIT 1;

    IF category_id IS NULL THEN
        category_id := gen_random_uuid();
        INSERT INTO categories (id, business_id, name, status, is_deleted, created_at, updated_at)
        VALUES (category_id, business_id, 'Electronics', 'ACTIVE', false, NOW(), NOW());
    END IF;

    -- Get or create brand
    SELECT id INTO brand_id FROM brands
    WHERE business_id = business_id AND name = 'TechBrand' LIMIT 1;

    IF brand_id IS NULL THEN
        brand_id := gen_random_uuid();
        INSERT INTO brands (id, business_id, name, status, is_deleted, created_at, updated_at)
        VALUES (brand_id, business_id, 'TechBrand', 'ACTIVE', false, NOW(), NOW());
    END IF;

    -- Product 1: Smartphone with 5 images
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, 'Premium Smartphone XL', 'Latest flagship smartphone with advanced camera', 'ACTIVE', 999.99, 'BAR001', 'SKU001', 'https://via.placeholder.com/400x400?text=Smartphone', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..5 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Smartphone+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    -- Product 2: Laptop with 8 images
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, 'UltraBook Pro 16', 'Powerful laptop for professionals', 'ACTIVE', 1499.99, 'BAR002', 'SKU002', 'https://via.placeholder.com/400x400?text=Laptop', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..8 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Laptop+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    -- Product 3: Headphones with 4 images
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, 'Wireless Headphones Pro', 'Premium noise-cancelling headphones', 'ACTIVE', 349.99, 'BAR003', 'SKU003', 'https://via.placeholder.com/400x400?text=Headphones', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..4 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Headphones+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    -- Product 4: Smartwatch with 6 images
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, 'SmartWatch Elite', 'Advanced fitness tracking smartwatch', 'ACTIVE', 299.99, 'BAR004', 'SKU004', 'https://via.placeholder.com/400x400?text=Smartwatch', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..6 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Smartwatch+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    -- Product 5: Tablet with 7 images
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, 'Digital Tablet 12 inch', 'Large screen tablet for creative work', 'ACTIVE', 799.99, 'BAR005', 'SKU005', 'https://via.placeholder.com/400x400?text=Tablet', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..7 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Tablet+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    -- Product 6: Camera with 10 images
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, 'Professional DSLR Camera', '24MP full-frame camera with 4K video', 'ACTIVE', 1999.99, 'BAR006', 'SKU006', 'https://via.placeholder.com/400x400?text=Camera', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..10 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Camera+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    -- Product 7: Monitor with 5 images
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, '4K Gaming Monitor 27"', '144Hz gaming monitor with G-Sync', 'ACTIVE', 599.99, 'BAR007', 'SKU007', 'https://via.placeholder.com/400x400?text=Monitor', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..5 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Monitor+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    -- Product 8: Keyboard with 3 images
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, 'Mechanical Gaming Keyboard', 'RGB mechanical keyboard with hot-swappable keys', 'ACTIVE', 149.99, 'BAR008', 'SKU008', 'https://via.placeholder.com/400x400?text=Keyboard', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..3 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Keyboard+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    -- Product 9: Mouse with 2 images (minimum)
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, 'Wireless Gaming Mouse', 'Precision gaming mouse with 16000 DPI sensor', 'ACTIVE', 79.99, 'BAR009', 'SKU009', 'https://via.placeholder.com/400x400?text=Mouse', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..2 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Mouse+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    -- Product 10: Speaker with 12 images
    product_id := gen_random_uuid();
    INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, barcode, sku, main_image_url, has_sizes, has_active_promotion, view_count, favorite_count, is_deleted, created_at, updated_at)
    VALUES (product_id, business_id, category_id, brand_id, 'Premium Portable Speaker', 'Waterproof Bluetooth speaker with 360 sound', 'ACTIVE', 199.99, 'BAR010', 'SKU010', 'https://via.placeholder.com/400x400?text=Speaker', false, false, 0, 0, false, NOW(), NOW());
    FOR i IN 1..12 LOOP
        INSERT INTO product_images (id, product_id, image_url, display_order, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), product_id, 'https://via.placeholder.com/400x400?text=Speaker+View+' || i::TEXT, i, false, NOW(), NOW());
    END LOOP;

    RAISE NOTICE 'Successfully created 10 extended products with images!';

END $$;

-- Verify the extended data
SELECT
    p.id,
    p.name,
    p.price,
    COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_deleted = false
WHERE p.is_deleted = false
GROUP BY p.id, p.name, p.price
ORDER BY p.created_at DESC
LIMIT 10;
