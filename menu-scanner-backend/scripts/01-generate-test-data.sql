-- ============================================================================
-- COMPLETE TEST DATA GENERATION SCRIPT
-- Fashion Hub - Clothing Store with ALL Features Enabled
-- User: phatmenghor20@gmail.com (BUSINESS_OWNER)
-- Features: Categories ✓ | Subcategories ✓ | Brands ✓
-- ============================================================================

-- Clear existing test data (optional - comment out if you want to preserve data)
-- DELETE FROM product_customizations WHERE product_id IN (SELECT id FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000');
-- DELETE FROM product_sizes WHERE product_id IN (SELECT id FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000');
-- DELETE FROM product_images WHERE product_id IN (SELECT id FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000');
-- DELETE FROM products WHERE business_id = '550e8400-e29b-41d4-a716-446655440000';

-- ============================================================================
-- 1. CREATE BUSINESS
-- ============================================================================
INSERT INTO businesses (id, name, phone, email, address, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Fashion Hub',
  '+855-12-345-678',
  'fashion@example.com',
  'Phnom Penh, Cambodia',
  true,
  false,
  NOW(),
  NOW(),
  'admin',
  'admin'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. CREATE USER (BUSINESS_OWNER)
-- ============================================================================
INSERT INTO users (id, user_identifier, email, password, user_type, business_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  'phatmenghor20',
  'phatmenghor20@gmail.com',
  '$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm', -- password: 'Admin@123'
  'BUSINESS_USER',
  '550e8400-e29b-41d4-a716-446655440000',
  true,
  false,
  NOW(),
  NOW(),
  'admin',
  'admin'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. CREATE BUSINESS SETTINGS (ALL FEATURES ENABLED)
-- ============================================================================
INSERT INTO business_settings (id, business_id, use_categories, use_subcategories, use_brands, tax_percentage, business_name, logo_business_url, enable_stock, primary_color, contact_address, contact_phone, contact_email, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  true,  -- ✓ Categories enabled
  true,  -- ✓ Subcategories enabled
  true,  -- ✓ Brands enabled
  10.0,
  'Fashion Hub',
  'https://cdn.example.com/fashion-hub-logo.png',
  'ENABLED',
  '#FF6B6B',
  'Phnom Penh, Cambodia',
  '+855-12-345-678',
  'fashion@example.com',
  false,
  NOW(),
  NOW(),
  'admin',
  'admin'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. CREATE CATEGORIES
-- ============================================================================
INSERT INTO categories (id, business_id, name, description, image_url, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Men', 'Men''s clothing collection', 'https://cdn.example.com/men-category.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Women', 'Women''s clothing collection', 'https://cdn.example.com/women-category.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('880e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Kids', 'Kids'' clothing collection', 'https://cdn.example.com/kids-category.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. CREATE SUBCATEGORIES (Under Men)
-- ============================================================================
INSERT INTO subcategories (id, category_id, business_id, name, image_url, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('990e8400-e29b-41d4-a716-446655440020', '880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Shirts', 'https://cdn.example.com/men-shirts.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440021', '880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Pants', 'https://cdn.example.com/men-pants.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440022', '880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Shoes', 'https://cdn.example.com/men-shoes.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. CREATE SUBCATEGORIES (Under Women)
-- ============================================================================
INSERT INTO subcategories (id, category_id, business_id, name, image_url, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('990e8400-e29b-41d4-a716-446655440030', '880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Dresses', 'https://cdn.example.com/women-dresses.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440031', '880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Tops', 'https://cdn.example.com/women-tops.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440032', '880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Accessories', 'https://cdn.example.com/women-accessories.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 7. CREATE BRANDS
-- ============================================================================
INSERT INTO brands (id, business_id, name, logo_url, description, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('aa0e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440000', 'Nike', 'https://cdn.example.com/nike-logo.png', 'Nike athletic brand', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('aa0e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440000', 'Adidas', 'https://cdn.example.com/adidas-logo.png', 'Adidas sports brand', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('aa0e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440000', 'Gucci', 'https://cdn.example.com/gucci-logo.png', 'Gucci luxury brand', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 8. CREATE PRODUCTS (Men's Shirts)
-- ============================================================================
INSERT INTO products (id, business_id, category_id, subcategory_id, brand_id, name, description, price, main_image_url, barcode, sku, status, stock_status, has_sizes, has_active_promotion, view_count, favorite_count, category_name, brand_name, business_name, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  (
    'bb0e8400-e29b-41d4-a716-446655440050',
    '550e8400-e29b-41d4-a716-446655440000',
    '880e8400-e29b-41d4-a716-446655440010',
    '990e8400-e29b-41d4-a716-446655440020',
    'aa0e8400-e29b-41d4-a716-446655440040',
    'Classic T-Shirt',
    'Premium cotton t-shirt available in multiple colors',
    25.00,
    'https://cdn.example.com/tshirt-main.jpg',
    '1234567890123',
    'TSHIRT-NIKE-001',
    'ACTIVE',
    'ENABLED',
    true,
    false,
    0,
    0,
    'Men',
    'Nike',
    'Fashion Hub',
    false,
    NOW(),
    NOW(),
    'admin',
    'admin'
  ),
  (
    'bb0e8400-e29b-41d4-a716-446655440051',
    '550e8400-e29b-41d4-a716-446655440000',
    '880e8400-e29b-41d4-a716-446655440010',
    '990e8400-e29b-41d4-a716-446655440020',
    'aa0e8400-e29b-41d4-a716-446655440041',
    'Athletic Polo Shirt',
    'Comfortable polo shirt for sports and casual wear',
    35.00,
    'https://cdn.example.com/polo-main.jpg',
    '1234567890124',
    'POLO-ADIDAS-001',
    'ACTIVE',
    'ENABLED',
    true,
    false,
    0,
    0,
    'Men',
    'Adidas',
    'Fashion Hub',
    false,
    NOW(),
    NOW(),
    'admin',
    'admin'
  ),
  (
    'bb0e8400-e29b-41d4-a716-446655440052',
    '550e8400-e29b-41d4-a716-446655440000',
    '880e8400-e29b-41d4-a716-446655440011',
    '990e8400-e29b-41d4-a716-446655440031',
    'aa0e8400-e29b-41d4-a716-446655440042',
    'Silk Evening Blouse',
    'Elegant silk blouse perfect for evening events',
    89.00,
    'https://cdn.example.com/blouse-main.jpg',
    '1234567890125',
    'BLOUSE-GUCCI-001',
    'ACTIVE',
    'ENABLED',
    true,
    false,
    0,
    0,
    'Women',
    'Gucci',
    'Fashion Hub',
    false,
    NOW(),
    NOW(),
    'admin',
    'admin'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 9. CREATE PRODUCT SIZES
-- ============================================================================
INSERT INTO product_sizes (id, product_id, size, price, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  -- Classic T-Shirt Sizes
  ('cc0e8400-e29b-41d4-a716-446655440060', 'bb0e8400-e29b-41d4-a716-446655440050', 'Small', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440061', 'bb0e8400-e29b-41d4-a716-446655440050', 'Medium', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440062', 'bb0e8400-e29b-41d4-a716-446655440050', 'Large', 2.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440063', 'bb0e8400-e29b-41d4-a716-446655440050', 'XL', 3.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440064', 'bb0e8400-e29b-41d4-a716-446655440050', 'XXL', 5.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),

  -- Athletic Polo Shirt Sizes
  ('cc0e8400-e29b-41d4-a716-446655440070', 'bb0e8400-e29b-41d4-a716-446655440051', 'Small', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440071', 'bb0e8400-e29b-41d4-a716-446655440051', 'Medium', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440072', 'bb0e8400-e29b-41d4-a716-446655440051', 'Large', 2.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440073', 'bb0e8400-e29b-41d4-a716-446655440051', 'XL', 3.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),

  -- Silk Evening Blouse Sizes
  ('cc0e8400-e29b-41d4-a716-446655440080', 'bb0e8400-e29b-41d4-a716-446655440052', 'XS', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440081', 'bb0e8400-e29b-41d4-a716-446655440052', 'Small', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440082', 'bb0e8400-e29b-41d4-a716-446655440052', 'Medium', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440083', 'bb0e8400-e29b-41d4-a716-446655440052', 'Large', 5.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 10. CREATE PRODUCT CUSTOMIZATIONS (ADD-ONS)
-- ============================================================================
INSERT INTO product_customizations (id, product_id, name, price_adjustment, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  -- Classic T-Shirt Customizations
  ('dd0e8400-e29b-41d4-a716-446655440090', 'bb0e8400-e29b-41d4-a716-446655440050', 'Custom Color', 3.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440091', 'bb0e8400-e29b-41d4-a716-446655440050', 'Embroidery Logo', 2.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440092', 'bb0e8400-e29b-41d4-a716-446655440050', 'Gift Wrap', 2.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),

  -- Athletic Polo Shirt Customizations
  ('dd0e8400-e29b-41d4-a716-446655440100', 'bb0e8400-e29b-41d4-a716-446655440051', 'Team Logo Print', 4.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440101', 'bb0e8400-e29b-41d4-a716-446655440051', 'Name Embroidery', 3.50, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440102', 'bb0e8400-e29b-41d4-a716-446655440051', 'Premium Packaging', 2.50, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),

  -- Silk Evening Blouse Customizations
  ('dd0e8400-e29b-41d4-a716-446655440110', 'bb0e8400-e29b-41d4-a716-446655440052', 'Custom Alteration', 10.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440111', 'bb0e8400-e29b-41d4-a716-446655440052', 'Monogram Embroidery', 8.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440112', 'bb0e8400-e29b-41d4-a716-446655440052', 'Luxury Gift Box', 5.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 11. CREATE PRODUCT IMAGES
-- ============================================================================
INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  -- Classic T-Shirt Images
  ('ee0e8400-e29b-41d4-a716-446655440120', 'bb0e8400-e29b-41d4-a716-446655440050', 'https://cdn.example.com/tshirt-front.jpg', 'Front view', 1, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440121', 'bb0e8400-e29b-41d4-a716-446655440050', 'https://cdn.example.com/tshirt-back.jpg', 'Back view', 2, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440122', 'bb0e8400-e29b-41d4-a716-446655440050', 'https://cdn.example.com/tshirt-detail.jpg', 'Detail view', 3, false, NOW(), NOW(), 'admin', 'admin'),

  -- Athletic Polo Shirt Images
  ('ee0e8400-e29b-41d4-a716-446655440130', 'bb0e8400-e29b-41d4-a716-446655440051', 'https://cdn.example.com/polo-front.jpg', 'Front view', 1, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440131', 'bb0e8400-e29b-41d4-a716-446655440051', 'https://cdn.example.com/polo-back.jpg', 'Back view', 2, false, NOW(), NOW(), 'admin', 'admin'),

  -- Silk Evening Blouse Images
  ('ee0e8400-e29b-41d4-a716-446655440140', 'bb0e8400-e29b-41d4-a716-446655440052', 'https://cdn.example.com/blouse-front.jpg', 'Front view', 1, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440141', 'bb0e8400-e29b-41d4-a716-446655440052', 'https://cdn.example.com/blouse-side.jpg', 'Side view', 2, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440142', 'bb0e8400-e29b-41d4-a716-446655440052', 'https://cdn.example.com/blouse-detail.jpg', 'Fabric detail', 3, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✓ Business: Fashion Hub
-- ✓ User: phatmenghor20@gmail.com (BUSINESS_OWNER)
-- ✓ Settings: Categories (TRUE) | Subcategories (TRUE) | Brands (TRUE)
-- ✓ Categories: 3 (Men, Women, Kids)
-- ✓ Subcategories: 6 (Shirts, Pants, Shoes under Men; Dresses, Tops, Accessories under Women)
-- ✓ Brands: 3 (Nike, Adidas, Gucci)
-- ✓ Products: 3 (Classic T-Shirt, Athletic Polo, Silk Evening Blouse)
-- ✓ Sizes: 14 (S, M, L, XL, XXL variations)
-- ✓ Customizations: 9 (Custom Color, Embroidery, Gift Wrap, etc.)
-- ✓ Images: 8 (Front, Back, Detail views)
-- ============================================================================
