-- =========================================================================
-- Bulk Product Data Generation (50 products with varying image counts)
-- =========================================================================
-- This script creates 50 products with 2-20 images for performance testing
-- =========================================================================

DO $$
DECLARE
    business_id UUID;
    category_id UUID;
    brand_id UUID;
    product_id UUID;
    v_image_count INT;
    product_names VARCHAR[] := ARRAY[
        'Wireless Earbuds', 'USB-C Hub', 'Phone Stand', 'Screen Protector', 'Phone Case',
        'Laptop Stand', 'Webcam', 'Microphone', 'Monitor Light', 'Desk Lamp',
        'Power Bank', 'Charging Cable', 'HDMI Cable', 'USB Cable', 'SD Card Reader',
        'Portable SSD', 'External HDD', 'Memory Card', 'Flash Drive', 'USB Hub',
        'Desk Organizer', 'Cable Management', 'Wire Clips', 'Magnetic Mount', 'Phone Ring',
        'Screen Cleaner', 'Keyboard Wrist Rest', 'Mouse Pad', 'Cable Sleeve', 'Phone Strap',
        'Laptop Bag', 'Phone Holder', 'Tablet Stand', 'Desk Mat', 'Cooling Pad',
        'File Organizer', 'Desk Shelf', 'Wall Mount', 'Monitor Arm', 'Desk Clamp',
        'USB Fan', 'Desk Heater', 'Humidifier', 'Air Purifier', 'Phone Dock',
        'Wireless Charger', 'Car Phone Mount', 'Dashboard Cam', 'Bluetooth Adapter', 'USB Light'
    ];
BEGIN
    -- Get or create business
    SELECT id INTO business_id FROM businesses LIMIT 1;
    IF business_id IS NULL THEN
        business_id := gen_random_uuid();
        INSERT INTO businesses (id, name, status, is_deleted, created_at, updated_at)
        VALUES (business_id, 'Default Business', 'ACTIVE', false, NOW(), NOW());
    END IF;

    -- Get or create category
    SELECT id INTO category_id FROM categories WHERE business_id = business_id LIMIT 1;
    IF category_id IS NULL THEN
        category_id := gen_random_uuid();
        INSERT INTO categories (id, business_id, name, status, is_deleted, created_at, updated_at)
        VALUES (category_id, business_id, 'Accessories', 'ACTIVE', false, NOW(), NOW());
    END IF;

    -- Get or create brand
    SELECT id INTO brand_id FROM brands WHERE business_id = business_id LIMIT 1;
    IF brand_id IS NULL THEN
        brand_id := gen_random_uuid();
        INSERT INTO brands (id, business_id, name, status, is_deleted, created_at, updated_at)
        VALUES (brand_id, business_id, 'TechBrand', 'ACTIVE', false, NOW(), NOW());
    END IF;

    -- Create 50 products with varying image counts
    FOR i IN 1..50 LOOP
        product_id := gen_random_uuid();

        -- Calculate image count: 2-20 images per product
        v_image_count := 2 + ((i * 7) % 19);

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
            product_names[((i-1) % array_length(product_names, 1)) + 1] || ' - ' || i::TEXT,
            'High-quality product with ' || v_image_count::TEXT || ' product images',
            'ACTIVE',
            (29.99 + (i * 5))::NUMERIC(10, 2),
            'BAR' || LPAD(i::TEXT, 6, '0'),
            'SKU' || LPAD(i::TEXT, 6, '0'),
            'https://via.placeholder.com/400x400?text=Product+' || i::TEXT,
            false,
            false,
            FLOOR(RANDOM() * 1000)::BIGINT,
            FLOOR(RANDOM() * 100)::BIGINT,
            false,
            NOW() - INTERVAL '1 day' * (i % 30),
            NOW()
        );

        -- Insert calculated number of images for each product
        FOR img_idx IN 1..v_image_count LOOP
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

        IF i % 10 = 0 THEN
            RAISE NOTICE 'Created % products with images...', i;
        END IF;
    END LOOP;

    RAISE NOTICE 'Successfully created 50 bulk products with images!';

END $$;

-- Summary statistics
SELECT
    COUNT(DISTINCT p.id) as total_products,
    MIN(image_count) as min_images,
    MAX(image_count) as max_images,
    ROUND(AVG(image_count)::NUMERIC, 2) as avg_images,
    COUNT(CASE WHEN image_count < 2 THEN 1 END) as products_with_less_than_2,
    COUNT(CASE WHEN image_count >= 2 AND image_count <= 20 THEN 1 END) as products_with_valid_range,
    COUNT(CASE WHEN image_count > 20 THEN 1 END) as products_with_more_than_20
FROM (
    SELECT
        p.id,
        p.name,
        COUNT(pi.id) as image_count
    FROM products p
    LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_deleted = false
    WHERE p.is_deleted = false
    GROUP BY p.id, p.name
) product_stats;
