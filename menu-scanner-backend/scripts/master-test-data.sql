-- ============================================================================
-- COMPREHENSIVE TEST DATA - KHMER E-MENU PLATFORM
-- PostgreSQL Compatible with Correct Schema
-- 3 Main Users + 500 Staff + 20 Categories + 20 Brands + 100 Products
-- 100 Orders with Full Audit Trails
-- ============================================================================

TRUNCATE TABLE order_payments CASCADE;
TRUNCATE TABLE order_status_history CASCADE;
TRUNCATE TABLE order_item_pricing_snapshots CASCADE;
TRUNCATE TABLE order_delivery_options CASCADE;
TRUNCATE TABLE order_delivery_addresses CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE delivery_options CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE brands CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE businesses CASCADE;
TRUNCATE TABLE roles CASCADE;

-- ============================================================================
-- 1. ROLES
-- ============================================================================
INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type) VALUES
('550e8400-e29b-41d4-a716-446655440000', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, 'ADMIN', 'Platform Administrator', NULL, 'PLATFORM'),
('550e8400-e29b-41d4-a716-446655440001', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, 'MANAGER', 'Business Manager', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'BUSINESS'),
('550e8400-e29b-41d4-a716-446655440002', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, 'STAFF', 'Business Staff', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'BUSINESS'),
('550e8400-e29b-41d4-a716-446655440003', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, 'CUSTOMER', 'Customer Role', NULL, 'CUSTOMER');

-- ============================================================================
-- 2. BUSINESS
-- ============================================================================
INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, phone_number, email, address, description) VALUES
('550cad56-cafd-4aba-baef-c4dcd53940d0', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, 'Phatmenghor Business', '+855 23 9999999', 'phatmenghor20@gmail.com', 'Phnom Penh, Cambodia', 'Main business with comprehensive testing');

-- ============================================================================
-- 3. USERS (3 main + 500 staff)
-- ============================================================================
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id) VALUES
('550e8400-e29b-41d4-a716-446655550000', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, 'phatmenghor19@gmail.com', 'phatmenghor19@gmail.com', 'hashed_password_19', 'Platform', 'Admin', '+855 10 100 0001', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200', 'PLATFORM', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0'),
('550e8400-e29b-41d4-a716-446655550001', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, 'phatmenghor20@gmail.com', 'phatmenghor20@gmail.com', 'hashed_password_20', 'Business', 'Manager', '+855 10 200 0001', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200', 'BUSINESS', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0'),
('550e8400-e29b-41d4-a716-446655550002', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, 'phatmenghor21@gmail.com', 'phatmenghor21@gmail.com', 'hashed_password_21', 'Customer', 'User', '+855 10 300 0001', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200', 'CUSTOMER', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0');

-- 500 STAFF MEMBERS
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL,
    'staff' || i::text || '@business.com', 'staff' || i::text || '@business.com', 'hashed_password',
    'Staff_' || i::text, 'User_' || i::text, '+855 10 ' || LPAD((i % 10000000)::text, 7, '0'),
    CASE WHEN (i % 2) = 0 THEN 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce' ELSE 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584' END,
    'BUSINESS', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0'
FROM generate_series(1, 500) AS t(i);

-- ============================================================================
-- 4. CATEGORIES (20)
-- ============================================================================
INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Category ' || i::text,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=400'
FROM generate_series(1, 20) AS t(i);

-- ============================================================================
-- 5. BRANDS (20)
-- ============================================================================
INSERT INTO brands (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, image_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Brand ' || i::text, 'Premium brand number ' || i::text,
    'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=400'
FROM generate_series(1, 20) AS t(i);

-- ============================================================================
-- 6. PRODUCTS (100 - simplified for testing)
-- ============================================================================
INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, category_id, brand_id, name, description, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, has_active_promotion, main_image_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0',
    (SELECT id FROM categories WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0' LIMIT 1),
    (SELECT id FROM brands WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0' LIMIT 1),
    'Product ' || i::text, 'Description for product ' || i::text, (15 + (i % 100))::numeric,
    CASE WHEN (i % 2) = 0 THEN 'PERCENTAGE' ELSE 'NONE' END,
    CASE WHEN (i % 2) = 0 THEN 10 ELSE 0 END,
    NOW(), NOW() + INTERVAL '30 days', (i % 2) = 0,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=400'
FROM generate_series(1, 100) AS t(i);

-- ============================================================================
-- 7. DELIVERY OPTIONS (5)
-- ============================================================================
INSERT INTO delivery_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, price, image_url) VALUES
('d1', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Pickup', 'Quick pickup', 0.00, 'https://example.com/pickup.jpg'),
('d2', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Standard', 'Standard delivery', 2.00, 'https://example.com/standard.jpg'),
('d3', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Express', 'Express delivery', 5.00, 'https://example.com/express.jpg'),
('d4', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Same Day', 'Same day delivery', 3.50, 'https://example.com/sameday.jpg'),
('d5', 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Door Step', 'Door step delivery', 1.50, 'https://example.com/doorstep.jpg');

-- ============================================================================
-- 8. ORDERS (100 WEB + 100 POS = 200 total)
-- ============================================================================
INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_status, source, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, had_order_level_change_from_pos, order_level_change_reason)
SELECT
    gen_random_uuid(), 0, NOW() - (random() * 90)::int * INTERVAL '1 day', NOW() - (random() * 90)::int * INTERVAL '1 day', 'system', NULL, false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0', '550e8400-e29b-41d4-a716-446655550002',
    'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-WEB-' || LPAD(i::text, 4, '0'),
    CASE WHEN (i % 5) = 0 THEN 'PENDING' WHEN (i % 5) = 1 THEN 'CONFIRMED' WHEN (i % 5) = 2 THEN 'PREPARING' WHEN (i % 5) = 3 THEN 'COMPLETED' ELSE 'CANCELLED' END,
    'WEB', (50 + (i % 100))::numeric, CASE WHEN (i % 8) = 0 THEN 5::numeric ELSE 0::numeric END, 2::numeric, 5::numeric,
    (50 + (i % 100) - CASE WHEN (i % 8) = 0 THEN 5::numeric ELSE 0::numeric END + 2::numeric + 5::numeric)::numeric,
    'CARD', CASE WHEN (i % 5) IN (3,4) THEN 'PAID' ELSE 'PENDING' END,
    'Note ' || i::text, 'Processing ' || i::text, (i % 8) = 0, CASE WHEN (i % 8) = 0 THEN 'Discount applied' ELSE 'No changes' END
FROM generate_series(1, 100) AS t(i);

-- POS ORDERS
INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_status, source, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, had_order_level_change_from_pos, order_level_change_reason)
SELECT
    gen_random_uuid(), 0, NOW() - (random() * 90)::int * INTERVAL '1 day', NOW() - (random() * 90)::int * INTERVAL '1 day', 'system', NULL, false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0', CASE WHEN (i % 3) = 0 THEN '550e8400-e29b-41d4-a716-446655550002' ELSE NULL END,
    'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-POS-' || LPAD(i::text, 4, '0'),
    'COMPLETED', 'POS', (45 + (i % 100))::numeric, CASE WHEN (i % 5) = 0 THEN 3::numeric ELSE 0::numeric END, 0::numeric, 4::numeric,
    (45 + (i % 100) - CASE WHEN (i % 5) = 0 THEN 3::numeric ELSE 0::numeric END + 4::numeric)::numeric,
    'CASH', 'PAID', 'POS ' || i::text, 'Admin order ' || i::text, (i % 5) = 0, CASE WHEN (i % 5) = 0 THEN 'Override' ELSE 'None' END
FROM generate_series(1, 100) AS t(i);

-- ============================================================================
-- 9. ORDER DELIVERY ADDRESSES (for each order)
-- ============================================================================
INSERT INTO order_delivery_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, village, commune, district, province, street_number, house_number, note, latitude, longitude)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL,
    id, 'Village ' || (ROW_NUMBER() OVER() % 50)::text, 'Commune ' || (ROW_NUMBER() OVER() % 25)::text,
    'District ' || (ROW_NUMBER() OVER() % 12)::text, 'Phnom Penh', LPAD((ROW_NUMBER() OVER() % 500)::text, 3, '0'),
    'Building ' || CHR(65 + (ROW_NUMBER() OVER() % 26)), 'Delivery note ' || (ROW_NUMBER() OVER())::text,
    11.5564::numeric, 104.9282::numeric
FROM orders;

-- ============================================================================
-- 10. ORDER DELIVERY OPTIONS (for each order)
-- ============================================================================
INSERT INTO order_delivery_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, name, description, image_url, price)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL,
    id,
    CASE WHEN (ROW_NUMBER() OVER() % 3) = 0 THEN 'Pickup' WHEN (ROW_NUMBER() OVER() % 3) = 1 THEN 'Standard' ELSE 'Express' END,
    'Delivery option',  'https://example.com/delivery.jpg',
    CASE WHEN (ROW_NUMBER() OVER() % 3) = 0 THEN 0.00 WHEN (ROW_NUMBER() OVER() % 3) = 1 THEN 2.00 ELSE 5.00 END
FROM orders;

-- ============================================================================
-- 11. ORDER ITEMS (3 per order = 600 items)
-- ============================================================================
INSERT INTO order_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, product_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, quantity, total_price, special_instructions, had_change_from_pos, change_reason)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL,
    o.id, (SELECT id FROM products LIMIT 1), 'Product',  'https://example.com/product.jpg',
    'Medium', 20::numeric, CASE WHEN (t.item_num % 3) = 0 THEN 18::numeric ELSE 20::numeric END, 20::numeric,
    (t.item_num % 3) = 0, CASE WHEN (t.item_num % 3) = 0 THEN 'PERCENTAGE' ELSE 'NONE' END, CASE WHEN (t.item_num % 3) = 0 THEN 10 ELSE 0 END,
    2, CASE WHEN (t.item_num % 3) = 0 THEN 36::numeric ELSE 40::numeric END,
    'Special notes', false, 'No changes'
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn FROM orders) o
CROSS JOIN (SELECT 1 as item_num UNION SELECT 2 UNION SELECT 3) t;

-- ============================================================================
-- 12. ORDER ITEM PRICING SNAPSHOTS
-- ============================================================================
INSERT INTO order_item_pricing_snapshots (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_item_id, before_current_price, before_final_price, before_has_active_promotion, before_discount_amount, before_total_price, before_promotion_type, before_promotion_value, before_promotion_from_date, before_promotion_to_date, after_current_price, after_final_price, after_has_active_promotion, after_discount_amount, after_total_price, after_promotion_type, after_promotion_value, after_promotion_from_date, after_promotion_to_date)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', NULL, false, NULL, NULL,
    id, current_price, final_price, has_promotion, (current_price - final_price)::numeric, total_price,
    CASE WHEN has_promotion THEN 'PERCENTAGE' ELSE 'NONE' END, CASE WHEN has_promotion THEN 10 ELSE 0 END, NOW(), NOW() + INTERVAL '30 days',
    current_price, final_price, has_promotion, (current_price - final_price)::numeric, total_price,
    CASE WHEN has_promotion THEN 'PERCENTAGE' ELSE 'NONE' END, CASE WHEN has_promotion THEN 10 ELSE 0 END, NOW(), NOW() + INTERVAL '30 days'
FROM order_items;

-- ============================================================================
-- 13. ORDER STATUS HISTORY
-- ============================================================================
INSERT INTO order_status_history (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, order_status, changed_by_user_id, changed_by_name, note)
SELECT
    gen_random_uuid(), 0, created_at, created_at, 'system', NULL, false, NULL, NULL,
    id, order_status, '550e8400-e29b-41d4-a716-446655550001', 'Admin', 'Status: ' || order_status
FROM orders;

-- ============================================================================
-- 14. ORDER PAYMENTS
-- ============================================================================
INSERT INTO order_payments (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, order_id, payment_reference, status, payment_method, subtotal, discount_amount, delivery_fee, tax_amount, total_amount)
SELECT
    gen_random_uuid(), 0, created_at, created_at, 'system', NULL, false, NULL, NULL,
    business_id, id, 'PAY-' || SUBSTRING(id::text, 1, 8), payment_status, payment_method,
    subtotal, discount_amount, delivery_fee, tax_amount, total_amount
FROM orders;

-- ============================================================================
-- SUMMARY
-- ============================================================================
SELECT '✅ TEST DATA LOADED!' AS status;
SELECT '👥 3 Users + 500 Staff' AS users;
SELECT '📦 100 Products + 20 Categories + 20 Brands' AS products;
SELECT '📋 200 Orders (100 WEB + 100 POS)' AS orders;
SELECT '🛒 600 Order Items' AS items;
SELECT '✨ All audit trail fields populated' AS audit;
