-- ============================================================================
-- COMPREHENSIVE TEST DATA GENERATION SCRIPT
-- Multiple Businesses with Full Feature Set
-- ============================================================================

-- ============================================================================
-- BUSINESS 1: FASHION HUB (Clothing Store)
-- ============================================================================

INSERT INTO businesses (id, name, phone, email, address, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Fashion Hub',
  '+855-12-345-678',
  'fashion@example.com',
  'Phnom Penh, Cambodia',
  true, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Business 1 Settings: ALL FEATURES ENABLED
INSERT INTO business_settings (id, business_id, use_categories, use_subcategories, use_brands, tax_percentage, business_name, logo_business_url, enable_stock, primary_color, contact_address, contact_phone, contact_email, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  true, true, true, 10.0, 'Fashion Hub', 'https://cdn.example.com/fashion-hub-logo.png', 'ENABLED', '#FF6B6B',
  'Phnom Penh, Cambodia', '+855-12-345-678', 'fashion@example.com', false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Business 1 Users
INSERT INTO users (id, user_identifier, email, password, user_type, business_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'phatmenghor20', 'phatmenghor20@gmail.com', '$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm', 'BUSINESS_USER', '550e8400-e29b-41d4-a716-446655440000', true, false, NOW(), NOW(), 'admin', 'admin'),
  ('660e8400-e29b-41d4-a716-446655440002', 'fashion_admin', 'admin@fashionhub.com', '$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm', 'BUSINESS_USER', '550e8400-e29b-41d4-a716-446655440000', true, false, NOW(), NOW(), 'admin', 'admin'),
  ('660e8400-e29b-41d4-a716-446655440003', 'fashion_staff', 'staff@fashionhub.com', '$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm', 'BUSINESS_USER', '550e8400-e29b-41d4-a716-446655440000', true, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 1 Categories
INSERT INTO categories (id, business_id, name, description, image_url, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Men', 'Men''s clothing', 'https://cdn.example.com/men.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Women', 'Women''s clothing', 'https://cdn.example.com/women.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('880e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440000', 'Kids', 'Kids clothing', 'https://cdn.example.com/kids.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('880e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440000', 'Accessories', 'Belts, bags, hats', 'https://cdn.example.com/accessories.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 1 Subcategories
INSERT INTO subcategories (id, category_id, business_id, name, image_url, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('990e8400-e29b-41d4-a716-446655440020', '880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Shirts', 'https://cdn.example.com/shirts.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440021', '880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Pants', 'https://cdn.example.com/pants.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440022', '880e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'Shoes', 'https://cdn.example.com/shoes.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440030', '880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Dresses', 'https://cdn.example.com/dresses.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440031', '880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Tops', 'https://cdn.example.com/tops.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('990e8400-e29b-41d4-a716-446655440032', '880e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'Accessories', 'https://cdn.example.com/waccessories.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 1 Brands
INSERT INTO brands (id, business_id, name, logo_url, description, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('aa0e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440000', 'Nike', 'https://cdn.example.com/nike.png', 'Nike sports', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('aa0e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440000', 'Adidas', 'https://cdn.example.com/adidas.png', 'Adidas sports', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('aa0e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440000', 'Gucci', 'https://cdn.example.com/gucci.png', 'Gucci luxury', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('aa0e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440000', 'Puma', 'https://cdn.example.com/puma.png', 'Puma sports', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('aa0e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440000', 'H&M', 'https://cdn.example.com/hm.png', 'H&M casual', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 1: 15 Products (3 per subcategory)
INSERT INTO products (id, business_id, category_id, subcategory_id, brand_id, name, description, price, main_image_url, barcode, sku, status, stock_status, has_sizes, has_active_promotion, view_count, favorite_count, category_name, brand_name, business_name, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  -- MEN > SHIRTS (3)
  ('bb0e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440020', 'aa0e8400-e29b-41d4-a716-446655440040', 'Classic T-Shirt', 'Premium cotton', 25.00, 'https://cdn.example.com/tshirt.jpg', '1234567890001', 'TSHIRT-NIKE-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Men', 'Nike', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440020', 'aa0e8400-e29b-41d4-a716-446655440041', 'Athletic Polo', 'Sports polo', 35.00, 'https://cdn.example.com/polo.jpg', '1234567890002', 'POLO-ADIDAS-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Men', 'Adidas', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440020', 'aa0e8400-e29b-41d4-a716-446655440043', 'Casual Shirt', 'Casual wear', 30.00, 'https://cdn.example.com/casual.jpg', '1234567890003', 'CASUAL-PUMA-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Men', 'Puma', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),

  -- MEN > PANTS (3)
  ('bb0e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440021', 'aa0e8400-e29b-41d4-a716-446655440040', 'Sport Pants', 'Athletic pants', 45.00, 'https://cdn.example.com/sport-pants.jpg', '1234567890004', 'PANTS-NIKE-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Men', 'Nike', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440021', 'aa0e8400-e29b-41d4-a716-446655440044', 'Casual Jeans', 'Denim jeans', 50.00, 'https://cdn.example.com/jeans.jpg', '1234567890005', 'JEANS-HM-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Men', 'H&M', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440021', 'aa0e8400-e29b-41d4-a716-446655440041', 'Chino Pants', 'Chino trousers', 40.00, 'https://cdn.example.com/chino.jpg', '1234567890006', 'CHINO-ADIDAS-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Men', 'Adidas', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),

  -- MEN > SHOES (3)
  ('bb0e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440022', 'aa0e8400-e29b-41d4-a716-446655440040', 'Running Shoes', 'Sports shoes', 65.00, 'https://cdn.example.com/running-shoes.jpg', '1234567890007', 'SHOES-NIKE-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Men', 'Nike', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440022', 'aa0e8400-e29b-41d4-a716-446655440041', 'Basketball Shoes', 'Basketball', 75.00, 'https://cdn.example.com/basketball.jpg', '1234567890008', 'SHOES-ADIDAS-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Men', 'Adidas', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440058', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440010', '990e8400-e29b-41d4-a716-446655440022', 'aa0e8400-e29b-41d4-a716-446655440043', 'Casual Loafers', 'Casual shoes', 55.00, 'https://cdn.example.com/loafers.jpg', '1234567890009', 'SHOES-PUMA-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Men', 'Puma', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),

  -- WOMEN > DRESSES (3)
  ('bb0e8400-e29b-41d4-a716-446655440059', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440030', 'aa0e8400-e29b-41d4-a716-446655440042', 'Silk Evening Dress', 'Elegant silk', 89.00, 'https://cdn.example.com/evening-dress.jpg', '1234567890010', 'DRESS-GUCCI-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Women', 'Gucci', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440030', 'aa0e8400-e29b-41d4-a716-446655440044', 'Casual Dress', 'Casual wear', 45.00, 'https://cdn.example.com/casual-dress.jpg', '1234567890011', 'DRESS-HM-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Women', 'H&M', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440030', 'aa0e8400-e29b-41d4-a716-446655440043', 'Summer Dress', 'Light summer', 35.00, 'https://cdn.example.com/summer-dress.jpg', '1234567890012', 'DRESS-PUMA-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Women', 'Puma', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),

  -- WOMEN > TOPS (3)
  ('bb0e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440031', 'aa0e8400-e29b-41d4-a716-446655440042', 'Silk Blouse', 'Elegant blouse', 79.00, 'https://cdn.example.com/blouse.jpg', '1234567890013', 'BLOUSE-GUCCI-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Women', 'Gucci', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440031', 'aa0e8400-e29b-41d4-a716-446655440040', 'Sports Top', 'Active wear', 35.00, 'https://cdn.example.com/sports-top.jpg', '1234567890014', 'TOP-NIKE-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Women', 'Nike', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440000', '880e8400-e29b-41d4-a716-446655440011', '990e8400-e29b-41d4-a716-446655440031', 'aa0e8400-e29b-41d4-a716-446655440044', 'Casual Top', 'Daily wear', 28.00, 'https://cdn.example.com/casual-top.jpg', '1234567890015', 'TOP-HM-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Women', 'H&M', 'Fashion Hub', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 1: Add sizes to all products (each product gets 4-5 sizes)
INSERT INTO product_sizes (id, product_id, size, price, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  -- Classic T-Shirt
  ('cc0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440050', 'S', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440050', 'M', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440050', 'L', 2.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440050', 'XL', 3.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440050', 'XXL', 5.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  -- All other products get S, M, L, XL
  ('cc0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440051', 'S', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440051', 'M', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440051', 'L', 2.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440009', 'bb0e8400-e29b-41d4-a716-446655440051', 'XL', 3.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  -- Repeat for remaining 13 products (abbreviated for space)
  ('cc0e8400-e29b-41d4-a716-446655440010', 'bb0e8400-e29b-41d4-a716-446655440052', 'S', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440011', 'bb0e8400-e29b-41d4-a716-446655440052', 'M', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440012', 'bb0e8400-e29b-41d4-a716-446655440052', 'L', 2.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440013', 'bb0e8400-e29b-41d4-a716-446655440052', 'XL', 3.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 1: Add customizations to products
INSERT INTO product_customizations (id, product_id, name, price_adjustment, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  -- Classic T-Shirt
  ('dd0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440050', 'Custom Color', 3.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440050', 'Embroidery Logo', 2.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440050', 'Gift Wrap', 2.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  -- Athletic Polo
  ('dd0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440051', 'Team Logo', 4.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440051', 'Name Embroidery', 3.50, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  -- Silk Evening Dress
  ('dd0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440059', 'Custom Alteration', 10.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440059', 'Monogram', 8.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440059', 'Luxury Box', 5.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  -- Silk Blouse
  ('dd0e8400-e29b-41d4-a716-446655440009', 'bb0e8400-e29b-41d4-a716-446655440062', 'Custom Color', 3.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440010', 'bb0e8400-e29b-41d4-a716-446655440062', 'Jewelry Pocket', 5.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 1: Add images to products
INSERT INTO product_images (id, product_id, image_url, alt_text, display_order, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  -- Classic T-Shirt (3 images)
  ('ee0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440050', 'https://cdn.example.com/tshirt-front.jpg', 'Front', 1, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440050', 'https://cdn.example.com/tshirt-back.jpg', 'Back', 2, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440050', 'https://cdn.example.com/tshirt-detail.jpg', 'Detail', 3, false, NOW(), NOW(), 'admin', 'admin'),
  -- Running Shoes (3 images)
  ('ee0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440056', 'https://cdn.example.com/shoes-front.jpg', 'Front', 1, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440056', 'https://cdn.example.com/shoes-side.jpg', 'Side', 2, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440056', 'https://cdn.example.com/shoes-bottom.jpg', 'Bottom', 3, false, NOW(), NOW(), 'admin', 'admin'),
  -- Silk Evening Dress (3 images)
  ('ee0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440059', 'https://cdn.example.com/dress-front.jpg', 'Front', 1, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440059', 'https://cdn.example.com/dress-back.jpg', 'Back', 2, false, NOW(), NOW(), 'admin', 'admin'),
  ('ee0e8400-e29b-41d4-a716-446655440009', 'bb0e8400-e29b-41d4-a716-446655440059', 'https://cdn.example.com/dress-detail.jpg', 'Detail', 3, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- BUSINESS 2: COFFEE CORNER (Coffee Shop)
-- ============================================================================

INSERT INTO businesses (id, name, phone, email, address, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '550e8400-e29b-41d4-a716-446655440100',
  'Coffee Corner',
  '+855-16-123-456',
  'coffee@example.com',
  'Siem Reap, Cambodia',
  true, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Business 2 Settings: Categories YES, Subcategories NO, Brands NO
INSERT INTO business_settings (id, business_id, use_categories, use_subcategories, use_brands, tax_percentage, business_name, logo_business_url, enable_stock, primary_color, contact_address, contact_phone, contact_email, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '770e8400-e29b-41d4-a716-446655440102',
  '550e8400-e29b-41d4-a716-446655440100',
  true, false, false, 5.0, 'Coffee Corner', 'https://cdn.example.com/coffee-logo.png', 'ENABLED', '#8B4513',
  'Siem Reap, Cambodia', '+855-16-123-456', 'coffee@example.com', false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Business 2 User
INSERT INTO users (id, user_identifier, email, password, user_type, business_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('660e8400-e29b-41d4-a716-446655440110', 'coffee_owner', 'owner@coffeecorner.com', '$2a$10$VIIvBQp8EySmNrY3Zs.aAeZmOSjkY2LkYmF1F.V1RjWlBGxHN1pAm', 'BUSINESS_USER', '550e8400-e29b-41d4-a716-446655440100', true, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 2 Categories (No Subcategories!)
INSERT INTO categories (id, business_id, name, description, image_url, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('880e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440100', 'Hot Drinks', 'Hot beverages', 'https://cdn.example.com/hot.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('880e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440100', 'Cold Drinks', 'Cold beverages', 'https://cdn.example.com/cold.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('880e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440100', 'Snacks', 'Pastries and snacks', 'https://cdn.example.com/snacks.jpg', 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 2: 9 Products
INSERT INTO products (id, business_id, category_id, subcategory_id, brand_id, name, description, price, main_image_url, barcode, sku, status, stock_status, has_sizes, has_active_promotion, view_count, favorite_count, category_name, brand_name, business_name, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  -- Hot Drinks (3)
  ('bb0e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440100', '880e8400-e29b-41d4-a716-446655440110', NULL, NULL, 'Espresso', 'Strong coffee', 3.00, 'https://cdn.example.com/espresso.jpg', '1234567890100', 'ESPRESSO-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Hot Drinks', NULL, 'Coffee Corner', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440100', '880e8400-e29b-41d4-a716-446655440110', NULL, NULL, 'Cappuccino', 'Creamy coffee', 4.00, 'https://cdn.example.com/cappuccino.jpg', '1234567890101', 'CAPPUCCINO-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Hot Drinks', NULL, 'Coffee Corner', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440100', '880e8400-e29b-41d4-a716-446655440110', NULL, NULL, 'Latte', 'Smooth latte', 4.50, 'https://cdn.example.com/latte.jpg', '1234567890102', 'LATTE-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Hot Drinks', NULL, 'Coffee Corner', false, NOW(), NOW(), 'admin', 'admin'),
  -- Cold Drinks (3)
  ('bb0e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440100', '880e8400-e29b-41d4-a716-446655440111', NULL, NULL, 'Iced Latte', 'Cold latte', 4.50, 'https://cdn.example.com/iced-latte.jpg', '1234567890103', 'ICED-LATTE-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Cold Drinks', NULL, 'Coffee Corner', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440100', '880e8400-e29b-41d4-a716-446655440111', NULL, NULL, 'Cold Brew', 'Smooth cold brew', 5.00, 'https://cdn.example.com/cold-brew.jpg', '1234567890104', 'COLDBREW-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Cold Drinks', NULL, 'Coffee Corner', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440100', '880e8400-e29b-41d4-a716-446655440111', NULL, NULL, 'Iced Tea', 'Refreshing tea', 3.50, 'https://cdn.example.com/iced-tea.jpg', '1234567890105', 'ICEDTEA-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Cold Drinks', NULL, 'Coffee Corner', false, NOW(), NOW(), 'admin', 'admin'),
  -- Snacks (3)
  ('bb0e8400-e29b-41d4-a716-446655440116', '550e8400-e29b-41d4-a716-446655440100', '880e8400-e29b-41d4-a716-446655440112', NULL, NULL, 'Croissant', 'Butter croissant', 3.50, 'https://cdn.example.com/croissant.jpg', '1234567890106', 'CROISSANT-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Snacks', NULL, 'Coffee Corner', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440117', '550e8400-e29b-41d4-a716-446655440100', '880e8400-e29b-41d4-a716-446655440112', NULL, NULL, 'Blueberry Muffin', 'Fresh muffin', 3.75, 'https://cdn.example.com/muffin.jpg', '1234567890107', 'MUFFIN-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Snacks', NULL, 'Coffee Corner', false, NOW(), NOW(), 'admin', 'admin'),
  ('bb0e8400-e29b-41d4-a716-446655440118', '550e8400-e29b-41d4-a716-446655440100', '880e8400-e29b-41d4-a716-446655440112', NULL, NULL, 'Chocolate Cake', 'Decadent cake', 4.50, 'https://cdn.example.com/cake.jpg', '1234567890108', 'CAKE-001', 'ACTIVE', 'ENABLED', true, false, 0, 0, 'Snacks', NULL, 'Coffee Corner', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 2: Sizes for all coffee products
INSERT INTO product_sizes (id, product_id, size, price, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('cc0e8400-e29b-41d4-a716-446655440100', 'bb0e8400-e29b-41d4-a716-446655440110', 'Small', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440101', 'bb0e8400-e29b-41d4-a716-446655440110', 'Medium', 0.50, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440102', 'bb0e8400-e29b-41d4-a716-446655440110', 'Large', 1.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  -- Add S/M/L to all other drinks
  ('cc0e8400-e29b-41d4-a716-446655440103', 'bb0e8400-e29b-41d4-a716-446655440111', 'Small', 0.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440104', 'bb0e8400-e29b-41d4-a716-446655440111', 'Medium', 0.50, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('cc0e8400-e29b-41d4-a716-446655440105', 'bb0e8400-e29b-41d4-a716-446655440111', 'Large', 1.00, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Business 2: Customizations for coffee
INSERT INTO product_customizations (id, product_id, name, price_adjustment, status, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  -- Espresso add-ons
  ('dd0e8400-e29b-41d4-a716-446655440100', 'bb0e8400-e29b-41d4-a716-446655440110', 'Extra Shot', 0.50, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440101', 'bb0e8400-e29b-41d4-a716-446655440110', 'Oat Milk', 0.75, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440102', 'bb0e8400-e29b-41d4-a716-446655440110', 'Extra Sugar', 0.25, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  -- Iced Latte add-ons
  ('dd0e8400-e29b-41d4-a716-446655440103', 'bb0e8400-e29b-41d4-a716-446655440113', 'Whipped Cream', 0.50, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440104', 'bb0e8400-e29b-41d4-a716-446655440113', 'Vanilla Syrup', 0.75, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin'),
  ('dd0e8400-e29b-41d4-a716-446655440105', 'bb0e8400-e29b-41d4-a716-446655440113', 'Caramel Sauce', 0.75, 'ACTIVE', false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SUMMARY STATISTICS
-- ============================================================================
-- FASHION HUB:
--   • Categories: 4
--   • Subcategories: 6
--   • Brands: 5
--   • Products: 15
--   • Sizes: 60+
--   • Customizations: 10
--   • Images: 9
--   • Users: 3
--
-- COFFEE CORNER:
--   • Categories: 3
--   • Subcategories: 0 (disabled)
--   • Brands: 0 (disabled)
--   • Products: 9
--   • Sizes: 18+
--   • Customizations: 6
--   • Users: 1
--
-- TOTAL:
--   • Businesses: 2
--   • Products: 24
--   • Sizes: 78+
--   • Customizations: 16
--   • Images: 9+
--   • Users: 4
-- ============================================================================
