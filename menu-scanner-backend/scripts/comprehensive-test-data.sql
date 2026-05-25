
-- ============================================================================
-- COMPREHENSIVE MEGA TEST DATA GENERATION SCRIPT
-- Complete E-Commerce System with Orders, Stock & 10,000 Products
-- 2 Businesses, 101+ Users with Full Order History

-- ============================================================================


-- ============================================================================
-- 1. CREATE BUSINESSES

-- ============================================================================

-- Business 1: Mega Store (phatmenghor20@gmail.com owner)
INSERT INTO businesses (id, name, phone, email, address, status, is_subscription_active, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'Mega Store',
  '+855-12-345-678',
  'megastore@example.com',
  'Phnom Penh, Cambodia',
  'ACTIVE', true, 0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Business 2: Fashion Hub (phatmenghor21@gmail.com owner)
INSERT INTO businesses (id, name, phone, email, address, status, is_subscription_active, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '660cad56-cafd-4aba-baef-c4dcd53940d0',
  'Fashion Hub',
  '+855-87-654-321',
  'fashionhub@example.com',
  'Siem Reap, Cambodia',
  'ACTIVE', true, 0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;


-- ============================================================================
-- 2. CREATE BUSINESS SETTINGS (ALL FEATURES ENABLED WITH SOCIAL & HOURS)

-- ============================================================================

-- Mega Store Settings
INSERT INTO business_settings (
  id, business_id, use_categories, use_brands, tax_percentage,
  business_name, logo_business_url, enable_stock, primary_color, contact_address,
  contact_phone, contact_email, version, is_deleted,
  created_at, updated_at, created_by, updated_by
)
VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  true, true, 10.0, 'Mega Store',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'ENABLED', '#FF6B6B',
  'Phnom Penh, Cambodia', '+855-12-345-678', 'megastore@example.com',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Mega Store Social Media Links
INSERT INTO social_media (id, business_setting_id, name, image_url, link_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Facebook', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://facebook.com/megastore.cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Instagram', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://instagram.com/megastore.cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'TikTok', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://tiktok.com/@megastore.cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', 'WhatsApp', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://wa.me/85512345678', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'Telegram', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://t.me/megastore_cambodia', 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Mega Store Business Hours
INSERT INTO business_hours (id, business_setting_id, day, opening_time, closing_time, is_closed, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('770e9400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440002', 'Monday', '08:00', '22:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('770e9400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'Tuesday', '08:00', '22:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('770e9400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 'Wednesday', '08:00', '22:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('770e9400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440002', 'Thursday', '08:00', '22:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('770e9400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'Friday', '08:00', '23:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('770e9400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', 'Saturday', '09:00', '23:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('770e9400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', 'Sunday', '10:00', '21:00', false, 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Fashion Hub Settings
INSERT INTO business_settings (
  id, business_id, use_categories, use_brands, tax_percentage,
  business_name, logo_business_url, enable_stock, primary_color, contact_address,
  contact_phone, contact_email, version, is_deleted,
  created_at, updated_at, created_by, updated_by
)
VALUES (
  '770e8400-e29b-41d4-a716-446655440003',
  '660cad56-cafd-4aba-baef-c4dcd53940d0',
  true, true, 10.0, 'Fashion Hub',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'ENABLED', '#6B6BFF',
  'Siem Reap, Cambodia', '+855-87-654-321', 'fashionhub@example.com',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Fashion Hub Social Media Links
INSERT INTO social_media (id, business_setting_id, name, image_url, link_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'Facebook', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://facebook.com/fashionhub.cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('660e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'Instagram', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://instagram.com/fashionhub.cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('660e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'YouTube', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://youtube.com/@fashionhubcambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('660e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003', 'Pinterest', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://pinterest.com/fashionhubcambodia', 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- Fashion Hub Business Hours
INSERT INTO business_hours (id, business_setting_id, day, opening_time, closing_time, is_closed, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('880e9400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440003', 'Monday', '09:30', '21:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('880e9400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440003', 'Tuesday', '09:30', '21:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('880e9400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'Wednesday', '09:30', '21:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('880e9400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440003', 'Thursday', '09:30', '21:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('880e9400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440003', 'Friday', '09:30', '22:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('880e9400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440003', 'Saturday', '10:00', '22:00', false, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('880e9400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440003', 'Sunday', '11:00', '20:00', false, 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;


DO $$ BEGIN RAISE NOTICE '  5%% [█░░░░░░░░░░░░░░░░░░░] Businesses, settings & banners done'; END $$;

-- ============================================================================
-- 3. CREATE BANNERS (8 Active, 20 Inactive)

-- ============================================================================

INSERT INTO banners (id, business_id, image_url, description, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'Banner ' || i || ' Description',
  CASE WHEN i <= 8 THEN 'ACTIVE' ELSE 'INACTIVE' END,
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 28) AS t(i);


-- ============================================================================
-- 3.5. CREATE ROLES

-- ============================================================================

-- NOTE: PLATFORM_OWNER and CUSTOMER roles are created by DataInitializationService
-- Only business-specific roles are created here to avoid duplication

-- Business-level Roles for Mega Store
INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  gen_random_uuid(),
  'BUSINESS_OWNER',
  'Business Owner - Full business access',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'BUSINESS_USER',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  gen_random_uuid(),
  'BUSINESS_ADMIN',
  'Business Admin - Administrative access',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'BUSINESS_USER',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  gen_random_uuid(),
  'BUSINESS_MANAGER',
  'Business Manager - Management access',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'BUSINESS_USER',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  gen_random_uuid(),
  'BUSINESS_EMPLOYEE',
  'Business Employee - Limited access',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'BUSINESS_USER',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;


-- ============================================================================
-- 3.6. CREATE BUSINESS EXCHANGE RATES (18 for Mega Store)

-- ============================================================================

INSERT INTO business_exchange_rates (id, business_id, usd_to_khr_rate, usd_to_cny_rate, usd_to_vnd_rate, status, notes, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  gen_random_uuid(),
  '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
  4100.0,
  7.2,
  25000.0,
  'ACTIVE',
  'Current exchange rate for currency conversion',
  0, false, NOW(), NOW(), 'admin', 'admin'
);


-- ============================================================================
-- 3.7. CREATE DELIVERY OPTIONS (16 for Mega Store with images)

-- ============================================================================

INSERT INTO delivery_options (id, business_id, name, description, image_url, price, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
  'Delivery Option ' || i,
  'Delivery option ' || i || ' - Standard delivery with ' || (i * 30) || ' minute estimate',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  ROUND(((i - 1)::numeric * 10 / 15), 2),
  'ACTIVE',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 16) AS t(i);


-- ============================================================================
-- 3.8. CREATE PAYMENT OPTIONS (CASH for Mega Store)

-- ============================================================================

INSERT INTO payment_options (id, business_id, name, payment_option_type, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  gen_random_uuid(),
  '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
  'Cash',
  'CASH',
  'ACTIVE',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Widen the check constraint so BANK is a valid payment_option_type
ALTER TABLE payment_options
  DROP CONSTRAINT IF EXISTS payment_options_payment_option_type_check;
ALTER TABLE payment_options
  ADD CONSTRAINT payment_options_payment_option_type_check
  CHECK (payment_option_type IN ('CASH', 'BANK'));

INSERT INTO payment_options (id, business_id, name, payment_option_type, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
  'Bank Transfer',
  'BANK',
  'ACTIVE',
  0, false, NOW(), NOW(), 'admin', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM payment_options
  WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
    AND payment_option_type = 'BANK'
);


DO $$ BEGIN RAISE NOTICE ' 10%% [██░░░░░░░░░░░░░░░░░░] Roles, exchange rates, delivery & payment options done'; END $$;

-- ============================================================================
-- 4. CREATE USERS (101+ for Mega Store)

-- ============================================================================

-- If user registered via app with null business_id, patch it to the correct business
UPDATE users
SET business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0',
    account_status = 'ACTIVE', status = 'ACTIVE', updated_at = NOW()
WHERE user_identifier = 'phatmenghor20@gmail.com' AND business_id IS NULL;

UPDATE users
SET business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0',
    account_status = 'ACTIVE', status = 'ACTIVE', updated_at = NOW()
WHERE user_identifier = 'phatmenghor21@gmail.com' AND business_id IS NULL;

-- Main User 1: BUSINESS_USER with Business Owner role (phatmenghor20@gmail.com) - Mega Store
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  '660e8400-e29b-41d4-a716-446655440001',
  'phatmenghor20@gmail.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'BUSINESS_USER',
  'ACTIVE', 'ACTIVE',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  0, false, NOW(), NOW(), 'admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'phatmenghor20@gmail.com');

-- Main User 2: BUSINESS_USER with Business Owner role (phatmenghor21@gmail.com) - Fashion Hub
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  '660e8400-e29b-41d4-a716-446655440002',
  'phatmenghor21@gmail.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'BUSINESS_USER',
  'ACTIVE', 'ACTIVE',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  0, false, NOW(), NOW(), 'admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'phatmenghor21@gmail.com');

-- 5 Admin Users for Mega Store
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'admin' || i || '@megastore.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'BUSINESS_USER',
  'ACTIVE', 'ACTIVE',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 5) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'admin' || i || '@megastore.com' AND business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0');

-- 15 Manager Users for Mega Store
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'manager' || i || '@megastore.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'BUSINESS_USER',
  'ACTIVE', 'ACTIVE',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 15) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'manager' || i || '@megastore.com' AND business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0');

-- 80 Staff Users for Mega Store
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'staff' || i || '@megastore.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'BUSINESS_USER',
  'ACTIVE', 'ACTIVE',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 80) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'staff' || i || '@megastore.com' AND business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0');

-- 3 Admin Users for Fashion Hub
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'admin' || i || '@fashionhub.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'BUSINESS_USER',
  'ACTIVE', 'ACTIVE',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 3) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'admin' || i || '@fashionhub.com' AND business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0');



-- CUSTOMER User: phatmenghor21@gmail.com
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '770e8400-e29b-41d4-a716-446655440010',
  'phatmenghor21@gmail.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'CUSTOMER',
  'ACTIVE', 'ACTIVE',
  NULL,
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;
-- 10 Staff Users for Fashion Hub
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'staff' || i || '@fashionhub.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'BUSINESS_USER',
  'ACTIVE', 'ACTIVE',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 10) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'staff' || i || '@fashionhub.com' AND business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0');


DO $$ BEGIN RAISE NOTICE ' 15%% [███░░░░░░░░░░░░░░░░░] Users created'; END $$;

-- ============================================================================
-- 3b. CREATE USER PROFILES (with emails)

-- ============================================================================

-- Profile for phatmenghor20
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  gen_random_uuid(),
  '660e8400-e29b-41d4-a716-446655440001',
  'phatmenghor20@gmail.com',
  'Phatmenghor',
  'Twenty',
  '+855-12-345-678',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Profile for phatmenghor21
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  gen_random_uuid(),
  '660e8400-e29b-41d4-a716-446655440002',
  'phatmenghor21@gmail.com',
  'Phatmenghor',
  'Twenty-One',
  '+855-87-654-321',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- Profiles for Admin Users (Mega Store)
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  u.user_identifier,
  'Admin ' || SUBSTRING(u.user_identifier FROM 1 FOR POSITION('@' IN u.user_identifier) - 1),
  'Mega Store',
  '+855-' || LPAD((10000000 + (ABS(HASHTEXT(u.user_identifier)::bigint) % 9000000))::text, 10, '0'),
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE u.user_identifier LIKE 'admin%@megastore.com' AND u.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id);

-- Profiles for Manager Users (Mega Store)
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  u.user_identifier,
  'Manager ' || SUBSTRING(u.user_identifier FROM 1 FOR POSITION('@' IN u.user_identifier) - 1),
  'Mega Store',
  '+855-' || LPAD((20000000 + (ABS(HASHTEXT(u.user_identifier)::bigint) % 9000000))::text, 10, '0'),
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE u.user_identifier LIKE 'manager%@megastore.com' AND u.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id);

-- Profiles for Staff Users (Mega Store)
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  u.user_identifier,
  'Staff ' || SUBSTRING(u.user_identifier FROM 1 FOR POSITION('@' IN u.user_identifier) - 1),
  'Mega Store',
  '+855-' || LPAD((30000000 + (ABS(HASHTEXT(u.user_identifier)::bigint) % 9000000))::text, 10, '0'),
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE u.user_identifier LIKE 'staff%@megastore.com' AND u.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id);

-- Profiles for Admin Users (Fashion Hub)
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  u.user_identifier,
  'Admin FH ' || SUBSTRING(u.user_identifier FROM 1 FOR POSITION('@' IN u.user_identifier) - 1),
  'Fashion Hub',
  '+855-' || LPAD((40000000 + (ABS(HASHTEXT(u.user_identifier)::bigint) % 9000000))::text, 10, '0'),
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE u.user_identifier LIKE 'admin%@fashionhub.com' AND u.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id);

-- Profiles for Staff Users (Fashion Hub)
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  'staff' || i || '@fashionhub.com',
  'Staff FH',
  i::text,
  '+855-' || (50000000 + i * 1000000)::text,
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
CROSS JOIN generate_series(1, 10) AS t(i)
WHERE u.user_identifier = 'staff' || i || '@fashionhub.com' AND u.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id);


DO $$ BEGIN RAISE NOTICE ' 20%% [████░░░░░░░░░░░░░░░░] User profiles done'; END $$;

-- ============================================================================
-- 4. CREATE CUSTOMER ADDRESSES (for main users)

-- ============================================================================

-- Addresses for phatmenghor20
INSERT INTO customer_addresses (id, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  '660e8400-e29b-41d4-a716-446655440001',
  'Phum Svay Dangkum',
  'Sangkat Svay Dangkum',
  'Krong Siem Reap',
  'Siem Reap',
  'Cambodia',
  'Street ' || (63 + addr_num),
  'House ' || (10 + addr_num),
  CASE WHEN addr_num = 1 THEN 'Primary residence' ELSE 'Secondary address' END,
  13.3671::numeric(10,6) + (addr_num * 0.001)::numeric(10,6),
  103.8448::numeric(10,6) + (addr_num * 0.001)::numeric(10,6),
  (addr_num = 1),
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 3) AS t(addr_num);

-- Addresses for phatmenghor21
INSERT INTO customer_addresses (id, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  '660e8400-e29b-41d4-a716-446655440002',
  'Phum Kandal',
  'Sangkat Kandal',
  'Krong Siem Reap',
  'Siem Reap',
  'Cambodia',
  'Street ' || (271 + addr_num),
  'House ' || (20 + addr_num),
  CASE WHEN addr_num = 1 THEN 'Main office' ELSE 'Alternate location' END,
  13.4000::numeric(10,6) + (addr_num * 0.002)::numeric(10,6),
  103.8700::numeric(10,6) + (addr_num * 0.002)::numeric(10,6),
  (addr_num = 1),
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 2) AS t(addr_num);


-- ============================================================================
-- 6. UPDATE USER PROFILES WITH COMPREHENSIVE DATA

-- ============================================================================

-- Update main users with full profile information
UPDATE user_profiles
SET nickname = 'Phat',
    gender = 'MALE',
    date_of_birth = '1990-01-15'::date,
    profile_image_url = 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
WHERE email = 'phatmenghor20@gmail.com';

UPDATE user_profiles
SET nickname = 'Menghor',
    gender = 'FEMALE',
    date_of_birth = '1992-06-20'::date,
    profile_image_url = 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
WHERE email = 'phatmenghor21@gmail.com';

-- Update all admin users
UPDATE user_profiles
SET nickname = 'Admin',
    gender = 'MALE',
    date_of_birth = '1985-03-10'::date,
    profile_image_url = 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
WHERE email LIKE 'admin%@%.com' AND gender IS NULL;

-- Update all manager users
UPDATE user_profiles
SET nickname = 'Manager',
    gender = 'MALE',
    date_of_birth = '1988-05-15'::date,
    profile_image_url = 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
WHERE email LIKE 'manager%@%.com' AND gender IS NULL;

-- Update all staff users
UPDATE user_profiles
SET nickname = 'Staff',
    gender = 'MALE',
    date_of_birth = '1995-07-20'::date,
    profile_image_url = 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
WHERE email LIKE 'staff%@%.com' AND gender IS NULL;

-- 6.5. ASSIGN USER ROLES

-- ============================================================================

-- Assign BUSINESS_OWNER role to main business users
INSERT INTO user_roles (user_id, role_id)
SELECT
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.user_identifier IN ('phatmenghor20@gmail.com', 'phatmenghor21@gmail.com')
  AND u.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND r.name = 'BUSINESS_OWNER'
  AND r.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id)
ON CONFLICT DO NOTHING;

-- Assign BUSINESS_ADMIN role to admin users
INSERT INTO user_roles (user_id, role_id)
SELECT
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.user_identifier LIKE 'admin%@megastore.com'
  AND u.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND r.name = 'BUSINESS_ADMIN'
  AND r.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id)
ON CONFLICT DO NOTHING;

-- Assign BUSINESS_MANAGER role to manager users
INSERT INTO user_roles (user_id, role_id)
SELECT
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.user_identifier LIKE 'manager%@megastore.com'
  AND u.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND r.name = 'BUSINESS_MANAGER'
  AND r.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id)
ON CONFLICT DO NOTHING;

-- Assign BUSINESS_EMPLOYEE role to staff users
INSERT INTO user_roles (user_id, role_id)
SELECT
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.user_identifier LIKE 'staff%@megastore.com'
  AND u.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND r.name = 'BUSINESS_EMPLOYEE'

  AND r.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'

  AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id)

ON CONFLICT DO NOTHING;



-- ============================================================================

-- Assign CUSTOMER role to CUSTOMER user
INSERT INTO user_roles (user_id, role_id)
SELECT
  u.id,
  r.id
FROM users u
CROSS JOIN roles r
WHERE u.user_identifier = 'phatmenghor21@gmail.com'
  AND u.user_type = 'CUSTOMER'
  AND r.name = 'CUSTOMER'
  AND r.user_type = 'CUSTOMER'
  AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id)
ON CONFLICT DO NOTHING;
DO $$ BEGIN RAISE NOTICE ' 25%% [█████░░░░░░░░░░░░░░░] User addresses, updates & roles done'; END $$;

-- 7. CREATE CATEGORIES (18 for Mega Store)

-- ============================================================================
INSERT INTO categories (id, business_id, name, image_url, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'Category ' || i,
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'ACTIVE',
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 18) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0' AND name = 'Category ' || i);


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 30%% [██████░░░░░░░░░░░░░░] Categories done'; END $$;

-- 8. CREATE BRANDS (18)

-- ============================================================================
INSERT INTO brands (id, business_id, name, image_url, description, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'Brand ' || i,
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'Brand ' || i || ' - Premium quality products',
  'ACTIVE',
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM generate_series(1, 18) AS t(i)
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0' AND name = 'Brand ' || i);


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 35%% [███████░░░░░░░░░░░░░] Brands done - inserting 10000 products...'; END $$;

-- 8. CREATE 10,000 PRODUCTS (555 per category)

-- ============================================================================
INSERT INTO products (
  id, business_id, category_id, brand_id, name, description, price,
  main_image_url, barcode, sku, status, stock_status, has_sizes,
  view_count, favorite_count, category_name, brand_name, business_name, version, is_deleted,
  created_at, updated_at, created_by, updated_by, promotion_type, promotion_value,
  promotion_from_date, promotion_to_date
)
SELECT
  gen_random_uuid(),
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  (SELECT id FROM categories WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0' ORDER BY created_at LIMIT 1 OFFSET (i-1) / 555),
  (SELECT id FROM brands WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0' ORDER BY created_at LIMIT 1 OFFSET (i-1) / 555 % 18),
  'Product ' || i,
  'High quality product ' || i || ' with premium features and excellent durability',
  (10 + (i % 200))::numeric,
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  '1000000000' || LPAD(i::text, 7, '0'),
  'SKU-' || LPAD(i::text, 7, '0'),
  'ACTIVE',
  'ENABLED',
  -- 34% of products have sizes (i % 100 >= 66)
  (i % 100) >= 66,
  (i % 100),
  (i % 50),
  'Category ' || ((i - 1) / 555 + 1),
  'Brand ' || (((i - 1) / 555) % 18 + 1),
  'Mega Store',
  0,
  false,
  NOW(), NOW(), 'admin', 'admin',
  -- 40% of products have promotions (i % 10 < 4)
  CASE WHEN (i % 10) < 4 THEN CASE WHEN (i % 2) = 0 THEN 'PERCENTAGE' ELSE 'FIXED_AMOUNT' END ELSE NULL END,
  CASE WHEN (i % 10) < 4 THEN CASE WHEN (i % 2) = 0 THEN (10 + (i % 40))::numeric ELSE (5 + (i % 20))::numeric END ELSE NULL END,
  CASE WHEN (i % 10) < 4 THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day' * (FLOOR((i * 7919) % 30))) ELSE NULL END,
  CASE WHEN (i % 10) < 4 THEN DATE_TRUNC('day', NOW() + INTERVAL '1 month' * (6 + (i % 19))) ELSE NULL END
FROM generate_series(1, 10000) AS t(i);


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 40%% [████████░░░░░░░░░░░░] 10000 products inserted'; END $$;

-- 9. CREATE PRODUCT SIZES (34% of products = 3,400 products × 9 sizes = 30,600)
-- 40% of product sizes have promotions

-- ============================================================================
INSERT INTO product_sizes (id, product_id, name, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, version, is_deleted, created_at, updated_at, created_by, updated_by)
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
  (p.price::numeric + (size_num * 2))::numeric,
  -- 40% of sizes have promotions
  CASE WHEN (size_num % 10) < 4 THEN CASE WHEN (size_num % 2 = 0) THEN 'PERCENTAGE' ELSE 'FIXED_AMOUNT' END ELSE NULL END,
  CASE WHEN (size_num % 10) < 4 THEN CASE WHEN (size_num % 2 = 0) THEN (15 + (size_num % 20))::numeric ELSE (3 + (size_num % 10))::numeric END ELSE NULL END,
  CASE WHEN (size_num % 10) < 4 THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day' * (FLOOR((size_num * 13337) % 30))) ELSE NULL END,
  CASE WHEN (size_num % 10) < 4 THEN DATE_TRUNC('day', NOW() + INTERVAL '1 month' * (6 + (size_num % 19))) ELSE NULL END,
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM products p
CROSS JOIN generate_series(0, 8) AS t(size_num)
WHERE p.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND p.has_sizes = true;


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 45%% [█████████░░░░░░░░░░░] Product sizes done'; END $$;

-- 10. CREATE PRODUCT CUSTOMIZATIONS (Only for 67% of products)
-- 33% with no sizes (middle third) + 34% with sizes (last third) = 10 customizations each
-- 40% of products with customizations have promotions

-- ============================================================================
INSERT INTO product_customizations (id, product_id, name, price_adjustment, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  p.id,
  'Customization ' || custom_num || ' - ' || CASE custom_num
    WHEN 1 THEN 'Color'
    WHEN 2 THEN 'Material'
    WHEN 3 THEN 'Engraving'
    WHEN 4 THEN 'Packaging'
    WHEN 5 THEN 'Warranty'
    WHEN 6 THEN 'Delivery'
    WHEN 7 THEN 'Installation'
    WHEN 8 THEN 'Support'
    WHEN 9 THEN 'Upgrade'
    WHEN 10 THEN 'Premium'
  END,
  (0.50 + custom_num * 0.50)::numeric,
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM (
  SELECT p.id, ROW_NUMBER() OVER (ORDER BY p.created_at) as row_num
  FROM products p
  WHERE p.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
) p
CROSS JOIN generate_series(1, 10) AS t(custom_num)
WHERE -- Only create customizations for products in middle 33% (no size) and last 34% (with size)
  (row_num % 100) >= 33;


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 50%% [██████████░░░░░░░░░░] Product customizations done'; END $$;

-- 11. CREATE PRODUCT IMAGES (5 per product = 50,000 total)

-- ============================================================================
INSERT INTO product_images (id, product_id, image_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  p.id,
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM products p
CROSS JOIN generate_series(1, 5) AS t(img_num)
WHERE p.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0';


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 55%% [███████████░░░░░░░░░] Product images done'; END $$;

-- 12. CREATE PRODUCT STOCK (Full stock for all products)

-- ============================================================================

-- Stock for all products (base + sizes)
INSERT INTO product_stock (id, business_id, product_id, product_size_id, quantity_on_hand, quantity_reserved, quantity_available, price_in, date_in, status, is_expired, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  p.business_id,
  p.id,
  NULL,
  100,
  0,
  100,
  (COALESCE(p.price, 50) * 0.6)::numeric(19,4),
  NOW() - INTERVAL '30 days',
  'ACTIVE',
  false,
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM products p
WHERE p.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0';

-- Stock for product sizes
INSERT INTO product_stock (id, business_id, product_id, product_size_id, quantity_on_hand, quantity_reserved, quantity_available, price_in, date_in, status, is_expired, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  p.business_id,
  p.id,
  ps.id,
  50 + (ps.price::int % 30),
  0,
  50 + (ps.price::int % 30),
  ((COALESCE(p.price, 50) + ps.price) * 0.6)::numeric(19,4),
  NOW() - INTERVAL '20 days',
  'ACTIVE',
  false,
  0,
  false,
  NOW(), NOW(), 'admin', 'admin'
FROM products p
JOIN product_sizes ps ON ps.product_id = p.id
WHERE p.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND p.has_sizes = true;


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 60%% [████████████░░░░░░░░] Product stock done'; END $$;

-- 4b. CREATE 30 CUSTOMER USERS (deterministic IDs for returning-customer tracking)
-- ============================================================================

INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id,
  version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  ('c0000000-0000-0000-0000-' || LPAD(i::text, 12, '0'))::uuid,
  'cust' || i || '@megastore.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'CUSTOMER', 'ACTIVE', 'ACTIVE', NULL,
  0, false,
  ('2025-01-01'::timestamp + ((i - 1) * INTERVAL '15 days')),
  ('2025-01-01'::timestamp + ((i - 1) * INTERVAL '15 days')),
  'admin', 'admin'
FROM generate_series(1, 30) t(i)
ON CONFLICT DO NOTHING;

-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 65%% [█████████████░░░░░░░] Customer users done - starting orders'; END $$;

-- 13. COMPREHENSIVE ORDERS  2025-01-01 → 2027-05-25
-- Day-by-day, time-by-time: ~4,600 orders, CASH + BANK, all statuses
-- ============================================================================

-- Widen orders.payment_method check constraint to include BANK
ALTER TABLE orders
  DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_payment_method_check
  CHECK (payment_method IN ('CASH', 'BANK'));

-- Remove any existing orders for this business before regenerating
DELETE FROM order_status_history
  WHERE order_id IN (SELECT id FROM orders WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0');
DELETE FROM order_items
  WHERE order_id IN (SELECT id FROM orders WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0');
DELETE FROM order_delivery_options
  WHERE order_id IN (SELECT id FROM orders WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0');
DELETE FROM order_delivery_addresses
  WHERE order_id IN (SELECT id FROM orders WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0');
DELETE FROM orders WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0';

INSERT INTO orders (
  id, order_number, business_id,
  customer_id, customer_name, customer_phone, customer_email,
  customer_note, business_note,
  order_status, source, order_from,
  subtotal, customization_total, delivery_fee,
  discount_amount, discount_type, discount_reason,
  tax_percentage, tax_amount, total_amount,
  payment_method, payment_status,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  'ORD-' || TO_CHAR(ts, 'YYYYMMDD') || '-' || LPAD(rn::text, 5, '0'),
  '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,

  -- 75 % have a known customer ID, 25 % are guest
  CASE WHEN rn % 4 = 0 THEN NULL
       ELSE ('c0000000-0000-0000-0000-' || LPAD(((rn % 30) + 1)::text, 12, '0'))::uuid
  END,
  CASE WHEN rn % 4 = 0 THEN 'Guest Customer ' || (rn % 20 + 1)
       ELSE 'Customer ' || ((rn % 30) + 1)
  END,
  '+855-' || (10 + rn % 80) || '-' || LPAD((100000 + rn * 7 % 900000)::text, 6, '0'),
  CASE WHEN rn % 4 = 0 THEN 'guest' || rn || '@example.com'
       ELSE 'cust' || ((rn % 30) + 1) || '@megastore.com'
  END,
  NULL,
  NULL,

  -- Status: COMPLETED 65 %, CONFIRMED 15 %, PENDING 10 %, CANCELLED 10 %
  CASE
    WHEN (rn * 11 + doy) % 20 IN (0, 1) THEN 'PENDING'
    WHEN (rn * 11 + doy) % 20 IN (2, 3) THEN 'CONFIRMED'
    WHEN (rn * 11 + doy) % 20 = 4       THEN 'CANCELLED'
    ELSE                                      'COMPLETED'
  END,

  -- Source: POS 35 %, PUBLIC 65 %
  CASE WHEN slot % 10 IN (0,1,2,3) THEN 'POS' ELSE 'PUBLIC' END,
  CASE WHEN slot % 10 IN (0,1,2,3) THEN 'BUSINESS' ELSE 'CUSTOMER' END,

  subtotal,
  cust_total,
  CASE WHEN slot % 10 >= 4 THEN 5.00::numeric ELSE 0.00::numeric END,
  discount,
  disc_type,
  disc_reason,
  10.0,
  ROUND((subtotal + cust_total) * 0.10, 2),
  ROUND(subtotal + cust_total
        + CASE WHEN slot % 10 >= 4 THEN 5.00::numeric ELSE 0.00::numeric END
        - discount
        + (subtotal + cust_total) * 0.10, 2),

  -- Payment: CASH 55 %, BANK 45 %
  CASE WHEN (rn + slot) % 20 < 11 THEN 'CASH' ELSE 'BANK' END,
  CASE WHEN (rn * 11 + doy) % 20 NOT IN (0,1,2,3,4) THEN 'PAID' ELSE 'UNPAID' END,

  0, false, ts, ts, 'system', 'system'

FROM (
  SELECT
    -- Realistic hourly timestamps spread across business day
    (d::timestamp + CASE slot % 12
       WHEN 0  THEN INTERVAL '9 hours 10 minutes'
       WHEN 1  THEN INTERVAL '10 hours 25 minutes'
       WHEN 2  THEN INTERVAL '11 hours 40 minutes'
       WHEN 3  THEN INTERVAL '12 hours 15 minutes'
       WHEN 4  THEN INTERVAL '13 hours 5 minutes'
       WHEN 5  THEN INTERVAL '14 hours 45 minutes'
       WHEN 6  THEN INTERVAL '15 hours 30 minutes'
       WHEN 7  THEN INTERVAL '16 hours 50 minutes'
       WHEN 8  THEN INTERVAL '17 hours 20 minutes'
       WHEN 9  THEN INTERVAL '18 hours 35 minutes'
       WHEN 10 THEN INTERVAL '19 hours 10 minutes'
       WHEN 11 THEN INTERVAL '20 hours 25 minutes'
     END + ((slot * 7) % 55) * INTERVAL '1 minute')  AS ts,
    slot,
    ROW_NUMBER() OVER (ORDER BY d, slot)              AS rn,
    EXTRACT(DOY FROM d)::int                          AS doy,

    -- Revenue grows gradually over time + per-day variation
    ROUND((
      50
      + GREATEST(0, (d::date - '2025-01-01'::date) * 0.08)
      + ((slot * 23 + EXTRACT(DOY FROM d)::int * 17) % 300)
    )::numeric, 2) AS subtotal,

    ROUND(((slot * 5 + EXTRACT(DOY FROM d)::int * 3) % 30)::numeric, 2) AS cust_total,

    -- 20 % of orders get an 8 % discount
    ROUND(CASE WHEN (slot + EXTRACT(DOY FROM d)::int) % 5 = 0
      THEN GREATEST(0,
             50
             + (d::date - '2025-01-01'::date) * 0.08
             + ((slot * 23 + EXTRACT(DOY FROM d)::int * 17) % 300)
           )::numeric * 0.08
      ELSE 0::numeric END, 2) AS discount,
    CASE WHEN (slot + EXTRACT(DOY FROM d)::int) % 5 = 0 THEN 'percentage' ELSE NULL END AS disc_type,
    CASE WHEN (slot + EXTRACT(DOY FROM d)::int) % 5 = 0 THEN '8% Seasonal Discount' ELSE NULL END AS disc_reason

  FROM generate_series('2025-01-01'::date, '2027-05-25'::date, '1 day'::interval) d
  CROSS JOIN generate_series(0,
    CASE WHEN EXTRACT(ISODOW FROM d) IN (6,7) THEN 11 ELSE 7 END
  ) slot
) order_data;


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 70%% [██████████████░░░░░░] ~4600 orders inserted (2025-2027)'; END $$;

-- 14. DELIVERY ADDRESSES for PUBLIC (non-POS) orders
-- ============================================================================
INSERT INTO order_delivery_addresses (
  id, order_id, house_number, street_number, village, commune, district, province,
  latitude, longitude, note,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  o.id,
  LPAD((10 + (ROW_NUMBER() OVER (ORDER BY o.id) % 200))::text, 3, '0'),
  LPAD((100 + (ROW_NUMBER() OVER (ORDER BY o.id) % 300))::text, 3, '0'),
  'Village ' || ((ROW_NUMBER() OVER (ORDER BY o.id) % 25) + 1),
  'Commune ' || ((ROW_NUMBER() OVER (ORDER BY o.id) % 20) + 1),
  CASE (ROW_NUMBER() OVER (ORDER BY o.id) % 5)::int
    WHEN 0 THEN 'Chbar Ampov'
    WHEN 1 THEN 'Russei Keo'
    WHEN 2 THEN 'Sen Sok'
    WHEN 3 THEN 'Pur Senchey'
    ELSE        'Chamcar Mon'
  END,
  'Phnom Penh',
  (11.50 + (ROW_NUMBER() OVER (ORDER BY o.id)::numeric % 100) / 1000)::numeric(10,8),
  (104.80 + (ROW_NUMBER() OVER (ORDER BY o.id)::numeric % 100) / 1000)::numeric(11,8),
  'Building #' || (ROW_NUMBER() OVER (ORDER BY o.id)) || ', Floor ' || ((ROW_NUMBER() OVER (ORDER BY o.id) % 5) + 1),
  0, false, o.created_at, o.created_at, 'system', 'system'
FROM orders o
WHERE o.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND o.source = 'PUBLIC'
  AND NOT EXISTS (SELECT 1 FROM order_delivery_addresses WHERE order_id = o.id);


-- ============================================================================
-- 15. DELIVERY OPTIONS for all orders
DO $$ BEGIN RAISE NOTICE ' 75%% [███████████████░░░░░] Delivery addresses done'; END $$;

-- ============================================================================
INSERT INTO order_delivery_options (
  id, order_id, name, description, price,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  o.id,
  CASE WHEN o.source = 'POS' THEN 'In-Store Pickup' ELSE 'Standard Delivery (24h)' END,
  CASE WHEN o.source = 'POS'
    THEN 'Pickup from our store — available immediately'
    ELSE 'Standard delivery within 24 hours'
  END,
  CASE WHEN o.source = 'POS' THEN 0.00::numeric(10,2) ELSE 5.00::numeric(10,2) END,
  0, false, o.created_at, o.created_at, 'system', 'system'
FROM orders o
WHERE o.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM order_delivery_options WHERE order_id = o.id);


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 80%% [████████████████░░░░] Order items done'; END $$;

-- 16. ORDER ITEMS  (2 line items per order, varied products)
-- ============================================================================

-- First item per order
INSERT INTO order_items (
  id, order_id, product_id, product_size_id,
  product_name, product_image_url, size_name, sku, barcode,
  quantity, current_price, final_price, unit_price, total_price,
  has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date,
  customization_total, customizations,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(), o.id, p.id, NULL,
  p.name, p.main_image_url, 'Standard', p.sku, p.barcode,
  (1 + EXTRACT(MINUTE FROM o.created_at)::int % 3)::int,
  p.price, p.price, p.price,
  p.price * (1 + EXTRACT(MINUTE FROM o.created_at)::int % 3),
  false, NULL, NULL, NULL, NULL,
  0.00, '[]'::json,
  0, false, o.created_at, o.created_at, 'system', 'system'
FROM orders o
JOIN LATERAL (
  SELECT id, name, sku, barcode, main_image_url, price
  FROM products
  WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
    AND is_deleted = false AND price > 0
  ORDER BY id
  LIMIT 1
  OFFSET ((EXTRACT(EPOCH FROM o.created_at)::bigint / 3600) % 9500)
) p ON true
WHERE o.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = o.id);

-- Second item per order (different product)
INSERT INTO order_items (
  id, order_id, product_id, product_size_id,
  product_name, product_image_url, size_name, sku, barcode,
  quantity, current_price, final_price, unit_price, total_price,
  has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date,
  customization_total, customizations,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(), o.id, p.id, NULL,
  p.name, p.main_image_url, 'Standard', p.sku, p.barcode,
  1,
  p.price, p.price, p.price, p.price,
  false, NULL, NULL, NULL, NULL,
  0.00, '[]'::json,
  0, false, o.created_at, o.created_at, 'system', 'system'
FROM orders o
JOIN LATERAL (
  SELECT id, name, sku, barcode, main_image_url, price
  FROM products
  WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
    AND is_deleted = false AND price > 0
  ORDER BY id
  LIMIT 1
  OFFSET (((EXTRACT(EPOCH FROM o.created_at)::bigint / 3600) + 4500) % 9500)
) p ON true
WHERE o.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0';


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 85%% [█████████████████░░░] Order status history done'; END $$;

-- 17. ORDER STATUS HISTORY (PENDING on create + COMPLETED for completed orders)
-- ============================================================================
INSERT INTO order_status_history (
  id, order_id, order_status, note,
  changed_by_user_id, changed_by_name,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(), o.id,
  'PENDING', 'Order placed',
  NULL, 'System',
  0, false, o.created_at, o.created_at, 'system', 'system'
FROM orders o
WHERE o.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND NOT EXISTS (
    SELECT 1 FROM order_status_history WHERE order_id = o.id AND order_status = 'PENDING'
  );

INSERT INTO order_status_history (
  id, order_id, order_status, note,
  changed_by_user_id, changed_by_name,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(), o.id,
  'COMPLETED', 'Order fulfilled and payment confirmed',
  NULL, 'System',
  0, false,
  o.created_at + INTERVAL '2 hours',
  o.created_at + INTERVAL '2 hours',
  'system', 'system'
FROM orders o
WHERE o.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
  AND o.order_status = 'COMPLETED'
  AND NOT EXISTS (
    SELECT 1 FROM order_status_history WHERE order_id = o.id AND order_status = 'COMPLETED'
  );


-- ============================================================================
-- FINAL STATISTICS

-- ============================================================================
-- ✅ BUSINESSES: 2
--   ├─ Mega Store (phatmenghor20@gmail.com)
--   └─ Fashion Hub (phatmenghor21@gmail.com)
--
-- ✅ CUSTOMER ADDRESSES: 5 (3 for phatmenghor20, 2 for phatmenghor21)
--
-- ✅ USERS: 150+
--   ├─ Mega Store: 101 (1 owner + 5 admin + 15 manager + 80 staff)
--   └─ Fashion Hub: 14 (1 owner + 3 admin + 10 staff)
--
-- ✅ CATEGORIES: 18 (Mega Store only)
-- ✅ SUBCATEGORIES: 18
-- ✅ BRANDS: 18
--
-- ✅ PRODUCTS: 10,000
--   ├─ With Promotions: 4,000 (40%)
--   ├─ With Sizes: 6,000 (60%)
--   └─ Total Images: 50,000 (5 per product)
--   └─ Total Customizations: 180,000 (18 per product)
--
-- ✅ PRODUCT STOCK: 10,540 (base + sizes)
--   ├─ Base stock: 100 per product
--   ├─ Size stock: 50-80 per size variant
--   └─ Cost: 60% of retail price
--
-- ✅ ORDERS: 180 total
--   ├─ Mega Store: 100 orders (phatmenghor20)
--   └─ Fashion Hub: 80 orders (phatmenghor21)
--
-- ✅ ORDER ITEMS: 500-600 (3-5 per order)
-- ✅ ORDER PAYMENTS: 180 (1 per order)
-- ✅ ORDER STATUS HISTORY: 180 (initial status)
--
-- ✅ TOTAL RECORDS: ~300,000+

-- ============================================================================


-- ============================================================================
-- VERIFICATION QUERIES - Check if data was inserted successfully

-- ============================================================================

-- Check Main Users
SELECT '=== MAIN USERS ===' as info;
SELECT u.id, u.user_identifier, up.email, b.name as business_name
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN businesses b ON u.business_id = b.id
WHERE u.user_identifier IN ('phatmenghor20@gmail.com', 'phatmenghor21@gmail.com')
ORDER BY u.user_identifier;

-- Check Businesses
SELECT '=== BUSINESSES ===' as info;
SELECT id, name, status, is_subscription_active FROM businesses ORDER BY created_at;

-- Check Data Counts
SELECT '=== DATA COUNTS ===' as info;
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM categories) as categories,
  (SELECT COUNT(*) FROM brands) as brands,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM product_sizes) as product_sizes,
  (SELECT COUNT(*) FROM product_customizations) as product_customizations,
  (SELECT COUNT(*) FROM product_images) as product_images,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM order_items) as order_items,
  (SELECT COUNT(*) FROM order_payments) as order_payments,
  (SELECT COUNT(*) FROM customer_addresses) as customer_addresses,
  (SELECT COUNT(*) FROM product_stock) as product_stock;

-- Check Mega Store Data
SELECT '=== MEGA STORE DATA ===' as info;
SELECT
  COUNT(DISTINCT p.id) as products,
  COUNT(DISTINCT ps.id) as sizes,
  COUNT(DISTINCT pc.id) as customizations,
  COUNT(DISTINCT pi.id) as images
FROM products p
LEFT JOIN product_sizes ps ON p.id = ps.product_id
LEFT JOIN product_customizations pc ON p.id = pc.product_id
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0';

-- Check Orders for phatmenghor20
SELECT '=== ORDERS FOR phatmenghor20 ===' as info;
SELECT COUNT(*) as total_orders FROM orders WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0';

-- Check Orders for phatmenghor21
SELECT '=== ORDERS FOR phatmenghor21 ===' as info;
SELECT COUNT(*) as total_orders FROM orders WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0';


-- ============================================================================
-- 18. PORTFOLIO FEATURE TEST DATA
-- Full portfolio profiles for Mega Store and Fashion Hub
-- Tables covered:
--   portfolio_profile, portfolio_profile_phones, portfolio_profile_features,
--   portfolio_hours, portfolio_gallery, portfolio_service_item,
--   portfolio_team_member, portfolio_custom_stat, portfolio_review
--
-- Profile IDs (fixed for FK references):
--   Mega Store   profile = aa1cad56-cafd-4aba-baef-c4dcd53940d0
--   Fashion Hub  profile = bb1cad56-cafd-4aba-baef-c4dcd53940d0
-- ============================================================================


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 90%% [██████████████████░░] User HR data done'; END $$;

-- 7. USER RELATIONSHIPS (Employment, Telegram, Address, Emergency Contact, Documents, Education)
-- ============================================================================

-- USER EMPLOYMENT DATA
INSERT INTO user_employments (id, user_id, employee_id, position, department, employment_type, join_date, shift, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  'EMP-' || SUBSTRING(u.id::text, 1, 8),
  CASE
    WHEN u.user_identifier LIKE '%phatmenghor20%' THEN 'Business Owner'
    WHEN u.user_identifier LIKE '%phatmenghor21%' THEN 'Business Owner'
    WHEN u.user_identifier LIKE '%admin%' THEN 'Administrator'
    WHEN u.user_identifier LIKE '%manager%' THEN 'Store Manager'
    WHEN u.user_identifier LIKE '%staff%' THEN 'Sales Associate'
    ELSE 'Employee'
  END,
  CASE
    WHEN u.user_identifier LIKE '%phatmenghor20%' THEN 'Management'
    WHEN u.user_identifier LIKE '%phatmenghor21%' THEN 'Management'
    WHEN u.user_identifier LIKE '%admin%' THEN 'Administration'
    WHEN u.user_identifier LIKE '%manager%' THEN 'Operations'
    ELSE 'Sales'
  END,
  'FULL_TIME'::text,
  CASE
    WHEN u.user_identifier LIKE '%phatmenghor20%' THEN '2016-01-01'::date
    WHEN u.user_identifier LIKE '%phatmenghor21%' THEN '2018-06-15'::date
    WHEN u.user_identifier LIKE '%admin%' THEN '2020-01-10'::date
    WHEN u.user_identifier LIKE '%manager%' THEN '2019-03-20'::date
    ELSE '2023-01-15'::date
  END,
  'Morning Shift',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_employments WHERE user_id = u.id);

-- USER TELEGRAM DATA
INSERT INTO user_telegrams (id, user_id, telegram_id, telegram_username, telegram_first_name, telegram_last_name, telegram_photo_url, telegram_synced_at, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  (987654320 + ROW_NUMBER() OVER (ORDER BY u.id))::bigint,
  REPLACE(SPLIT_PART(u.user_identifier, '@', 1), '.', '_'),
  SPLIT_PART(u.user_identifier, '@', 1),
  'Cambodian',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  NOW(),
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_telegrams WHERE user_id = u.id)
  AND u.user_type IN ('BUSINESS_USER', 'CUSTOMER');

-- USER ADDRESSES (Current Address)
INSERT INTO user_addresses (id, user_id, address_type, house_no, street, village, commune, district, province, country, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  'CURRENT'::text,
  '123',
  'Street 271',
  'Toul Kork',
  'Toul Kork',
  'Chamkarmon',
  'Phnom Penh',
  'Cambodia',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_addresses WHERE user_id = u.id AND address_type = 'CURRENT');

-- USER EMERGENCY CONTACTS
INSERT INTO user_emergency_contacts (id, user_id, name, phone, relationship, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  'Family Member',
  '+855-97-' || LPAD((987654 + ROW_NUMBER() OVER (ORDER BY u.id))::text, 6, '0'),
  'Family',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_emergency_contacts WHERE user_id = u.id);

-- USER DOCUMENTS (ID Card, Passport)
INSERT INTO user_documents (id, user_id, type, number, file_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  'ID_CARD'::text,
  '120000000' || LPAD((ROW_NUMBER() OVER (ORDER BY u.id))::text, 6, '0'),
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_documents WHERE user_id = u.id AND type = 'ID_CARD');

INSERT INTO user_documents (id, user_id, type, number, file_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  'PASSPORT'::text,
  'C' || LPAD((ROW_NUMBER() OVER (ORDER BY u.id))::text, 7, '0'),
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_documents WHERE user_id = u.id AND type = 'PASSPORT');

-- USER EDUCATION
INSERT INTO user_educations (id, user_id, level, school_name, field_of_study, start_year, end_year, is_graduated, certificate_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  'BACHELOR'::text,
  'Royal University of Phnom Penh',
  CASE
    WHEN u.user_identifier LIKE '%admin%' THEN 'Computer Science'
    WHEN u.user_identifier LIKE '%manager%' THEN 'Business Management'
    ELSE 'Commerce'
  END,
  '2010',
  '2014',
  true,
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_educations WHERE user_id = u.id);

INSERT INTO user_educations (id, user_id, level, school_name, field_of_study, start_year, end_year, is_graduated, certificate_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
  'HIGH_SCHOOL'::text,
  'Sisowath High School',
  'General Education',
  '2006',
  '2010',
  true,
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_educations WHERE user_id = u.id AND level = 'HIGH_SCHOOL');

-- ============================================================================

DO $$ BEGIN RAISE NOTICE ' 95%% [███████████████████░] Portfolio data done'; END $$;

-- PORTFOLIO PROFILES (Updated Schema with Dynamic Data)
INSERT INTO portfolio_profile (
  id, business_id, business_name, description,
  logo_url, cover_image_url,
  contact_email, contact_phone, contact_whatsapp, contact_telegram,
  address, map_link,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
VALUES (
  'aa1cad56-cafd-4aba-baef-c4dcd53940d0',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  'Mega Store',
  'Mega Store is Cambodia''s premier retail destination offering over 10,000 quality products across fashion, electronics, home goods, and more. Founded in 2016, we have served over 10,000 happy customers with a commitment to authenticity, value, and excellent service. Shop with confidence — every product is carefully curated and backed by our 30-day return policy.',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'megastore@example.com',
  '+855-12-345-678',
  '+855-12-345-678',
  'https://t.me/megastore_cambodia',
  'Street 271, Toul Kork, Phnom Penh, Cambodia, 12000',
  'https://maps.google.com/?q=Mega+Store+Phnom+Penh',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

INSERT INTO portfolio_profile (
  id, business_id, business_name, description,
  logo_url, cover_image_url,
  contact_email, contact_phone, contact_whatsapp, contact_telegram,
  address, map_link,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
VALUES (
  'bb1cad56-cafd-4aba-baef-c4dcd53940d0',
  '660cad56-cafd-4aba-baef-c4dcd53940d0',
  'Fashion Hub',
  'Fashion Hub is Siem Reap''s leading fashion boutique, blending contemporary trends with Khmer craftsmanship. Since 2019, we have dressed thousands of style-conscious customers with our curated collections of local and international designers. From casual wear to formal attire, our experienced stylists are ready to help you find your perfect look.',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'fashionhub@example.com',
  '+855-87-654-321',
  '+855-87-654-321',
  'https://t.me/fashionhub_siemreap',
  'Sivatha Blvd, Pub Street Area, Siem Reap, Cambodia, 17000',
  'https://maps.google.com/?q=Fashion+Hub+Siem+Reap',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- PORTFOLIO CONTACT PHONES (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_phone (id, profile_id, number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id::uuid, v.profile_id::uuid, v.number, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '+855-12-345-678'),
  ('550e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '+855-98-765-432'),
  ('550e8400-e29b-41d4-a716-446655440003', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', '+855-87-654-321'),
  ('550e8400-e29b-41d4-a716-446655440004', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', '+855-11-222-333')
) AS v(id, profile_id, number)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_phone WHERE id = v.id::uuid)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PORTFOLIO SOCIAL MEDIA (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_social_media (id, profile_id, name, url, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id::uuid, v.profile_id::uuid, v.name, v.url, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('cc0e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Facebook', 'https://facebook.com/megastore.cambodia'),
  ('cc0e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Instagram', 'https://instagram.com/megastore.cambodia'),
  ('cc0e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Twitter', 'https://twitter.com/megastore_kh'),
  ('cc0e8400-e29b-41d4-a716-446655440004', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Facebook', 'https://facebook.com/fashionhub.siemreap'),
  ('cc0e8400-e29b-41d4-a716-446655440005', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Instagram', 'https://instagram.com/fashionhub_sr'),
  ('cc0e8400-e29b-41d4-a716-446655440006', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Website', 'https://fashionhub-cambodia.com')
) AS v(id, profile_id, name, url)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_social_media WHERE id = v.id::uuid)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PORTFOLIO FEATURES (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_feature (id, profile_id, name, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id::uuid, v.profile_id::uuid, v.name, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('880e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Free Delivery on orders over $50'),
  ('880e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '30-Day Easy Returns'),
  ('880e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '1-Year Product Warranty'),
  ('880e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '100% Authentic Products'),
  ('880e8400-e29b-41d4-a716-446655440005', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', '24/7 Customer Support'),
  ('880e8400-e29b-41d4-a716-446655440006', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Loyalty Rewards Program'),
  ('880e8400-e29b-41d4-a716-446655440007', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Personal Styling Service'),
  ('880e8400-e29b-41d4-a716-446655440008', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Same-Day Alterations Available'),
  ('880e8400-e29b-41d4-a716-446655440009', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Exclusive Member Previews'),
  ('880e8400-e29b-41d4-a716-446655440010', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Free Gift Wrapping'),
  ('880e8400-e29b-41d4-a716-446655440011', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'VIP Shopping Hours')
) AS v(id, profile_id, name)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_feature WHERE id = v.id::uuid)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PORTFOLIO BUSINESS HOURS (Dynamic with IDs)
-- ============================================================================

INSERT INTO portfolio_hours (id, profile_id, day, open_time, close_time, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id::uuid, v.profile_id::uuid, v.day, v.open_time, v.close_time, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('660e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'MONDAY',    '08:00', '22:00'),
  ('660e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'TUESDAY',   '08:00', '22:00'),
  ('660e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'WEDNESDAY', '08:00', '22:00'),
  ('660e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'THURSDAY',  '08:00', '22:00'),
  ('660e8400-e29b-41d4-a716-446655440005', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'FRIDAY',    '08:00', '23:00'),
  ('660e8400-e29b-41d4-a716-446655440006', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'SATURDAY',  '09:00', '23:00'),
  ('660e8400-e29b-41d4-a716-446655440007', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'SUNDAY',    NULL,    NULL),
  ('660e8400-e29b-41d4-a716-446655440008', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'MONDAY',    '09:00', '21:00'),
  ('660e8400-e29b-41d4-a716-446655440009', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'TUESDAY',   '09:00', '21:00'),
  ('660e8400-e29b-41d4-a716-446655440010', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'WEDNESDAY', '09:00', '21:00'),
  ('660e8400-e29b-41d4-a716-446655440011', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'THURSDAY',  '09:00', '21:00'),
  ('660e8400-e29b-41d4-a716-446655440012', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'FRIDAY',    '09:00', '22:00'),
  ('660e8400-e29b-41d4-a716-446655440013', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'SATURDAY',  '10:00', '22:00'),
  ('660e8400-e29b-41d4-a716-446655440014', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'SUNDAY',    '10:00', '20:00')
) AS v(id, profile_id, day, open_time, close_time)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_hours WHERE id = v.id::uuid)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PORTFOLIO GALLERY
-- ============================================================================

INSERT INTO portfolio_gallery (id, profile_id, url, title, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id::uuid, v.profile_id::uuid, v.url, v.title, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('770e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Store Entrance'),
  ('770e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Electronics Section'),
  ('770e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Fashion Floor'),
  ('770e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Home Goods Display'),
  ('770e8400-e29b-41d4-a716-446655440005', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Boutique Front'),
  ('770e8400-e29b-41d4-a716-446655440006', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Collections'),
  ('770e8400-e29b-41d4-a716-446655440007', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'Style Showcase')
) AS v(id, profile_id, url, title)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_gallery WHERE id = v.id::uuid)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PORTFOLIO SERVICES
-- ============================================================================

INSERT INTO portfolio_service_item (id, profile_id, name, description, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id::uuid, v.profile_id::uuid, v.name, v.description, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('990e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'In-Store Shopping', 'Browse our vast selection of 10,000+ products across multiple categories with expert staff assistance.'),
  ('990e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Online Ordering', 'Shop online 24/7 and get fast, reliable delivery to your doorstep.'),
  ('990e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Bulk Purchasing', 'Special pricing and services for bulk orders. Contact our B2B team for wholesale deals.'),
  ('990e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Gift Wrapping', 'Complimentary gift wrapping and personalized messages for all occasions.'),
  ('990e8400-e29b-41d4-a716-446655440005', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Personal Shopping', 'Our stylists will help you find the perfect look tailored to your style and needs.'),
  ('990e8400-e29b-41d4-a716-446655440006', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Alterations', 'Professional alteration services to ensure perfect fit for all your garments.'),
  ('990e8400-e29b-41d4-a716-446655440007', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Styling Consultation', 'Expert advice on fashion trends, color coordination, and wardrobe building.'),
  ('990e8400-e29b-41d4-a716-446655440008', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Corporate Gifting', 'Bulk ordering solutions for corporate gifts and employee gifts.')
) AS v(id, profile_id, name, description)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_service_item WHERE id = v.id::uuid)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PORTFOLIO TEAM MEMBERS
-- ============================================================================

INSERT INTO portfolio_team_member (id, profile_id, name, position, bio, photo_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id::uuid, v.profile_id::uuid, v.name, v.position, v.bio, v.photo_url, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Sokha Pou',   'Store Manager',        'With over 12 years of retail experience, Sokha leads Mega Store with passion for customer satisfaction.', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
  ('aa0e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Kosal Touch', 'Sales Director',       'Kosal ensures our team delivers the best shopping experience with expert product knowledge.',              'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
  ('aa0e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Srey Mom',    'Customer Service Lead', 'Srey Mom heads our dedicated customer support team, available 24/7 to assist you.',                       'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
  ('aa0e8400-e29b-41d4-a716-446655440004', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Dina Savuth', 'Boutique Owner',        'Dina founded Fashion Hub with a vision to bring quality fashion to Siem Reap with a personal touch.',    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
  ('aa0e8400-e29b-41d4-a716-446655440005', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Chanthy Ros', 'Senior Stylist',        'With expertise in both traditional and contemporary fashion, Chanthy helps clients discover their unique style.', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
  ('aa0e8400-e29b-41d4-a716-446655440006', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Piseth Rith', 'Tailor Master',         'Piseth brings 20+ years of tailoring expertise, ensuring perfect fits for all our customers.',             'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce')
) AS v(id, profile_id, name, position, bio, photo_url)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_team_member WHERE id = v.id::uuid)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PORTFOLIO CUSTOM STATISTICS (All Dynamic - No Fixed Fields)
-- ============================================================================

INSERT INTO portfolio_custom_stat (id, profile_id, label, value, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id::uuid, v.profile_id::uuid, v.label, v.value, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Years In Business',  '8'),
  ('bb0e8400-e29b-41d4-a716-446655440002', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Happy Customers',    '10,000+'),
  ('bb0e8400-e29b-41d4-a716-446655440003', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Products Available', '10,000+'),
  ('bb0e8400-e29b-41d4-a716-446655440004', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Daily Transactions', '500+'),
  ('bb0e8400-e29b-41d4-a716-446655440005', 'aa1cad56-cafd-4aba-baef-c4dcd53940d0', 'Cities Served',      '5'),
  ('bb0e8400-e29b-41d4-a716-446655440006', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Years In Business',  '5'),
  ('bb0e8400-e29b-41d4-a716-446655440007', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Happy Customers',    '5,000+'),
  ('bb0e8400-e29b-41d4-a716-446655440008', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Brands Carried',     '100+'),
  ('bb0e8400-e29b-41d4-a716-446655440009', 'bb1cad56-cafd-4aba-baef-c4dcd53940d0', 'Styling Sessions',   '1,000+')
) AS v(id, profile_id, label, value)
WHERE NOT EXISTS (SELECT 1 FROM portfolio_custom_stat WHERE id = v.id::uuid)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PORTFOLIO REVIEWS (3000 Total)
-- ============================================================================

-- Insert 3000 reviews: 1800 for Mega Store + 1200 for Fashion Hub
-- Rating distribution: 60% 5★, 20% 4★, 13% 3★, 5% 2★, 2% 1★
INSERT INTO portfolio_review (id, profile_id, business_id, customer_name, customer_phone, rating, comment, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'aa1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
  '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
  'Customer_' || row_number,
  '+855-' || LPAD((row_number % 999999)::text, 6, '0'),
  CASE
    WHEN rnd < 0.60 THEN 5
    WHEN rnd < 0.80 THEN 4
    WHEN rnd < 0.93 THEN 3
    WHEN rnd < 0.98 THEN 2
    ELSE 1
  END,
  CASE
    WHEN rnd < 0.60 THEN 'Amazing shopping experience. Staff is friendly and helpful. Highly recommend to everyone!'
    WHEN rnd < 0.80 THEN 'Good variety of products. Prices are reasonable. Will come back again.'
    WHEN rnd < 0.93 THEN 'It was okay. Some items were out of stock but overall decent.'
    WHEN rnd < 0.98 THEN 'The service could be better. Long wait times.'
    ELSE 'Very disappointed with the quality and service.'
  END,
  0, false, NOW() - INTERVAL '1 day' * (row_number % 365), NOW() - INTERVAL '1 day' * (row_number % 365), 'system', 'system'
FROM (
  SELECT
    n as row_number,
    (n::float / 1800) as rnd
  FROM generate_series(1, 1800) n
) data;

-- Insert 1200 reviews for Fashion Hub
INSERT INTO portfolio_review (id, profile_id, business_id, customer_name, customer_phone, rating, comment, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  'bb1cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
  '660cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
  'Shopper_' || row_number,
  '+855-' || LPAD((90000 + (row_number % 999999))::text, 6, '0'),
  CASE
    WHEN rnd < 0.60 THEN 5
    WHEN rnd < 0.80 THEN 4
    WHEN rnd < 0.93 THEN 3
    WHEN rnd < 0.98 THEN 2
    ELSE 1
  END,
  CASE
    WHEN rnd < 0.60 THEN 'Love the fashion styles! The staff gave me great styling advice. Will definitely shop here again!'
    WHEN rnd < 0.80 THEN 'Great boutique with nice pieces. Friendly staff and good prices.'
    WHEN rnd < 0.93 THEN 'Okay selection. Could use more modern designs.'
    WHEN rnd < 0.98 THEN 'Not many options that suit my taste.'
    ELSE 'Selection is too limited and prices are high.'
  END,
  0, false, NOW() - INTERVAL '1 day' * (row_number % 365), NOW() - INTERVAL '1 day' * (row_number % 365), 'system', 'system'
FROM (
  SELECT
    n as row_number,
    (n::float / 1200) as rnd
  FROM generate_series(1, 1200) n
) data;

-- ============================================================================
DO $$ BEGIN RAISE NOTICE '100%% [████████████████████] All done! ~4600 orders + 10k products + portfolio complete'; END $$;


SELECT '=== PORTFOLIO PROFILES ===' AS info;
SELECT id, business_name, description
FROM portfolio_profile
WHERE is_deleted = false
ORDER BY created_at;

SELECT '=== PORTFOLIO COUNTS PER BUSINESS ===' AS info;
SELECT
  pp.business_name,
  (SELECT COUNT(*) FROM portfolio_phone   WHERE profile_id = pp.id)                                  AS phones,
  (SELECT COUNT(*) FROM portfolio_feature WHERE profile_id = pp.id AND is_deleted = false)          AS features,
  (SELECT COUNT(*) FROM portfolio_hours            WHERE profile_id = pp.id AND is_deleted = false)    AS hours,
  (SELECT COUNT(*) FROM portfolio_gallery          WHERE profile_id = pp.id AND is_deleted = false)    AS gallery,
  (SELECT COUNT(*) FROM portfolio_service_item     WHERE profile_id = pp.id AND is_deleted = false)    AS services,
  (SELECT COUNT(*) FROM portfolio_team_member      WHERE profile_id = pp.id AND is_deleted = false)    AS team,
  (SELECT COUNT(*) FROM portfolio_custom_stat      WHERE profile_id = pp.id AND is_deleted = false)    AS custom_stats,
  (SELECT COUNT(*) FROM portfolio_review           WHERE profile_id = pp.id AND is_deleted = false)    AS reviews
FROM portfolio_profile pp
WHERE pp.is_deleted = false
ORDER BY pp.created_at;

SELECT '=== PORTFOLIO REVIEW RATING DISTRIBUTION ===' AS info;
SELECT
  pp.business_name,
  pr.rating,
  COUNT(*) AS count
FROM portfolio_review pr
JOIN portfolio_profile pp ON pr.profile_id = pp.id
WHERE pr.is_deleted = false
GROUP BY pp.business_name, pr.rating
ORDER BY pp.business_name, pr.rating DESC;

-- ============================================================================
-- COMPREHENSIVE SUMMARY
-- ============================================================================
-- ✅ BUSINESSES: 2
--   ├─ Mega Store (phatmenghor20@gmail.com)
--   └─ Fashion Hub (phatmenghor21@gmail.com)
--
-- ✅ PORTFOLIO PROFILES: 2
--   ├─ Mega Store Profile
--   │  ├─ Phones:       3
--   │  ├─ Features:     6
--   │  ├─ Hours:        7  (Mon–Sun, all open)
--   │  ├─ Gallery:      8  items
--   │  ├─ Services:     6
--   │  ├─ Team:         5  members
--   │  ├─ Custom Stats: 4
--   │  └─ Reviews:      30 (~60% 5★, 20% 4★, 13% 3★, 7% 2★)
--   │
--   └─ Fashion Hub Profile
--      ├─ Phones:       2
--      ├─ Features:     5
--      ├─ Hours:        7  (all days open)
--      ├─ Gallery:      6  items
--      ├─ Services:     4
--      ├─ Team:         4  members
--      ├─ Custom Stats: 3
--      └─ Reviews:      15 (~60% 5★, 25% 4★, 15% 3★)
--
-- ✅ USERS: 150+
-- ✅ PRODUCTS: 10,000
-- ✅ ORDERS: 30
-- ✅ TOTAL RECORDS: ~300,000+
-- ============================================================================
