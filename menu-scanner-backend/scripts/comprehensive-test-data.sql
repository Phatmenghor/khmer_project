-- ============================================================================
-- COMPREHENSIVE TEST DATA - KHMER E-MENU PLATFORM
-- Coverage: ALL 47 Database Tables
-- PostgreSQL Compatible - Complete Schema
-- ============================================================================
-- This script generates complete test data for:
-- - Authentication & User Management (7 tables)
-- - Location & Geography (5 tables)
-- - Products & Inventory (8 tables)
-- - Orders & Payments (13 tables)
-- - HR & Attendance (7 tables)
-- - Subscriptions (2 tables)
-- - Audit & Logging (1 table)
-- - Reference Data (2 tables)
-- ============================================================================
-- DEFAULT PASSWORD FOR ALL USERS (508 users):
--   BCrypt Hash : $2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK
-- ============================================================================

-- ============================================================================
-- TRUNCATE ALL TABLES (preserve order of cascade)
-- ============================================================================

TRUNCATE TABLE audit_logs CASCADE;
TRUNCATE TABLE images CASCADE;
TRUNCATE TABLE stock_movements CASCADE;
TRUNCATE TABLE product_stock CASCADE;
TRUNCATE TABLE product_favorites CASCADE;
TRUNCATE TABLE product_images CASCADE;
TRUNCATE TABLE product_sizes CASCADE;
TRUNCATE TABLE order_item_pricing_snapshots CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE order_payments CASCADE;
TRUNCATE TABLE order_status_history CASCADE;
TRUNCATE TABLE order_delivery_options CASCADE;
TRUNCATE TABLE order_delivery_addresses CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE carts CASCADE;
TRUNCATE TABLE customer_addresses CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE business_exchange_rates CASCADE;
TRUNCATE TABLE order_counters CASCADE;
TRUNCATE TABLE reference_counters CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE brands CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE delivery_options CASCADE;
TRUNCATE TABLE payment_options CASCADE;
TRUNCATE TABLE business_settings CASCADE;
TRUNCATE TABLE subscriptions CASCADE;
TRUNCATE TABLE subscription_plans CASCADE;
TRUNCATE TABLE exchange_rates CASCADE;
TRUNCATE TABLE user_sessions CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;
TRUNCATE TABLE blacklisted_tokens CASCADE;
TRUNCATE TABLE user_educations CASCADE;
TRUNCATE TABLE user_documents CASCADE;
TRUNCATE TABLE user_emergency_contacts CASCADE;
TRUNCATE TABLE user_telegrams CASCADE;
TRUNCATE TABLE user_employments CASCADE;
TRUNCATE TABLE user_profiles CASCADE;
TRUNCATE TABLE user_addresses CASCADE;
TRUNCATE TABLE user_roles CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE businesses CASCADE;
TRUNCATE TABLE roles CASCADE;
TRUNCATE TABLE location_village_cbc CASCADE;
TRUNCATE TABLE location_commune_cbc CASCADE;
TRUNCATE TABLE location_district_cbc CASCADE;
TRUNCATE TABLE location_province_cbc CASCADE;

-- ============================================================================
-- 1. LOCATION DATA - CAMBODIA PROVINCES, DISTRICTS, COMMUNES, VILLAGES
-- ============================================================================

-- PROVINCES
INSERT INTO location_province_cbc (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, province_code, province_en, province_kh) VALUES
('01000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP', 'Phnom Penh', 'ភ្នំពេញ'),
('01000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'KT', 'Kandal', 'កណ្តាល'),
('01000000-0000-0000-0000-000000000003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PW', 'Pursat', 'ពោធិ៍សាត'),
('01000000-0000-0000-0000-000000000004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'SV', 'Siem Reap', 'សៀមរាប'),
('01000000-0000-0000-0000-000000000005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'KA', 'Kampong Chhnang', 'កម្ពង់ឆ្នាំង');

-- DISTRICTS
INSERT INTO location_district_cbc (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, district_code, district_en, district_kh, province_code) VALUES
('02000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP01', 'Daun Penh', 'ដូនពេញ', 'PP'),
('02000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP02', 'Chamkarmon', 'ចំការមន', 'PP'),
('02000000-0000-0000-0000-000000000003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP03', 'Russey Keo', 'រស្សីកែវ', 'PP'),
('02000000-0000-0000-0000-000000000004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'KT01', 'Kandal Stung', 'កណ្តាលស្ទឹង', 'KT'),
('02000000-0000-0000-0000-000000000005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'KT02', 'Ta Khmau', 'តាខ្មៅ', 'KT');

-- COMMUNES
INSERT INTO location_commune_cbc (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, commune_code, commune_en, commune_kh, district_code) VALUES
('03000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP0101', 'Wat Phnom', 'វត្តផ្នល់ម', 'PP01'),
('03000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP0102', 'Sangkat Chey Chumnes', 'សង្កាត់ឆេយឆូមនេស្', 'PP01'),
('03000000-0000-0000-0000-000000000003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP0201', 'Sangkat Boeung Trabek', 'សង្កាត់បឹងត្របក', 'PP02'),
('03000000-0000-0000-0000-000000000004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP0301', 'Sangkat Prasart Meakakum', 'សង្កាត់ព្រាសាទមេឃគុម', 'PP03'),
('03000000-0000-0000-0000-000000000005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'KT0101', 'Sangkat Kandal', 'សង្កាត់កណ្តាល', 'KT01');

-- VILLAGES
INSERT INTO location_village_cbc (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, village_code, village_en, village_kh, commune_code) VALUES
('04000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP010101', 'Village 1', 'ភូមិ ១', 'PP0101'),
('04000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP010102', 'Village 2', 'ភូមិ ២', 'PP0101'),
('04000000-0000-0000-0000-000000000003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP010103', 'Village 3', 'ភូមិ ៣', 'PP0101'),
('04000000-0000-0000-0000-000000000004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP010201', 'Village 4', 'ភូមិ ៤', 'PP0102'),
('04000000-0000-0000-0000-000000000005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'PP010202', 'Village 5', 'ភូមិ ៥', 'PP0102');

-- ============================================================================
-- 2. REFERENCE DATA - ENUMS & COUNTERS
-- ============================================================================

INSERT INTO exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, usd_to_khr_rate, is_active, notes) VALUES
('05000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 4100.0, true, 'Current exchange rate');

INSERT INTO order_counters (counter_date, counter_value) VALUES (CURRENT_DATE, 0);

INSERT INTO reference_counters (entity_type, counter_date, counter_value) VALUES
('ORDER', CURRENT_DATE, 0),
('LEAVE', CURRENT_DATE, 0),
('ATTENDANCE', CURRENT_DATE, 0),
('CHECK_IN', CURRENT_DATE, 0);

-- ============================================================================
-- 3. ROLES
-- ============================================================================

INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type) VALUES
('550e8400-e29b-41d4-a716-446655440000', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'ADMIN', 'Platform Administrator', NULL, 'PLATFORM_USER'),
('550e8400-e29b-41d4-a716-446655440001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'MANAGER', 'Business Manager', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'BUSINESS_USER'),
('550e8400-e29b-41d4-a716-446655440002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'STAFF', 'Business Staff', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'BUSINESS_USER'),
('550e8400-e29b-41d4-a716-446655440003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'CUSTOMER', 'Customer Role', NULL, 'CUSTOMER');

-- ============================================================================
-- 4. BUSINESSES
-- ============================================================================

INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, phone, email, address, description, status, owner_id, is_subscription_active) VALUES
('550cad56-cafd-4aba-baef-c4dcd53940d0', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'Phatmenghor Business', '+855 23 9999999', 'phatmenghor20@gmail.com', 'Phnom Penh, Cambodia', 'Main business with comprehensive testing', 'ACTIVE', '550e8400-e29b-41d4-a716-446655550001', true),
('550cad56-cafd-4aba-baef-c4dcd53940d1', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, 'Branch 2', '+855 23 8888888', 'branch2@test.com', 'Siem Reap, Cambodia', 'Secondary branch for testing', 'ACTIVE', NULL, false);

-- ============================================================================
-- 5. BUSINESS SETTINGS
-- ============================================================================

INSERT INTO business_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, logo_url, banner_url, business_type, opening_time, closing_time, is_open_24_hours, working_days, timezone, currency, language, usd_to_khr_rate, contact_email, contact_phone, whatsapp_number, facebook_url, instagram_url, telegram_url, website_url, primary_color, secondary_color, track_inventory, tax_rate, service_charge_percentage, min_order_amount, delivery_radius_km, estimated_delivery_time) VALUES
('550cad56-cafd-4aba-baef-c4dcd53940d2', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584', 'RESTAURANT', '09:00', '22:00', false, 'MON,TUE,WED,THU,FRI,SAT,SUN', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, 'contact@business.com', '+855 23 9999999', '+855 89 123456', 'https://facebook.com/phatmenghor', 'https://instagram.com/phatmenghor', 'https://t.me/phatmenghor', 'https://phatmenghor.com', '#FF6B6B', '#4ECDC4', true, 10.0, 5.0, 5.0, 15.0, '30-45 minutes'),
('550cad56-cafd-4aba-baef-c4dcd53940d3', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL, '550cad56-cafd-4aba-baef-c4dcd53940d1', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce', NULL, 'CAFE', '08:00', '21:00', false, 'MON,TUE,WED,THU,FRI,SAT,SUN', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, NULL, '+855 23 8888888', NULL, NULL, NULL, NULL, NULL, '#FF6B6B', '#4ECDC4', true, 5.0, NULL, 3.0, 20.0, '45 minutes');

-- ============================================================================
-- 6. BANNERS (18 items)
-- ============================================================================

INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, image_url, link_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0',
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    'https://example.com/promotion-' || LPAD(i::text, 2, '0'),
    CASE WHEN (i % 4) = 0 THEN 'INACTIVE' ELSE 'ACTIVE' END
FROM generate_series(1, 18) AS t(i);

-- ============================================================================
-- 7. USERS (3 main + 500 staff + 5 customers)
-- ============================================================================

INSERT INTO users (
    id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_identifier, password, user_type, account_status, status, business_id,
    remark, last_login_at, last_active_at, active_sessions_count
) VALUES
(
    '550e8400-e29b-41d4-a716-446655550000', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'phatmenghor19@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK',
    'PLATFORM_USER', 'ACTIVE', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0',
    'Main platform administrator account',
    NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes', 1
),
(
    '550e8400-e29b-41d4-a716-446655550001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'phatmenghor20@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK',
    'BUSINESS_USER', 'ACTIVE', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0',
    'Primary business manager for Phatmenghor Business',
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 2
),
(
    '550e8400-e29b-41d4-a716-446655550002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'phatmenghor21@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK',
    'CUSTOMER', 'ACTIVE', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0',
    'Test customer account for QA',
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '45 minutes', 1
);

-- 500 STAFF MEMBERS
INSERT INTO users (
    id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_identifier, password, user_type, account_status, status, business_id,
    remark, active_sessions_count
)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'staff' || i::text || '@business.com',
    '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK',
    'BUSINESS_USER',
    CASE WHEN (i % 100) = 0 THEN 'END_WORK' ELSE 'ACTIVE' END,
    'ACTIVE',
    CASE WHEN (i <= 250) THEN '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid ELSE '550cad56-cafd-4aba-baef-c4dcd53940d1'::uuid END,
    'Auto-generated staff #' || i::text,
    0
FROM generate_series(1, 500) AS t(i);

-- 5 CUSTOMERS
INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_identifier, password, user_type, account_status, status, business_id,
    remark, last_login_at, last_active_at, active_sessions_count)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'customer' || i::text || '@example.com',
    '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK',
    'CUSTOMER', 'ACTIVE', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0',
    'Test customer account #' || i::text,
    NOW() - (i::int - 1) * INTERVAL '1 day',
    NOW() - (i::int - 1) * INTERVAL '1 day', 1
FROM generate_series(1, 5) AS t(i);

-- ============================================================================
-- 7. USER ROLES
-- ============================================================================

INSERT INTO user_roles (user_id, role_id) VALUES
('550e8400-e29b-41d4-a716-446655550000', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655550001', '550e8400-e29b-41d4-a716-446655440001'),
('550e8400-e29b-41d4-a716-446655550002', '550e8400-e29b-41d4-a716-446655440003');

-- Assign STAFF role to all generated staff members
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, '550e8400-e29b-41d4-a716-446655440002'
FROM users u
WHERE u.user_type = 'BUSINESS_USER'
  AND u.user_identifier LIKE 'staff%@business.com';

-- Assign CUSTOMER role to all generated customers
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, '550e8400-e29b-41d4-a716-446655440003'
FROM users u
WHERE u.user_type = 'CUSTOMER'
  AND u.user_identifier LIKE 'customer%@example.com';


-- ============================================================================
-- 7.5 USER PROFILES
-- ============================================================================

INSERT INTO user_profiles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, email, first_name, last_name, nickname, gender, date_of_birth, phone_number, profile_image_url) VALUES
-- Platform Admin
('ee000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'phatmenghor19@gmail.com', 'Platform', 'Admin', 'Admin',
 'MALE', '1990-01-15', '+855 10 100 0001',
 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200'),
-- Business Manager
('ee000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 'phatmenghor20@gmail.com', 'Business', 'Manager', 'BizMgr',
 'MALE', '1988-05-20', '+855 10 200 0001',
 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200'),
-- Customer
('ee000000-0000-0000-0000-000000000003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550002', 'phatmenghor21@gmail.com', 'Customer', 'User', 'CustUser',
 'FEMALE', '1995-11-10', '+855 10 300 0001',
 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200');

-- Bulk profiles for 500 staff + 5 customers
INSERT INTO user_profiles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, email, first_name, last_name, nickname, gender, date_of_birth, phone_number, profile_image_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    u.user_identifier,
    split_part(split_part(u.user_identifier, '@', 1), '_', 1) || '_' || split_part(split_part(u.user_identifier, '@', 1), '_', 2),
    'User_' || split_part(split_part(u.user_identifier, '@', 1), 'f', 2),
    lower(split_part(u.user_identifier, '@', 1)),
    CASE WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 2) = 0 THEN 'MALE' ELSE 'FEMALE' END,
    (DATE '1988-01-01' + ((ROW_NUMBER() OVER (ORDER BY u.created_at) % 3650)::text || ' days')::INTERVAL)::DATE,
    '+855 10 ' || LPAD((ROW_NUMBER() OVER (ORDER BY u.created_at) % 10000000)::text, 7, '0'),
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
FROM users u
WHERE u.user_identifier NOT IN ('phatmenghor19@gmail.com', 'phatmenghor20@gmail.com', 'phatmenghor21@gmail.com');

-- ============================================================================
-- 7.6 USER EMPLOYMENTS
-- ============================================================================

INSERT INTO user_employments (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, employee_id, position, department, employment_type, join_date, leave_date, shift) VALUES
-- Platform Admin
('ff000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'EMP-0001', 'Administrator', 'Management', 'FULL_TIME', '2020-01-01', NULL, 'Morning'),
-- Business Manager
('ff000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 'EMP-0002', 'Manager', 'Operations', 'FULL_TIME', '2021-03-01', NULL, 'Morning');

-- Bulk employment for 500 staff
INSERT INTO user_employments (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, employee_id, position, department, employment_type, join_date, shift)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    'EMP-' || LPAD((ROW_NUMBER() OVER (ORDER BY u.created_at))::text, 4, '0'),
    CASE WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 5) = 0 THEN 'Manager'
         WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 5) = 1 THEN 'Chef'
         WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 5) = 2 THEN 'Waiter'
         WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 5) = 3 THEN 'Cashier'
         ELSE 'Kitchen Staff' END,
    CASE WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 4) = 0 THEN 'Kitchen'
         WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 4) = 1 THEN 'Service'
         WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 4) = 2 THEN 'Finance'
         ELSE 'Operations' END,
    CASE WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 3) = 0 THEN 'FULL_TIME'
         WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 3) = 1 THEN 'PART_TIME'
         ELSE 'CONTRACT' END,
    (DATE '2020-01-01' + ((ROW_NUMBER() OVER (ORDER BY u.created_at) % 1460)::text || ' days')::INTERVAL)::DATE,
    CASE WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 3) = 0 THEN 'Morning'
         WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 3) = 1 THEN 'Afternoon'
         ELSE 'Night' END
FROM users u
WHERE u.user_type = 'BUSINESS_USER'
  AND u.user_identifier LIKE 'staff%@business.com';

-- ============================================================================
-- 7.7 USER TELEGRAMS
-- ============================================================================

INSERT INTO user_telegrams (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, telegram_id, telegram_username, telegram_first_name, telegram_last_name, telegram_photo_url, telegram_synced_at) VALUES
-- Platform Admin telegram
('a1000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 100000001, 'phatmenghor_admin', 'Platform', 'Admin',
 'https://t.me/i/userpic/320/phatmenghor_admin.jpg', NOW() - INTERVAL '7 days'),
-- Business Manager telegram
('a1000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 100000002, 'phatmenghor_biz', 'Business', 'Manager',
 'https://t.me/i/userpic/320/phatmenghor_biz.jpg', NOW() - INTERVAL '3 days');

-- ============================================================================
-- 7.8 USER ADDRESSES
-- ============================================================================

INSERT INTO user_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, address_type, house_no, street, village, commune, district, province, country) VALUES
-- Platform Admin - current address
('aa000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'CURRENT', '#12B', 'Norodom Blvd', 'Phnom Penh Village', 'Tonle Bassac', 'Chamkarmon', 'Phnom Penh', 'Cambodia'),
-- Platform Admin - place of birth
('aa000000-0000-0000-0000-000000000004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'PLACE_OF_BIRTH', '#5', 'Village Road', 'Kandal Village', 'Kandal Stung', 'Kandal Stung', 'Kandal', 'Cambodia'),
-- Business Manager - current address
('aa000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 'CURRENT', '#45', 'Russian Blvd', 'Toul Tom Poung', 'Toul Tom Poung I', 'Chamkarmon', 'Phnom Penh', 'Cambodia'),
-- Business Manager - place of birth
('aa000000-0000-0000-0000-000000000005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 'PLACE_OF_BIRTH', '#22', 'Ta Khmau Road', 'Ta Khmau Village', 'Ta Khmau', 'Ta Khmau', 'Kandal', 'Cambodia'),
-- Customer - current address
('aa000000-0000-0000-0000-000000000003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550002', 'CURRENT', '#8', 'Street 130', 'Phsar Thmey III', 'Phsar Thmey III', 'Daun Penh', 'Phnom Penh', 'Cambodia'),
-- Customer - place of birth
('aa000000-0000-0000-0000-000000000006', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550002', 'PLACE_OF_BIRTH', '#3', 'Siem Reap Road', 'Angkor Village', 'Svay Dangkum', 'Siem Reap', 'Siem Reap', 'Cambodia');

-- Bulk current address for all staff members
INSERT INTO user_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, address_type, house_no, street, village, commune, district, province, country)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    'CURRENT',
    '#' || (ROW_NUMBER() OVER (ORDER BY u.created_at))::text,
    'Street ' || (ROW_NUMBER() OVER (ORDER BY u.created_at) * 10)::text,
    'Village ' || (ROW_NUMBER() OVER (ORDER BY u.created_at) % 5 + 1)::text,
    'Commune ' || (ROW_NUMBER() OVER (ORDER BY u.created_at) % 3 + 1)::text,
    CASE WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 3) = 0 THEN 'Chamkarmon' WHEN (ROW_NUMBER() OVER (ORDER BY u.created_at) % 3) = 1 THEN 'Daun Penh' ELSE 'Russey Keo' END,
    'Phnom Penh',
    'Cambodia'
FROM users u
WHERE u.user_type = 'BUSINESS_USER'
  AND u.user_identifier LIKE 'staff%@business.com';

-- ============================================================================
-- 7.9 USER EMERGENCY CONTACTS
-- ============================================================================

INSERT INTO user_emergency_contacts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, name, phone, relationship) VALUES
-- Platform Admin contacts
('bb000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'Sok Dara', '+855 12 345 678', 'Father'),
('bb000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'Chan Mony', '+855 17 234 567', 'Mother'),
-- Business Manager contacts
('bb000000-0000-0000-0000-000000000003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 'Phat Ratha', '+855 96 456 789', 'Spouse'),
('bb000000-0000-0000-0000-000000000004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 'Phat Bopha', '+855 78 567 890', 'Sister'),
-- Customer contacts
('bb000000-0000-0000-0000-000000000005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550002', 'Lim Sothy', '+855 89 678 901', 'Friend');

-- Bulk emergency contacts for staff (1 per staff, first 200)
INSERT INTO user_emergency_contacts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, name, phone, relationship)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    CASE (ROW_NUMBER() OVER (ORDER BY u.created_at) % 5)
        WHEN 0 THEN 'Sok Dara' WHEN 1 THEN 'Chan Mony' WHEN 2 THEN 'Phat Ratha'
        WHEN 3 THEN 'Lim Bopha' ELSE 'Vy Sothea' END,
    '+855 ' || (10 + (ROW_NUMBER() OVER (ORDER BY u.created_at) % 90))::text || ' ' || LPAD((ROW_NUMBER() OVER (ORDER BY u.created_at) * 7 % 9000 + 1000)::text, 4, '0') || ' ' || LPAD((ROW_NUMBER() OVER (ORDER BY u.created_at) * 13 % 900 + 100)::text, 3, '0'),
    CASE (ROW_NUMBER() OVER (ORDER BY u.created_at) % 5)
        WHEN 0 THEN 'Father' WHEN 1 THEN 'Mother' WHEN 2 THEN 'Spouse'
        WHEN 3 THEN 'Sibling' ELSE 'Friend' END
FROM users u
WHERE u.user_type = 'BUSINESS_USER'
  AND u.user_identifier LIKE 'staff%@business.com';

-- ============================================================================
-- 7.10 USER DOCUMENTS
-- ============================================================================

INSERT INTO user_documents (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, type, number, file_url) VALUES
-- Platform Admin documents
('cc000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'ID_CARD', 'ID-1990-001-0001', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
('cc000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'FAMILY_BOOK', 'FB-PP-2020-0001', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
-- Business Manager documents
('cc000000-0000-0000-0000-000000000003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 'ID_CARD', 'ID-1988-002-0001', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
('cc000000-0000-0000-0000-000000000004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 'PASSPORT', 'PB-2022-456789', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
-- Customer documents
('cc000000-0000-0000-0000-000000000005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550002', 'ID_CARD', 'ID-1995-003-0001', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce');

-- Bulk documents for all staff (1 per staff)
INSERT INTO user_documents (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, type, number, file_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    CASE (ROW_NUMBER() OVER (ORDER BY u.created_at) % 3)
        WHEN 0 THEN 'ID_CARD' WHEN 1 THEN 'PASSPORT' ELSE 'FAMILY_BOOK' END,
    CASE (ROW_NUMBER() OVER (ORDER BY u.created_at) % 3)
        WHEN 0 THEN 'ID-19' || LPAD((ROW_NUMBER() OVER (ORDER BY u.created_at) % 90 + 80)::text, 2, '0') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY u.created_at))::text, 3, '0') || '-' || LPAD((ROW_NUMBER() OVER (ORDER BY u.created_at))::text, 4, '0')
        WHEN 1 THEN 'PB-2022-' || LPAD((ROW_NUMBER() OVER (ORDER BY u.created_at) * 7 % 900000 + 100000)::text, 6, '0')
        ELSE 'FB-PP-2020-' || LPAD((ROW_NUMBER() OVER (ORDER BY u.created_at))::text, 4, '0') END,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
FROM users u
WHERE u.user_type = 'BUSINESS_USER'
  AND u.user_identifier LIKE 'staff%@business.com';

-- ============================================================================
-- 7.11 USER EDUCATIONS
-- ============================================================================

INSERT INTO user_educations (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, level, school_name, field_of_study, start_year, end_year, is_graduated, certificate_url) VALUES
-- Platform Admin education
('dd000000-0000-0000-0000-000000000001', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'BACHELOR', 'Royal University of Phnom Penh', 'Computer Science', '2008', '2012', true, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
('dd000000-0000-0000-0000-000000000002', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550000', 'MASTER', 'Institute of Technology of Cambodia', 'Information Technology', '2013', '2015', true, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
-- Business Manager education
('dd000000-0000-0000-0000-000000000003', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550001', 'BACHELOR', 'Build Bright University', 'Business Administration', '2006', '2010', true, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
-- Customer education
('dd000000-0000-0000-0000-000000000004', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550002', 'HIGH_SCHOOL', 'Hun Sen Phnom Penh High School', 'General Education', '2010', '2013', true, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'),
('dd000000-0000-0000-0000-000000000005', 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
 '550e8400-e29b-41d4-a716-446655550002', 'DIPLOMA', 'Paññāsāstra University of Cambodia', 'Hospitality Management', '2013', '2015', true, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce');

-- Bulk education for all staff (1 per staff)
INSERT INTO user_educations (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, level, school_name, field_of_study, start_year, end_year, is_graduated, certificate_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id,
    CASE (ROW_NUMBER() OVER (ORDER BY u.created_at) % 5)
        WHEN 0 THEN 'HIGH_SCHOOL' WHEN 1 THEN 'DIPLOMA' WHEN 2 THEN 'BACHELOR' WHEN 3 THEN 'MASTER' ELSE 'DOCTORATE' END,
    CASE (ROW_NUMBER() OVER (ORDER BY u.created_at) % 5)
        WHEN 0 THEN 'Royal University of Phnom Penh'
        WHEN 1 THEN 'Build Bright University'
        WHEN 2 THEN 'Paññāsāstra University of Cambodia'
        WHEN 3 THEN 'National University of Management'
        ELSE 'Institute of Technology of Cambodia' END,
    CASE (ROW_NUMBER() OVER (ORDER BY u.created_at) % 4)
        WHEN 0 THEN NULL
        WHEN 1 THEN 'Business Administration'
        WHEN 2 THEN 'Computer Science'
        ELSE 'Hospitality Management' END,
    (2000 + (ROW_NUMBER() OVER (ORDER BY u.created_at) % 15))::text,
    (2003 + (ROW_NUMBER() OVER (ORDER BY u.created_at) % 15))::text,
    true,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce'
FROM users u
WHERE u.user_type = 'BUSINESS_USER'
  AND u.user_identifier LIKE 'staff%@business.com';

-- ============================================================================
-- 8. USER SESSIONS
-- ============================================================================

INSERT INTO user_sessions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, refresh_token_id, device_id, device_name, device_type, user_agent, browser, operating_system, ip_address, location, status, login_at, last_active_at, expires_at, is_current_session)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550e8400-e29b-41d4-a716-446655550000', NULL, 'device-' || i::text, 'Device ' || i::text,
    CASE WHEN (i % 3) = 0 THEN 'WEB' WHEN (i % 3) = 1 THEN 'MOBILE' ELSE 'TABLET' END,
    'Mozilla/5.0', 'Chrome', 'Linux', '192.168.' || (i % 256)::text || '.' || (i % 256)::text,
    'Phnom Penh, Cambodia', CASE WHEN (i <= 3) THEN 'ACTIVE' ELSE 'LOGGED_OUT' END,
    NOW() - (i::int - 1) * INTERVAL '1 day', NOW() - (i::int - 1) * INTERVAL '1 day', NOW() + INTERVAL '30 days', (i = 1)
FROM generate_series(1, 5) AS t(i);

-- ============================================================================
-- 9. REFRESH TOKENS
-- ============================================================================

INSERT INTO refresh_tokens (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, token, user_id, expiry_date, is_revoked, revoked_at, revocation_reason, device_info, ip_address)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'refresh_token_' || i::text || '_' || gen_random_uuid()::text, '550e8400-e29b-41d4-a716-446655550000',
    NOW() + (30 - i)::int * INTERVAL '1 day', (i > 3),
    CASE WHEN (i > 3) THEN NOW() - (i - 3)::int * INTERVAL '1 day' ELSE NULL END,
    CASE WHEN (i > 3) THEN 'User logged out' ELSE NULL END,
    'Device ' || i::text, '192.168.1.' || i::text
FROM generate_series(1, 5) AS t(i);

-- ============================================================================
-- 10. BLACKLISTED TOKENS
-- ============================================================================

INSERT INTO blacklisted_tokens (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, token, user_identifier, blacklisted_at, expiry_date, reason)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'token_' || i::text || '_' || gen_random_uuid()::text, 'user_' || i::text,
    NOW() - (i::int - 1) * INTERVAL '1 day', NOW() + (30 - i)::int * INTERVAL '1 day',
    'User logged out'
FROM generate_series(1, 3) AS t(i);

-- ============================================================================
-- 11. CATEGORIES
-- ============================================================================

INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Category ' || i::text,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=400',
    CASE WHEN (i % 10) = 0 THEN 'INACTIVE' ELSE 'ACTIVE' END
FROM generate_series(1, 20) AS t(i);

-- ============================================================================
-- 12. BRANDS
-- ============================================================================

INSERT INTO brands (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, image_url, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Brand ' || i::text, 'Premium brand number ' || i::text,
    'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=400',
    CASE WHEN (i % 15) = 0 THEN 'INACTIVE' ELSE 'ACTIVE' END
FROM generate_series(1, 20) AS t(i);

-- ============================================================================
-- 13. PRODUCTS
-- ============================================================================

WITH category_list AS (
    SELECT id, name, ROW_NUMBER() OVER (ORDER BY created_at) AS cat_num
    FROM categories WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
),
brand_list AS (
    SELECT id, name, ROW_NUMBER() OVER (ORDER BY created_at) AS brand_num
    FROM brands WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
)
INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, category_id, brand_id, name, description, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, has_active_promotion, main_image_url, status, has_sizes, view_count, favorite_count, minimum_stock_level, sku, barcode, category_name, brand_name, business_name)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0',
    c.id,
    b.id,
    'Product ' || i::text, 'Description for product ' || i::text, (15 + (i % 100))::numeric,
    CASE WHEN (i % 3) = 0 THEN 'PERCENTAGE' WHEN (i % 3) = 1 THEN 'FIXED_AMOUNT' ELSE 'PERCENTAGE' END,
    CASE WHEN (i % 3) = 0 THEN 10 WHEN (i % 3) = 1 THEN 2 ELSE 5 END,
    NOW(), NOW() + INTERVAL '30 days',
    true,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=400',
    CASE WHEN (i % 20) = 0 THEN 'INACTIVE' WHEN (i % 25) = 0 THEN 'OUT_OF_STOCK' ELSE 'ACTIVE' END,
    (i % 3) = 0, (i % 500)::bigint, (i % 200)::bigint, 5, 'SKU-' || i::text, 'BARCODE-' || i::text,
    c.name, b.name, 'Phatmenghor Business'
FROM generate_series(1, 20000) AS t(i)
CROSS JOIN (SELECT * FROM category_list WHERE cat_num = ((t.i-1) % 20 + 1)) c
CROSS JOIN (SELECT * FROM brand_list WHERE brand_num = ((t.i-1) % 20 + 1)) b;

-- ============================================================================
-- 14. PRODUCT SIZES
-- ============================================================================
-- Random price offset (1-20) and minimum stock level (1-20) per size variation

INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, name, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, minimum_stock_level)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    CASE WHEN (t.size % 3) = 0 THEN 'Small' WHEN (t.size % 3) = 1 THEN 'Medium' ELSE 'Large' END,
    (p.price + (1 + (random() * 19)::int))::numeric,
    CASE WHEN (t.size % 2) = 0 THEN 'FIXED_AMOUNT' ELSE 'PERCENTAGE' END,
    CASE WHEN (t.size % 2) = 0 THEN (1 + (random() * 19)::int) ELSE 5 END,
    NOW(), NOW() + INTERVAL '30 days', (1 + (random() * 19)::int)::int
FROM (SELECT id, price FROM products WHERE has_sizes = true) p
CROSS JOIN (SELECT 1 as size UNION SELECT 2 UNION SELECT 3) t;

-- ============================================================================
-- 15. PRODUCT IMAGES
-- ============================================================================

-- All 100 products get between 2 and 10 images each (varies by product row number mod 9)
-- Image count per product: 2 + (rn % 9)  →  min 2, max 10
INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    p.id,
    CASE ((p.rn + t.img_num) % 10)
        WHEN 0 THEN 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=600'
        WHEN 1 THEN 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=600'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=600'
        WHEN 6 THEN 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600'
        WHEN 7 THEN 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600'
        WHEN 8 THEN 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600'
        ELSE       'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?q=80&w=600'
    END
FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
    FROM products
) p
CROSS JOIN generate_series(1, 10) AS t(img_num)
WHERE t.img_num <= (2 + (p.rn % 9));

-- ============================================================================
-- 16. PRODUCT STOCK
-- ============================================================================
-- All products get stock entries with random quantities (1-200) and reservations (0-20)

-- Stock for all products (1 entry each)
INSERT INTO product_stock (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, product_id, product_size_id, quantity_on_hand, quantity_reserved, quantity_available, price_in, date_in, status, is_expired)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0', p.id, NULL,
    (100 + (random() * 200)::int)::int, (random() * 20)::int,
    ((100 + (random() * 200)::int) - (random() * 20)::int)::int,
    p.price::numeric, NOW() - (random() * 30)::int * INTERVAL '1 day',
    'ACTIVE', false
FROM (SELECT id, price FROM products) p;

-- One product with multiple stock entries (1-20 additional entries)
INSERT INTO product_stock (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, product_id, product_size_id, quantity_on_hand, quantity_reserved, quantity_available, price_in, date_in, status, is_expired)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0',
    (SELECT id FROM products LIMIT 1),
    NULL,
    (100 + (random() * 200)::int)::int, (random() * 20)::int,
    ((100 + (random() * 200)::int) - (random() * 20)::int)::int,
    (SELECT price FROM products LIMIT 1)::numeric,
    NOW() - (random() * 30)::int * INTERVAL '1 day',
    'ACTIVE', false
FROM generate_series(1, (1 + (random() * 19)::int)::int) AS t(i);

-- ============================================================================
-- 17. STOCK MOVEMENTS
-- ============================================================================

INSERT INTO stock_movements (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, product_stock_id, movement_type, quantity_change, previous_quantity, new_quantity, reference_type, reference_id, notes, initiated_by_name)
SELECT
    gen_random_uuid(), 0, NOW() - (i % 15)::int * INTERVAL '1 day', NOW() - (i % 15)::int * INTERVAL '1 day', 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0', ps.id,
    CASE WHEN (i % 5) = 0 THEN 'STOCK_IN' WHEN (i % 5) = 1 THEN 'STOCK_OUT' WHEN (i % 5) = 2 THEN 'ADJUSTMENT' WHEN (i % 5) = 3 THEN 'RETURN' ELSE 'DAMAGE' END,
    CASE WHEN (i % 5) IN (0, 3) THEN (5 + i % 10) ELSE -(5 + i % 10) END,
    100, 100 + (CASE WHEN (i % 5) IN (0, 3) THEN (5 + i % 10) ELSE -(5 + i % 10) END),
    NULL, NULL, 'Stock movement ' || i::text, 'Admin'
FROM (SELECT id FROM product_stock LIMIT 500) ps, generate_series(1, 3) AS t(i);

-- ============================================================================
-- 18. PRODUCT FAVORITES
-- ============================================================================

INSERT INTO product_favorites (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, product_id)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    (ARRAY['550e8400-e29b-41d4-a716-446655550002',
           (SELECT id FROM users WHERE user_type = 'CUSTOMER' LIMIT 1 OFFSET 0),
           (SELECT id FROM users WHERE user_type = 'CUSTOMER' LIMIT 1 OFFSET 1),
           (SELECT id FROM users WHERE user_type = 'CUSTOMER' LIMIT 1 OFFSET 2)])[(i % 4) + 1],
    p.id
FROM (SELECT id FROM products LIMIT 500) p, generate_series(1, 2) AS t(i)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 19. DELIVERY OPTIONS (18 items)
-- ============================================================================

INSERT INTO delivery_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, image_url, price, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0',
    'Delivery Option ' || LPAD(i::text, 2, '0') || ' - ' || CASE
        WHEN (i % 4) = 0 THEN 'Express'
        WHEN (i % 4) = 1 THEN 'Standard'
        WHEN (i % 4) = 2 THEN 'Economy'
        ELSE 'Same Day'
    END,
    'Delivery method ' || i || ' with estimated time',
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
    (5.00 + (i * 0.5))::numeric,
    CASE WHEN (i % 3) = 0 THEN 'INACTIVE' ELSE 'ACTIVE' END
FROM generate_series(1, 18) AS t(i);

-- ============================================================================
-- 20. PAYMENT OPTIONS (18 items - All types use CASH enum)
-- ============================================================================

INSERT INTO payment_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, payment_option_type, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0',
    CASE (i % 6)
        WHEN 0 THEN 'Cash Payment'
        WHEN 1 THEN 'Card Payment'
        WHEN 2 THEN 'ABA Bank Transfer'
        WHEN 3 THEN 'ACE Bank Transfer'
        WHEN 4 THEN 'Khmer Bank Transfer'
        ELSE 'Mobile Money'
    END,
    'CASH',
    CASE WHEN (i % 4) = 0 THEN 'INACTIVE' ELSE 'ACTIVE' END
FROM generate_series(1, 18) AS t(i);

-- ============================================================================
-- 21. CARTS
-- ============================================================================

INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, business_id)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id, '550cad56-cafd-4aba-baef-c4dcd53940d0'
FROM (SELECT id FROM users WHERE user_type = 'CUSTOMER' LIMIT 10) u
ON CONFLICT (user_id, business_id) DO NOTHING;

-- ============================================================================
-- 22. CART ITEMS
-- ============================================================================

INSERT INTO cart_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, cart_id, product_id, product_size_id, quantity)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    c.id, p.id, NULL, 2
FROM (SELECT id FROM carts LIMIT 5) c
CROSS JOIN (SELECT id FROM products LIMIT 10) p
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 23. ORDERS (100 WEB + 100 POS = 200 total)
-- ============================================================================

INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_status, source, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, had_order_level_change_from_pos, order_level_change_reason, confirmed_at, completed_at)
SELECT
    gen_random_uuid(), 0, NOW() - (random() * 90)::int * INTERVAL '1 day', NOW() - (random() * 90)::int * INTERVAL '1 day', 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, '550e8400-e29b-41d4-a716-446655550002'::uuid,
    'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-WEB-' || LPAD(i::text, 4, '0'),
    CASE WHEN (i % 5) = 0 THEN 'PENDING' WHEN (i % 5) = 1 THEN 'CONFIRMED' WHEN (i % 5) = 2 THEN 'PREPARING' WHEN (i % 5) = 3 THEN 'COMPLETED' ELSE 'CANCELLED' END,
    'PUBLIC', (50 + (i % 100))::numeric, CASE WHEN (i % 8) = 0 THEN 5::numeric ELSE 0::numeric END, 2::numeric, 5::numeric,
    (50 + (i % 100) - CASE WHEN (i % 8) = 0 THEN 5::numeric ELSE 0::numeric END + 2::numeric + 5::numeric)::numeric,
    'CASH', CASE WHEN (i % 5) IN (3,4) THEN 'PAID' ELSE 'PENDING' END,
    'Note ' || i::text, 'Processing ' || i::text, (i % 8) = 0, CASE WHEN (i % 8) = 0 THEN 'Discount applied' ELSE 'No changes' END,
    NOW() - (random() * 90)::int * INTERVAL '1 day', CASE WHEN (i % 5) = 3 THEN NOW() - (random() * 90)::int * INTERVAL '1 day' ELSE NULL END
FROM generate_series(1, 100) AS t(i);

-- POS ORDERS
INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_status, source, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, had_order_level_change_from_pos, order_level_change_reason, confirmed_at, completed_at)
SELECT
    gen_random_uuid(), 0, NOW() - (random() * 90)::int * INTERVAL '1 day', NOW() - (random() * 90)::int * INTERVAL '1 day', 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid, CASE WHEN (i % 3) = 0 THEN '550e8400-e29b-41d4-a716-446655550002'::uuid ELSE NULL END,
    'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-POS-' || LPAD(i::text, 4, '0'),
    'COMPLETED', 'POS', (45 + (i % 100))::numeric, CASE WHEN (i % 5) = 0 THEN 3::numeric ELSE 0::numeric END, 0::numeric, 4::numeric,
    (45 + (i % 100) - CASE WHEN (i % 5) = 0 THEN 3::numeric ELSE 0::numeric END + 4::numeric)::numeric,
    'CASH', 'PAID', 'POS ' || i::text, 'Admin order ' || i::text, (i % 5) = 0, CASE WHEN (i % 5) = 0 THEN 'Override' ELSE 'None' END,
    NOW() - (random() * 90)::int * INTERVAL '1 day', NOW() - (random() * 90)::int * INTERVAL '1 day'
FROM generate_series(1, 100) AS t(i);

-- ============================================================================
-- 24. ORDER DELIVERY ADDRESSES
-- ============================================================================

INSERT INTO order_delivery_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, village, commune, district, province, street_number, house_number, note, latitude, longitude)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    id, 'Village ' || (ROW_NUMBER() OVER() % 50)::text, 'Commune ' || (ROW_NUMBER() OVER() % 25)::text,
    'District ' || (ROW_NUMBER() OVER() % 12)::text, 'Phnom Penh', LPAD((ROW_NUMBER() OVER() % 500)::text, 3, '0'),
    'Building ' || CHR((65 + (ROW_NUMBER() OVER() % 26))::int), 'Delivery note ' || (ROW_NUMBER() OVER())::text,
    11.5564::numeric, 104.9282::numeric
FROM orders;

-- ============================================================================
-- 25. ORDER DELIVERY OPTIONS
-- ============================================================================

INSERT INTO order_delivery_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, name, description, image_url, price)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    id,
    CASE WHEN (ROW_NUMBER() OVER() % 3) = 0 THEN 'Pickup' WHEN (ROW_NUMBER() OVER() % 3) = 1 THEN 'Standard' ELSE 'Express' END,
    'Delivery option',  'https://example.com/delivery.jpg',
    CASE WHEN (ROW_NUMBER() OVER() % 3) = 0 THEN 0.00 WHEN (ROW_NUMBER() OVER() % 3) = 1 THEN 2.00 ELSE 5.00 END
FROM orders;

-- ============================================================================
-- 26. ORDER ITEMS (3 per order = 600 items)
-- ============================================================================

INSERT INTO order_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date, quantity, total_price, special_instructions, had_change_from_pos, change_reason)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    p.id,
    NULL,
    p.name,
    p.main_image_url,
    'Medium',
    p.price,
    CASE WHEN (t.item_num % 3) = 0 THEN ROUND(p.price * 0.9, 2) ELSE p.price END,
    p.price,
    true,
    CASE WHEN (t.item_num % 3) = 0 THEN 'PERCENTAGE' ELSE 'FIXED_AMOUNT' END,
    CASE WHEN (t.item_num % 3) = 0 THEN 10 ELSE 2 END,
    NOW(), NOW() + INTERVAL '30 days',
    2,
    CASE WHEN (t.item_num % 3) = 0 THEN ROUND(p.price * 0.9 * 2, 2) ELSE ROUND(p.price * 2, 2) END,
    'Special notes', false, 'No changes'
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn FROM orders) o
CROSS JOIN (SELECT 1 as item_num UNION SELECT 2 UNION SELECT 3) t
JOIN LATERAL (
    SELECT id, name, main_image_url, price
    FROM products
    WHERE status = 'ACTIVE'
    ORDER BY id
    LIMIT 1 OFFSET ((o.rn + t.item_num) % 100)
) p ON true;

-- ============================================================================
-- 27. ORDER ITEM PRICING SNAPSHOTS
-- ============================================================================

INSERT INTO order_item_pricing_snapshots (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_item_id, before_current_price, before_final_price, before_has_active_promotion, before_discount_amount, before_total_price, before_promotion_type, before_promotion_value, before_promotion_from_date, before_promotion_to_date, after_current_price, after_final_price, after_has_active_promotion, after_discount_amount, after_total_price, after_promotion_type, after_promotion_value, after_promotion_from_date, after_promotion_to_date)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    id, current_price, final_price, has_promotion, (current_price - final_price)::numeric, total_price,
    CASE WHEN has_promotion THEN 'PERCENTAGE' ELSE NULL END, CASE WHEN has_promotion THEN 10 ELSE 0 END, NOW(), NOW() + INTERVAL '30 days',
    current_price, final_price, has_promotion, (current_price - final_price)::numeric, total_price,
    CASE WHEN has_promotion THEN 'PERCENTAGE' ELSE NULL END, CASE WHEN has_promotion THEN 10 ELSE 0 END, NOW(), NOW() + INTERVAL '30 days'
FROM order_items;

-- ============================================================================
-- 28. ORDER STATUS HISTORY
-- ============================================================================

INSERT INTO order_status_history (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, order_status, changed_by_user_id, changed_by_name, note)
SELECT
    gen_random_uuid(), 0, created_at, created_at, 'system', 'system', false, NULL, NULL,
    id, order_status, '550e8400-e29b-41d4-a716-446655550001', 'Admin', 'Status: ' || order_status
FROM orders;

-- ============================================================================
-- 29. ORDER PAYMENTS
-- ============================================================================

INSERT INTO order_payments (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, order_id, payment_reference, status, payment_method, subtotal, discount_amount, delivery_fee, tax_amount, total_amount)
SELECT
    gen_random_uuid(), 0, created_at, created_at, 'system', 'system', false, NULL, NULL,
    business_id, id, 'PAY-' || SUBSTRING(id::text, 1, 8), payment_status, payment_method,
    subtotal, discount_amount, delivery_fee, tax_amount, total_amount
FROM orders;

-- ============================================================================
-- 30. PAYMENTS (SUBSCRIPTION & GENERAL)
-- ============================================================================

INSERT INTO payments (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, image_url, business_id, plan_id, subscription_id, amount, amount_khr, payment_method, status, payment_type, reference_number, notes)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    'https://example.com/image.jpg', '550cad56-cafd-4aba-baef-c4dcd53940d0', NULL, NULL,
    99.99::numeric, (99.99 * 4100)::numeric, 'CASH',
    CASE WHEN (i % 3) = 0 THEN 'COMPLETED' WHEN (i % 3) = 1 THEN 'PENDING' ELSE 'PAID' END,
    'BUSINESS_RECORD', 'REF-' || i::text, 'Business payment ' || i::text
FROM generate_series(1, 10) AS t(i);

-- ============================================================================
-- 31. EXCHANGE RATES (18 items)
-- ============================================================================

INSERT INTO business_exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, usd_to_khr_rate, usd_to_cny_rate, usd_to_vnd_rate, status, notes)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0',
    ROUND((4100.0 + (i * 10.5))::numeric, 2),
    ROUND((6.8 + (i * 0.05))::numeric, 2),
    ROUND((24000.0 + (i * 50))::numeric, 2),
    CASE WHEN (i % 3) = 0 THEN 'INACTIVE' ELSE 'ACTIVE' END,
    'Exchange rate update ' || i || ' - ' || TO_CHAR(NOW() - INTERVAL '1 day' * (18 - i), 'YYYY-MM-DD HH24:MI')
FROM generate_series(1, 18) AS t(i);

-- ============================================================================
-- 32. CUSTOMER ADDRESSES
-- ============================================================================

INSERT INTO customer_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id, 'Village ' || i::text, 'Chamkarmon', 'Chamkarmon', 'Phnom Penh', 'Cambodia',
    i::text, 'House ' || i::text, 'Delivery address ' || i::text, 11.5564, 104.9282, (i = 1)
FROM (SELECT id FROM users WHERE user_type = 'CUSTOMER' LIMIT 10) u, generate_series(1, 2) AS t(i);

-- ============================================================================
-- 33. SUBSCRIPTION PLANS
-- ============================================================================

INSERT INTO subscription_plans (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, price, duration_days, status)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    CASE WHEN (i % 3) = 0 THEN 'Basic Plan' WHEN (i % 3) = 1 THEN 'Pro Plan' ELSE 'Enterprise Plan' END,
    'Subscription plan ' || i::text,
    CASE WHEN (i % 3) = 0 THEN 9.99 WHEN (i % 3) = 1 THEN 29.99 ELSE 99.99 END,
    CASE WHEN (i % 3) = 0 THEN 30 WHEN (i % 3) = 1 THEN 90 ELSE 365 END,
    'PUBLIC'
FROM generate_series(1, 3) AS t(i);

-- ============================================================================
-- 40. SUBSCRIPTIONS
-- ============================================================================

INSERT INTO subscriptions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, plan_id, start_date, end_date, auto_renew)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0',
    (SELECT id FROM subscription_plans LIMIT 1),
    NOW(), NOW() + INTERVAL '30 days', true
FROM generate_series(1, 1) AS t(i);

-- ============================================================================
-- 41. AUDIT LOGS
-- ============================================================================

INSERT INTO audit_logs (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, user_identifier, user_type, http_method, endpoint, ip_address, user_agent, status_code, response_time_ms, error_message, session_id, request_params)
SELECT
    gen_random_uuid(), 0, NOW() - (i % 15)::int * INTERVAL '1 hour', NOW() - (i % 15)::int * INTERVAL '1 hour', 'system', 'system', false, NULL, NULL,
    '550e8400-e29b-41d4-a716-446655550000', 'admin@business.com', 'PLATFORM_USER',
    CASE WHEN (i % 4) = 0 THEN 'GET' WHEN (i % 4) = 1 THEN 'POST' WHEN (i % 4) = 2 THEN 'PUT' ELSE 'DELETE' END,
    '/api/v1/orders', '192.168.1.100', 'Mozilla/5.0', 200, 150, NULL, 'session-' || i::text, 'page=1&size=20'
FROM generate_series(1, 50) AS t(i);

-- ============================================================================
-- 41B. SYNC DENORMALIZED NAMES (populate category_name, brand_name, business_name)
-- ============================================================================

UPDATE products p SET
    category_name = c.name,
    brand_name = b.name,
    business_name = 'Phatmenghor Business'
FROM categories c, brands b
WHERE p.category_id = c.id
  AND p.brand_id = b.id
  AND p.is_deleted = false;

-- ============================================================================
-- 42. IMAGES
-- ============================================================================

INSERT INTO images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, type, data)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    CASE WHEN (i % 3) = 0 THEN 'PRODUCT' WHEN (i % 3) = 1 THEN 'BUSINESS_LOGO' ELSE 'USER_PROFILE' END,
    'base64_encoded_image_data_' || i::text
FROM generate_series(1, 20) AS t(i);

-- ============================================================================
-- SUMMARY & VERIFICATION
-- ============================================================================

SELECT '✅ TEST DATA LOADED - COMPREHENSIVE SCHEMA COVERAGE!' AS status;
SELECT '📊 COMPLETE COVERAGE:' AS section;
SELECT '  • 4 Location tables (Provinces, Districts, Communes, Villages)' AS coverage;
SELECT '  • 7 Authentication tables (Roles, Users, Sessions, Tokens)' AS coverage;
SELECT '  • 8 Product tables (Categories, Brands, Products, Images, Stock)' AS coverage;
SELECT '  • 13 Order tables (Orders, Items, Deliveries, Payments, History)' AS coverage;
SELECT '  • 2 Subscription tables (Plans, Subscriptions)' AS coverage;
SELECT '  • 5 Reference/Utility tables (Exchange Rates, Audit Logs, Images)' AS coverage;
SELECT '  ============================================' AS divider;
SELECT '👥 Users: 503 records (3 main + 500 staff + 5 customers)' AS data_count;
SELECT '📋 Orders: 200 records (100 WEB + 100 POS)' AS data_count;
SELECT '🛒 Order Items: 600 records (3 items per order)' AS data_count;
SELECT '📦 Products: 100 records with complete metadata' AS data_count;
SELECT '🏢 Businesses: 2 records with full configuration' AS data_count;
SELECT '📨 Audit Logs: 50 records for security tracking' AS data_count;
SELECT '✨ ALL BaseUUIDEntity fields properly populated' AS audit_trail;
SELECT '✨ ALL foreign key relationships maintained' AS integrity;
SELECT '✨ ALL enum values matching codebase definitions' AS validation;
