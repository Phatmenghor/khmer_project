-- =========================================================================
-- Insert Products with Images (2-20 images per product)
-- =========================================================================
-- This script populates the database with sample products and their images
-- Make sure to insert categories, brands, and businesses first
-- =========================================================================

-- Get IDs for relationships (adjust these UUIDs to match your actual data)
DO $$
DECLARE
    business_id UUID;
    category_id UUID;
    brand_id UUID;
    product_id UUID;
    image_url_base VARCHAR;
BEGIN
    -- Get a sample business ID (adjust the filter as needed)
    SELECT id INTO business_id FROM businesses LIMIT 1;

    -- Get a sample category ID (adjust the filter as needed)
    SELECT id INTO category_id FROM categories WHERE business_id = business_id LIMIT 1;

    -- Get a sample brand ID (adjust the filter as needed)
    SELECT id INTO brand_id FROM brands WHERE business_id = business_id LIMIT 1;

    -- If any required data is missing, create sample data
    IF business_id IS NULL THEN
        INSERT INTO businesses (id, name, status, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Test Business', 'ACTIVE', false, NOW(), NOW())
        RETURNING id INTO business_id;
    END IF;

    IF category_id IS NULL THEN
        INSERT INTO categories (id, business_id, name, status, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), business_id, 'Test Category', 'ACTIVE', false, NOW(), NOW())
        RETURNING id INTO category_id;
    END IF;

    IF brand_id IS NULL THEN
        INSERT INTO brands (id, business_id, name, status, is_deleted, created_at, updated_at)
        VALUES (gen_random_uuid(), business_id, 'Test Brand', 'ACTIVE', false, NOW(), NOW())
        RETURNING id INTO brand_id;
    END IF;

    -- Insert 10 sample products with varying number of images (3-15 images per product)
    FOR i IN 1..10 LOOP
        product_id := gen_random_uuid();

        INSERT INTO products (
            id, business_id, category_id, brand_id, name, description,
            status, price, barcode, sku, main_image_url, has_sizes,
            has_active_promotion, view_count, favorite_count, is_deleted,
            created_at, updated_at
        ) VALUES (
            product_id,
            business_id,
            category_id,
            brand_id,
            'Product ' || i::TEXT,
            'This is a sample product ' || i::TEXT || ' with multiple images',
            'ACTIVE',
            (100 + (i * 10))::NUMERIC(10, 2),
            'BAR-' || i::TEXT,
            'SKU-' || i::TEXT,
            'https://via.placeholder.com/400x400?text=Product+' || i::TEXT,
            false,
            false,
            0,
            0,
            false,
            NOW(),
            NOW()
        );

        -- Insert 3-15 images for each product
        FOR img_idx IN 1..(3 + (i % 13)) LOOP
            INSERT INTO product_images (
                id, product_id, image_url, display_order, is_deleted, created_at, updated_at
            ) VALUES (
                gen_random_uuid(),
                product_id,
                'https://via.placeholder.com/400x400?text=Product+' || i::TEXT || '+Image+' || img_idx::TEXT,
                img_idx,
                false,
                NOW(),
                NOW()
            );
        END LOOP;

        RAISE NOTICE 'Created Product % with % images', i, (3 + (i % 13));
    END LOOP;

    RAISE NOTICE 'Successfully created 10 products with images!';
END $$;

-- Verify the data was inserted
SELECT
    p.id,
    p.name,
    p.business_id,
    COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_deleted = false
WHERE p.is_deleted = false
GROUP BY p.id, p.name, p.business_id
ORDER BY p.created_at DESC;
