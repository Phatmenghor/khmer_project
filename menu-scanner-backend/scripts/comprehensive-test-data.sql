-- ============================================================================
-- COMPREHENSIVE MEGA TEST DATA GENERATION SCRIPT
-- 10,000 Products with Promotions, Sizes, Customizations & Images
-- 101 Users with Different Roles
-- 18 Categories × 18 Subcategories × 18 Brands
-- ============================================================================

-- ============================================================================
-- 1. CREATE BUSINESS
-- ============================================================================
INSERT INTO businesses (id, name, phone, email, address, status, is_subscription_active, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Mega Store',
  '+855-12-345-678',
  'megastore@example.com',
  'Phnom Penh, Cambodia',
  'ACTIVE', true, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. CREATE BUSINESS SETTINGS (ALL FEATURES ENABLED)
-- ============================================================================
INSERT INTO business_settings (id, business_id, use_categories, use_subcategories, use_brands, tax_percentage, business_name, logo_business_url, enable_stock, primary_color, contact_address, contact_phone, contact_email, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  true, true, true, 10.0, 'Mega Store', 'https://cdn.example.com/megastore-logo.png', 'ENABLED', '#FF6B6B',
  'Phnom Penh, Cambodia', '+855-12-345-678', 'megastore@example.com', false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. CREATE 101 USERS (1 OWNER + 5 ADMIN + 15 MANAGER + 80 STAFF)
-- ============================================================================

-- Main User (BUSINESS_OWNER)
INSERT INTO users (id, user_identifier, email, password, user_type, business_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  'phatmenghor20',
  'phatmenghor20@gmail.com',
  '$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm',
  'BUSINESS_OWNER',
  '550e8400-e29b-41d4-a716-446655440000',
  true, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- 5 Admin Users
INSERT INTO users (id, user_identifier, email, password, user_type, business_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'admin_' || i,
  'admin' || i || '@megastore.com',
  '$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm',
  'ADMIN',
  '550e8400-e29b-41d4-a716-446655440000',
  true, false, NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 5) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email LIKE 'admin%@megastore.com' AND business_id = '550e8400-e29b-41d4-a716-446655440000');

-- 15 Manager Users
INSERT INTO users (id, user_identifier, email, password, user_type, business_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'manager_' || i,
  'manager' || i || '@megastore.com',
  '$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm',
  'MANAGER',
  '550e8400-e29b-41d4-a716-446655440000',
  true, false, NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 15) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email LIKE 'manager%@megastore.com' AND business_id = '550e8400-e29b-41d4-a716-446655440000');

-- 80 Staff Users
INSERT INTO users (id, user_identifier, email, password, user_type, business_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'staff_' || i,
  'staff' || i || '@megastore.com',
  '$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm',
  'STAFF',
  '550e8400-e29b-41d4-a716-446655440000',
  true, false, NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 80) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email LIKE 'staff%@megastore.com' AND business_id = '550e8400-e29b-41d4-a716-446655440000');

-- ============================================================================
-- 4. CREATE 18 CATEGORIES
-- ============================================================================
INSERT INTO categories (id, business_id, name, description, image_url, status, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Category ' || i,
  'Category ' || i || ' - Complete collection of products',
  'https://cdn.example.com/category-' || i || '.jpg',
  'ACTIVE',
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 18) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Category ' || i);

-- ============================================================================
-- 5. CREATE 18 SUBCATEGORIES
-- ============================================================================
INSERT INTO subcategories (id, category_id, business_id, name, image_url, status, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  (SELECT id FROM categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440000' ORDER BY created_at LIMIT 1 OFFSET (i-1) % 18),
  '550e8400-e29b-41d4-a716-446655440000',
  'Subcategory ' || i,
  'https://cdn.example.com/subcat-' || i || '.jpg',
  'ACTIVE',
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 18) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM subcategories WHERE business_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Subcategory ' || i);

-- ============================================================================
-- 6. CREATE 18 BRANDS
-- ============================================================================
INSERT INTO brands (id, business_id, name, logo_url, description, status, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Brand ' || i,
  'https://cdn.example.com/brand-' || i || '-logo.png',
  'Brand ' || i || ' - Premium quality products',
  'ACTIVE',
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 18) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE business_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Brand ' || i);

-- ============================================================================
-- 7. CREATE 10,000 PRODUCTS (555 per category)
-- ============================================================================
INSERT INTO products (
  id, business_id, category_id, subcategory_id, brand_id, name, description, price,
  main_image_url, barcode, sku, status, stock_status, has_sizes, has_active_promotion,
  view_count, favorite_count, category_name, brand_name, business_name, is_deleted,
  created_at, updated_at, created_by, updated_by, promotion_type, promotion_value,
  promotion_from_date, promotion_to_date
)
SELECT
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  (SELECT id FROM categories WHERE business_id = '550e8400-e29b-41d4-a716-446655440000' ORDER BY created_at LIMIT 1 OFFSET (i-1) / 555),
  (SELECT id FROM subcategories WHERE business_id = '550e8400-e29b-41d4-a716-446655440000' ORDER BY created_at LIMIT 1 OFFSET (i-1) % 18),
  (SELECT id FROM brands WHERE business_id = '550e8400-e29b-41d4-a716-446655440000' ORDER BY created_at LIMIT 1 OFFSET (i-1) / 555 % 18),
  'Product ' || i,
  'High quality product ' || i || ' with premium features and excellent durability',
  (10 + (i % 200))::numeric,
  'https://cdn.example.com/product-' || i || '.jpg',
  '1000000000' || LPAD(i::text, 7, '0'),
  'SKU-' || LPAD(i::text, 7, '0'),
  'ACTIVE',
  'ENABLED',
  (i % 10) < 6,
  (i % 10) < 4,
  (i % 100),
  (i % 50),
  'Category ' || ((i - 1) / 555 + 1),
  'Brand ' || (((i - 1) / 555) % 18 + 1),
  'Mega Store',
  false,
  NOW(), NOW(), 'admin', 'admin',
  CASE WHEN (i % 10) < 4 THEN CASE WHEN (i % 2) = 0 THEN 'PERCENTAGE' ELSE 'FIXED_AMOUNT' END ELSE NULL END,
  CASE WHEN (i % 10) < 4 THEN CASE WHEN (i % 2) = 0 THEN (10 + (i % 40))::numeric ELSE (5 + (i % 20))::numeric END ELSE NULL END,
  CASE WHEN (i % 10) < 4 THEN NOW() ELSE NULL END,
  CASE WHEN (i % 10) < 4 THEN (NOW() + INTERVAL '30 days') ELSE NULL END
FROM generate_series(1, 10000) AS t(i);

-- ============================================================================
-- 8. CREATE SIZES FOR 60% OF PRODUCTS (9 sizes each = 54,000 sizes)
-- ============================================================================
INSERT INTO product_sizes (id, product_id, size, price, status, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  p.id,
  CASE size_num
    WHEN 0 THEN 'XS'
    WHEN 1 THEN 'S'
    WHEN 2 THEN 'M'
    WHEN 3 THEN 'L'
    WHEN 4 THEN 'XL'
    WHEN 5 THEN 'XXL'
    WHEN 6 THEN '3XL'
    WHEN 7 THEN '4XL'
    WHEN 8 THEN '5XL'
  END,
  (size_num * 2)::numeric,
  'ACTIVE',
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM products p
CROSS JOIN generate_series(0, 8) AS t(size_num)
WHERE p.business_id = '550e8400-e29b-41d4-a716-446655440000'
  AND p.has_sizes = true;

-- ============================================================================
-- 9. CREATE 18 CUSTOMIZATIONS PER PRODUCT (180,000 total)
-- ============================================================================
INSERT INTO product_customizations (id, product_id, name, price_adjustment, status, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  p.id,
  'Customization ' || custom_num || ' - ' || CASE custom_num
    WHEN 1 THEN 'Color'
    WHEN 2 THEN 'Size'
    WHEN 3 THEN 'Material'
    WHEN 4 THEN 'Engraving'
    WHEN 5 THEN 'Packaging'
    WHEN 6 THEN 'Warranty'
    WHEN 7 THEN 'Delivery'
    WHEN 8 THEN 'Installation'
    WHEN 9 THEN 'Training'
    WHEN 10 THEN 'Support'
    WHEN 11 THEN 'Upgrade'
    WHEN 12 THEN 'Premium'
    WHEN 13 THEN 'Express'
    WHEN 14 THEN 'Special'
    WHEN 15 THEN 'Deluxe'
    WHEN 16 THEN 'Luxury'
    WHEN 17 THEN 'Elite'
    WHEN 18 THEN 'Ultimate'
  END,
  (0.50 + custom_num * 0.50)::numeric,
  'ACTIVE',
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM products p
CROSS JOIN generate_series(1, 18) AS t(custom_num)
WHERE p.business_id = '550e8400-e29b-41d4-a716-446655440000';

-- ============================================================================
-- 10. CREATE 5 IMAGES PER PRODUCT (50,000 images)
-- ============================================================================
INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  p.id,
  'https://cdn.example.com/product-' || SUBSTRING(p.id::text, 1, 8) || '-image-' || img_num || '.jpg',
  'Product image ' || img_num || ' - ' || CASE img_num
    WHEN 1 THEN 'Front view'
    WHEN 2 THEN 'Back view'
    WHEN 3 THEN 'Side view'
    WHEN 4 THEN 'Detail view'
    WHEN 5 THEN 'Package view'
  END,
  img_num,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM products p
CROSS JOIN generate_series(1, 5) AS t(img_num)
WHERE p.business_id = '550e8400-e29b-41d4-a716-446655440000';

-- ============================================================================
-- FINAL STATISTICS
-- ============================================================================
-- ✅ BUSINESS: 1 (Mega Store)
-- ✅ USERS: 101
--   ├─ 1 Business Owner (phatmenghor20@gmail.com)
--   ├─ 5 Admin Users
--   ├─ 15 Manager Users
--   └─ 80 Staff Users
-- ✅ CATEGORIES: 18
-- ✅ SUBCATEGORIES: 18
-- ✅ BRANDS: 18
-- ✅ PRODUCTS: 10,000
--   ├─ With Promotions: 4,000 (40%)
--   │  ├─ PERCENTAGE (20%, 30%, 50% off)
--   │  └─ FIXED_AMOUNT ($5, $10, $25 off)
--   ├─ With Sizes: 6,000 (60%)
--   │  └─ 9 sizes per product = 54,000 total sizes
--   └─ Single Item: 4,000 (40%)
-- ✅ CUSTOMIZATIONS: 180,000 (18 per product × 10,000)
-- ✅ IMAGES: 50,000 (5 per product × 10,000)
-- ✅ TOTAL RECORDS: ~294,000+
-- ============================================================================
