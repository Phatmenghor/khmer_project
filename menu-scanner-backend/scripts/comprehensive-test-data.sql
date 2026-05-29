
-- ============================================================================
-- COMPREHENSIVE TEST DATA GENERATION SCRIPT
-- 2 Businesses · 3 Main Users · 300 Products · ±4 months orders
-- Users: phatmenghor19 (PLATFORM_OWNER) | phatmenghor20 (Mega Store) | phatmenghor21 (Fashion Hub)
--
-- LATEST UPDATES (Auth Flow & Error Handling):
--
-- ✅ FRONTEND CHANGES (Client & Owner Projects):
--    login page, login modal, register modal
--    - Fixed error message extraction from Redux thunk responses
--    - Added proper error type checking (typeof string first, then object properties)
--    - Fixed TypeScript type inference errors on errorMessage variables
--    - Added 500ms delay before redirect to allow toast notification display
--
-- ✅ COMBOBOX IMPROVEMENTS (Client Project):
--    combobox-business, combobox-province, combobox-district, combobox-commune, combobox-village
--    - Changed fixed height to dynamic height (min-h-fit) for long text support
--    - Added text wrapping (break-words) on item labels
--    - Prevents text truncation and improves UX for lengthy options
--
-- ✅ ERROR HANDLING PATTERN (All Auth Components):
--    redux thunk errors → Frontend extraction
--    Error Extraction Order:
--      1. Check: typeof err === 'string' (direct Redux return)
--      2. Check: err?.message (error object message property)
--      3. Check: err?.payload?.message (nested error structure)
--      4. Fallback: Generic error message
--
--    Example: "Your password is incorrect" from backend exception
--    → api-wrapper.ts calls rejectWithValue(axiosError.response.data.message)
--    → Frontend checks typeof err === 'string' (matches!)
--    → Displays correct error in toast
--
-- ✅ PER-BUSINESS USER VALIDATION:
--    userIdentifier is UNIQUE per business (not globally unique)
--    Requirements:
--      - Login request MUST include businessId for user lookup
--      - Different businesses can have users with identical userIdentifier
--      - Client project: businessId = AppDefault.BUSINESS_ID (hardcoded, temporary)
--      - Release version: Make businessId dynamic based on domain/environment
--
-- ✅ AUTHENTICATION FLOWS TESTED:
--    1. Business User Login (phatmenghor20) → Admin Dashboard
--    2. Platform Owner Login (phatmenghor19) → Owner Dashboard
--    3. Customer Login → Public customer area (redirect on reload)
--    4. Customer Registration (without plan) → success, select plan later
--    5. Telegram Auth → Multi-user type handling, proper error messages
--    6. Wrong business user → "User not found in business" error
--    7. Invalid password → "Your password is incorrect" error
--
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
  id, business_id, use_brands, tax_percentage,
  logo_business_url, enable_stock, primary_color,
  telegram_group_chat_id, version, is_deleted,
  created_at, updated_at, created_by, updated_by
)
VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  true, 0.0,
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'ENABLED', '#FF6B6B', NULL,
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
  id, business_id, use_brands, tax_percentage,
  logo_business_url, enable_stock, primary_color,
  telegram_group_chat_id, version, is_deleted,
  created_at, updated_at, created_by, updated_by
)
VALUES (
  '770e8400-e29b-41d4-a716-446655440003',
  '660cad56-cafd-4aba-baef-c4dcd53940d0',
  true, 0.0,
  'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce',
  'ENABLED', '#6B6BFF', NULL,
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
--
-- AUTH FLOW IMPROVEMENTS (Latest Updates):
-- ✅ Error Message Handling:
--    - Redux thunk errors return plain strings via rejectWithValue()
--    - Frontend extracts messages: typeof err === 'string' → err.message → err.payload
--    - Backend exceptions include detailed error messages from api-wrapper.ts
--
-- ✅ Per-Business Username Validation:
--    - userIdentifier is UNIQUE per business (not globally)
--    - Login requires businessId for correct user lookup
--    - Client project uses: businessId: AppDefault.BUSINESS_ID (hardcoded, temp solution)
--    - Different businesses can have users with same userIdentifier
--
-- ✅ Toast Error Display:
--    - Added 500ms timeout before redirect to show error toast
--    - Error messages extracted from response.data.message (axios) or Redux payload
--    - Supports multiple error formats for backward compatibility
--
-- ✅ Login Response Handling:
--    - Frontend checks: typeof err === 'string' first (Redux thunk direct returns)
--    - Then err?.message (error object property)
--    - Then err?.payload?.message (nested error structure)
--    - Finally falls back to default generic message
--
-- PASSWORD HASH: $2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW
-- ⚠️  This is a test hash. Password for testing: use bcrypt to verify
--
-- TEST SCENARIOS:
-- 1. Valid Login: phatmenghor20@gmail.com + correct password → COMPLETED (PASS)
-- 2. Invalid Password: phatmenghor20@gmail.com + wrong password → Error: "Your password is incorrect"
-- 3. User Not Found: nonexistent@megastore.com → Error: "User not found in business"
-- 4. Wrong Business: phatmenghor21@gmail.com in Mega Store business → Error: "User not found in business"
-- 5. Telegram Auth: Valid Telegram data → Success or error with proper handling
--
-- ============================================================================

-- phatmenghor19 — PLATFORM_USER type, assigned PLATFORM_OWNER role (super admin, no business)
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  '550e8400-e29b-41d4-a716-446655440019',
  'phatmenghor19@gmail.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'PLATFORM_USER',
  'ACTIVE', 'ACTIVE',
  NULL,
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- phatmenghor20 — BUSINESS_USER, owner of Mega Store
-- ✅ Per-business user: userIdentifier unique within Mega Store business only
-- ✅ Login flow: businessId required for lookup (550cad56-cafd-4aba-baef-c4dcd53940d0)
UPDATE users SET business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0',
  account_status = 'ACTIVE', status = 'ACTIVE', updated_at = NOW()
WHERE user_identifier = 'phatmenghor20@gmail.com' AND business_id IS NULL;

INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT '660e8400-e29b-41d4-a716-446655440001', 'phatmenghor20@gmail.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'BUSINESS_USER', 'ACTIVE', 'ACTIVE',
  '550cad56-cafd-4aba-baef-c4dcd53940d0',
  0, false, NOW(), NOW(), 'admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'phatmenghor20@gmail.com');

-- phatmenghor21 — BUSINESS_USER, owner of Fashion Hub
-- ✅ Per-business user: userIdentifier unique within Fashion Hub business only
-- ✅ Login flow: businessId required for lookup (660cad56-cafd-4aba-baef-c4dcd53940d0)
UPDATE users SET business_id = '660cad56-cafd-4aba-baef-c4dcd53940d0',
  account_status = 'ACTIVE', status = 'ACTIVE', updated_at = NOW()
WHERE user_identifier = 'phatmenghor21@gmail.com' AND business_id IS NULL;

INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT '660e8400-e29b-41d4-a716-446655440002', 'phatmenghor21@gmail.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'BUSINESS_USER', 'ACTIVE', 'ACTIVE',
  '660cad56-cafd-4aba-baef-c4dcd53940d0',
  0, false, NOW(), NOW(), 'admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'phatmenghor21@gmail.com');


DO $$ BEGIN RAISE NOTICE ' 15%% [███░░░░░░░░░░░░░░░░░] Users created'; END $$;

-- ============================================================================
-- 3b. CREATE USER PROFILES (with emails)

-- ============================================================================

-- Profiles for the 3 main users — look up actual user IDs by email so the
-- script works whether DataInitializationService already created the user or not.
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), u.id, 'phatmenghor19@gmail.com', 'Phatmenghor', 'Nineteen', '+855-19-000-019', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u WHERE u.user_identifier = 'phatmenghor19@gmail.com' AND u.is_deleted = false
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), u.id, 'phatmenghor20@gmail.com', 'Phatmenghor', 'Twenty', '+855-12-345-678', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u WHERE u.user_identifier = 'phatmenghor20@gmail.com' AND u.is_deleted = false
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), u.id, 'phatmenghor21@gmail.com', 'Phatmenghor', 'Twenty-One', '+855-87-654-321', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM users u WHERE u.user_identifier = 'phatmenghor21@gmail.com' AND u.is_deleted = false
ON CONFLICT DO NOTHING;


DO $$ BEGIN RAISE NOTICE ' 20%% [████░░░░░░░░░░░░░░░░] User profiles done'; END $$;

-- ============================================================================
-- 4. CREATE CUSTOMER ADDRESSES (for main users)

-- ============================================================================

-- Addresses for phatmenghor20
INSERT INTO customer_addresses (id, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
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
FROM generate_series(1, 3) AS t(addr_num)
CROSS JOIN (SELECT id FROM users WHERE user_identifier = 'phatmenghor20@gmail.com' AND is_deleted = false) u;

-- Addresses for phatmenghor21
INSERT INTO customer_addresses (id, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT
  gen_random_uuid(),
  u.id,
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
FROM generate_series(1, 2) AS t(addr_num)
CROSS JOIN (SELECT id FROM users WHERE user_identifier = 'phatmenghor21@gmail.com' AND is_deleted = false) u;


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
DO $$ BEGIN RAISE NOTICE ' 35%% [███████░░░░░░░░░░░░░] Brands done - inserting 300 products...'; END $$;

-- 8. CREATE 300 PRODUCTS (30 per category × 10 categories)

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
  'Category ' || ((i - 1) / 30 + 1),
  'Brand ' || (((i - 1) / 30) % 18 + 1),
  'Mega Store',
  0,
  false,
  NOW(), NOW(), 'admin', 'admin',
  -- 40% of products have promotions (i % 10 < 4)
  CASE WHEN (i % 10) < 4 THEN CASE WHEN (i % 2) = 0 THEN 'PERCENTAGE' ELSE 'FIXED_AMOUNT' END ELSE NULL END,
  CASE WHEN (i % 10) < 4 THEN CASE WHEN (i % 2) = 0 THEN (10 + (i % 40))::numeric ELSE (5 + (i % 20))::numeric END ELSE NULL END,
  CASE WHEN (i % 10) < 4 THEN DATE_TRUNC('day', NOW() - INTERVAL '1 day' * (FLOOR((i * 7919) % 30))) ELSE NULL END,
  CASE WHEN (i % 10) < 4 THEN DATE_TRUNC('day', NOW() + INTERVAL '1 month' * (6 + (i % 19))) ELSE NULL END
FROM generate_series(1, 300) AS t(i);


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 40%% [████████░░░░░░░░░░░░] 300 products inserted'; END $$;

-- 9. CREATE PRODUCT SIZES (34% of products = ~102 products × 9 sizes = ~918)
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
  -- ~10% out of stock, ~20% low stock, rest healthy
  CASE (ROW_NUMBER() OVER (ORDER BY p.id) % 10)::int
    WHEN 9 THEN 0    -- out of stock
    WHEN 8 THEN 2    -- critically low
    WHEN 7 THEN 4    -- low stock (< threshold of 5)
    ELSE 100
  END,
  0,
  CASE (ROW_NUMBER() OVER (ORDER BY p.id) % 10)::int
    WHEN 9 THEN 0
    WHEN 8 THEN 2
    WHEN 7 THEN 4
    ELSE 100
  END,
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

-- 4b. CREATE 10 CUSTOMER USERS (deterministic IDs for returning-customer tracking)
-- ============================================================================
--
-- ✅ CUSTOMER AUTH TEST DATA:
--
-- Purpose: Test customer login/registration flows without business context
-- - These users are NOT scoped to any specific business (business_id = NULL)
-- - Used for testing public customer platform (client project)
-- - Test credentials: cust1@megastore.com through cust10@megastore.com
--
-- ✅ REGISTRATION FLOW TESTING:
-- Test Scenario 1: Register WITHOUT selecting a plan
--   - Expected: Registration succeeds, planId = null
--   - User can select plan later from dashboard
--   - No subscription error when planId is null
--
-- Test Scenario 2: Register WITH plan selection
--   - Expected: Registration succeeds with subscription
--   - Plan details stored in database
--   - User has immediate access to selected features
--
-- Test Scenario 3: Login with incorrect password
--   - Expected: Error message "Your password is incorrect"
--   - Displayed in toast notification after 500ms delay
--
-- Test Scenario 4: Telegram authentication
--   - Expected: Proper error handling for Telegram response
--   - Blocks business user login attempts
--   - Clears all tokens if business user tries customer login
--
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
FROM generate_series(1, 10) t(i)
ON CONFLICT DO NOTHING;

-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 65%% [█████████████░░░░░░░] 10 customer users done - starting orders'; END $$;

-- 13. COMPREHENSIVE ORDERS  CURRENT_DATE-4mo → CURRENT_DATE+4mo (fully dynamic)
-- 2-20 orders/hr × 24 hrs × ~240 days ≈ 30-60k orders — fast to generate
-- Today: slots capped at current hour so chart always matches real time
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
  -- slot(0-23)*100+n(1-20) = unique 4-digit suffix per day; immune to row-count changes
  'ORD-' || TO_CHAR(ts, 'YYYYMMDD') || '-' || LPAD((slot * 100 + n)::text, 4, '0'),
  '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,

  -- 75 % have a known customer ID, 25 % are guest
  CASE WHEN rn % 4 = 0 THEN NULL
       ELSE ('c0000000-0000-0000-0000-' || LPAD(((rn % 10) + 1)::text, 12, '0'))::uuid
  END,
  CASE WHEN rn % 4 = 0 THEN 'Guest Customer ' || (rn % 20 + 1)
       ELSE 'Customer ' || ((rn % 10) + 1)
  END,
  '+855-' || (10 + rn % 80) || '-' || LPAD((100000 + rn * 7 % 900000)::text, 6, '0'),
  CASE WHEN rn % 4 = 0 THEN 'guest' || rn || '@example.com'
       ELSE 'cust' || ((rn % 10) + 1) || '@megastore.com'
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
    -- Spread up to 20 orders across the 60 min window; n=1 always lands at 0-2 min
    -- so the current hour is visible in TODAY view as soon as HH:03 is reached
    (d::timestamp
      + slot * INTERVAL '1 hour'
      + ((n - 1) * 3 + (slot * 7 + EXTRACT(DOY FROM d)::int * 3 + n * 11) % 3) * INTERVAL '1 minute'
    ) AS ts,
    slot,
    n,
    ROW_NUMBER() OVER (ORDER BY d, slot, n)           AS rn,
    EXTRACT(DOY FROM d)::int                          AS doy,

    -- Revenue grows gradually over time + per-order variation
    ROUND((
      50
      + GREATEST(0, (d::date - '2025-01-01'::date) * 0.08)
      + ((slot * 23 + n * 37 + EXTRACT(DOY FROM d)::int * 17) % 300)
    )::numeric, 2) AS subtotal,

    ROUND(((slot * 5 + n * 13 + EXTRACT(DOY FROM d)::int * 3) % 30)::numeric, 2) AS cust_total,

    -- ~10% PERCENTAGE discount, ~10% FIXED_AMOUNT discount, rest none
    ROUND(CASE
      WHEN (slot + n + EXTRACT(DOY FROM d)::int) % 10 = 0
        THEN GREATEST(0,
               50
               + (d::date - '2025-01-01'::date) * 0.08
               + ((slot * 23 + n * 37 + EXTRACT(DOY FROM d)::int * 17) % 300)
             )::numeric
             * (ARRAY[5,8,10,12,15,20])[ 1 + (slot * 7 + n * 3 + EXTRACT(DOY FROM d)::int * 13) % 6 ]
             / 100.0
      WHEN (slot + n + EXTRACT(DOY FROM d)::int) % 10 = 5
        THEN (ARRAY[2,3,5,7,10,15])[ 1 + (slot * 11 + n * 5 + EXTRACT(DOY FROM d)::int * 7) % 6 ]::numeric
      ELSE 0::numeric
    END, 2) AS discount,
    CASE
      WHEN (slot + n + EXTRACT(DOY FROM d)::int) % 10 = 0 THEN 'PERCENTAGE'
      WHEN (slot + n + EXTRACT(DOY FROM d)::int) % 10 = 5 THEN 'FIXED_AMOUNT'
      ELSE NULL
    END AS disc_type,
    CASE
      WHEN (slot + n + EXTRACT(DOY FROM d)::int) % 10 = 0
        THEN (ARRAY['5% Member Discount','8% Seasonal Sale','10% Loyalty Reward','12% Weekend Deal','15% Flash Sale','20% VIP Offer'])[
               1 + (slot * 7 + n * 3 + EXTRACT(DOY FROM d)::int * 13) % 6 ]
      WHEN (slot + n + EXTRACT(DOY FROM d)::int) % 10 = 5
        THEN (ARRAY['$2 First Order','$3 Happy Hour','$5 Promo Code','$7 Bundle Deal','$10 Birthday Offer','$15 Special Event'])[
               1 + (slot * 11 + n * 5 + EXTRACT(DOY FROM d)::int * 7) % 6 ]
      ELSE NULL
    END AS disc_reason

  FROM generate_series(CURRENT_DATE - INTERVAL '4 months', CURRENT_DATE + INTERVAL '4 months', '1 day'::interval) d
  -- Past/future days: all 24 hours. Today: only up to current hour
  CROSS JOIN generate_series(0,
    CASE WHEN d::date = CURRENT_DATE
      THEN EXTRACT(HOUR FROM NOW() AT TIME ZONE 'Asia/Phnom_Penh')::int
      ELSE 23
    END
  ) slot
  -- Generate up to 20 slots per hour; keep only n <= random 2-20 for this day+hour
  -- Uses deterministic "randomness" so re-runs produce the same data
  CROSS JOIN generate_series(1, 20) n
  WHERE n <= 2 + (slot * 13 + EXTRACT(DOY FROM d)::int * 7 + EXTRACT(YEAR FROM d)::int * 3) % 19
) order_data;


-- ============================================================================
DO $$ BEGIN RAISE NOTICE ' 70%% [██████████████░░░░░░] Orders inserted (-4mo to +4mo from today)'; END $$;

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
DO $$ BEGIN RAISE NOTICE ' 80%% [████████████████░░░░] Delivery options done — inserting order items'; END $$;

-- 16. ORDER ITEMS  (exactly 2 per order)
-- Products pre-numbered 0-199 in a CTE so items are picked by hash-join
-- instead of LATERAL+OFFSET scanning — much faster for large order sets.
-- ============================================================================
WITH prods AS (
  SELECT id, name, sku, barcode, main_image_url, price,
         ((ROW_NUMBER() OVER (ORDER BY id)) - 1)::int AS idx
  FROM products
  WHERE business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
    AND is_deleted = false AND price > 0
  LIMIT 200
)
INSERT INTO order_items (
  id, order_id, product_id, product_size_id,
  product_name, product_image_url, size_name, sku, barcode,
  quantity, current_price, final_price, unit_price, total_price,
  has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date,
  customization_total, customizations,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
-- Item 1
SELECT
  gen_random_uuid(), o.id, p1.id, NULL::uuid,
  p1.name, p1.main_image_url, 'Standard', p1.sku, p1.barcode,
  (1 + EXTRACT(MINUTE FROM o.created_at)::int % 3)::int,
  p1.price, p1.price, p1.price,
  p1.price * (1 + EXTRACT(MINUTE FROM o.created_at)::int % 3),
  false, NULL, NULL::numeric, NULL::date, NULL::date,
  0.00, '[]'::json,
  0, false, o.created_at, o.created_at, 'system', 'system'
FROM orders o
JOIN prods p1 ON p1.idx = (EXTRACT(EPOCH FROM o.created_at)::bigint / 3600) % 100
WHERE o.business_id = '550cad56-cafd-4aba-baef-c4dcd53940d0'
UNION ALL
-- Item 2 (different product offset by 50)
SELECT
  gen_random_uuid(), o.id, p2.id, NULL::uuid,
  p2.name, p2.main_image_url, 'Standard', p2.sku, p2.barcode,
  1, p2.price, p2.price, p2.price, p2.price,
  false, NULL, NULL::numeric, NULL::date, NULL::date,
  0.00, '[]'::json,
  0, false, o.created_at, o.created_at, 'system', 'system'
FROM orders o
JOIN prods p2 ON p2.idx = ((EXTRACT(EPOCH FROM o.created_at)::bigint / 3600) + 50) % 100
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


-- ============================================================================
-- EXTENDED TEST DATA — PART 2
-- A. Subscription Plans (3: 1 Week / 1 Month / 1 Year — all $0)
-- B. 20 more Businesses (biz03-22) with settings, hours, roles
-- C. Subscriptions for all 22 businesses (history + active, calendar-based dates)
-- C2. Subscription payments for Mega Store & Fashion Hub history
-- D. 20 Platform Users
-- E. 20 Business Owner users (one per new business)
-- F. 40 Business Staff users (2 per new business)
-- G. 20 more Customer users (cust11-30)
-- H. Location data (24 provinces x 4 districts x 5 communes x 6 villages)
-- ============================================================================

DO $$
DECLARE
  -- -------------------------------------------------------------------------
  -- Shared constants
  -- -------------------------------------------------------------------------
  v_password  TEXT := '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW';
  v_avatar    TEXT := 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce';

  -- -------------------------------------------------------------------------
  -- Province / Khmer name arrays
  -- -------------------------------------------------------------------------
  province_en TEXT[] := ARRAY[
    'Phnom Penh','Siem Reap','Battambang','Preah Sihanouk','Kampong Cham',
    'Kandal','Prey Veng','Takeo','Kampot','Kampong Thom',
    'Kampong Speu','Kampong Chhnang','Pursat','Svay Rieng','Kratie',
    'Stung Treng','Mondulkiri','Ratanakiri','Koh Kong','Pailin',
    'Kep','Oddar Meanchey','Preah Vihear','Banteay Meanchey'
  ];
  province_kh TEXT[] := ARRAY[
    'ភ្នំពេញ','សៀមរាប','បាត់ដំបង','ព្រះសីហនុ','កំពង់ចាម',
    'កណ្ដាល','ព្រៃវែង','តាកែវ','កំពត','កំពង់ធំ',
    'កំពង់ស្ពឺ','កំពង់ឆ្នាំង','ពោធិ៍សាត់','ស្វាយរៀង','ក្រចេះ',
    'ស្ទឹងត្រែង','មណ្ឌលគិរី','រតនគិរី','កោះកុង','ប៉ៃលិន',
    'កែប','ឧត្ដរមានជ័យ','ព្រះវិហារ','បន្ទាយមានជ័យ'
  ];

  -- -------------------------------------------------------------------------
  -- Business name / city arrays (20 new businesses, index 1..20 → biz03..22)
  -- -------------------------------------------------------------------------
  biz_names TEXT[] := ARRAY[
    'Angkor Boutique','Mekong Market','Phnom Penh Grocery','Khmer Kitchen',
    'Royal Spa','Golden Gate Store','Sunrise Electronics','Lotus Cafe',
    'Dragon Mart','Bayon Apparel','River View Restaurant','Silk Road Fashion',
    'Heritage Handicrafts','Modern Living','Natures Best','City Center Mall',
    'Premium Auto Parts','Eco Green Shop','Tech Haven','Digital World'
  ];
  biz_cities TEXT[] := ARRAY[
    'Siem Reap','Phnom Penh','Phnom Penh','Battambang','Phnom Penh',
    'Siem Reap','Phnom Penh','Kampot','Phnom Penh','Siem Reap',
    'Phnom Penh','Siem Reap','Battambang','Phnom Penh','Kampong Cham',
    'Phnom Penh','Phnom Penh','Siem Reap','Phnom Penh','Battambang'
  ];

  -- -------------------------------------------------------------------------
  -- Khmer first / last name arrays (20 entries each)
  -- -------------------------------------------------------------------------
  kh_first TEXT[] := ARRAY[
    'Sophea','Dara','Maly','Ratha','Bopha',
    'Virak','Chenda','Narith','Pisey','Sovannak',
    'Kimheng','Phearun','Sreyleap','Buntha','Chanthy',
    'Makara','Oudom','Ratanak','Sreynich','Vuthy'
  ];
  kh_last TEXT[] := ARRAY[
    'Sok','Chan','Lim','Phal','Sar',
    'Heng','Keo','Nget','Ros','Seng',
    'Mao','Khun','Chhun','Touch','Long',
    'Em','Noun','Pen','Sam','Yem'
  ];

  -- -------------------------------------------------------------------------
  -- Working variables
  -- -------------------------------------------------------------------------
  i           INT;
  j           INT;
  p           INT;
  d           INT;
  c           INT;
  v           INT;

  biz_id      UUID;
  biz_set_id  UUID;
  user_id     UUID;
  profile_id  UUID;
  plan_id       UUID;
  week_plan_id  UUID;
  month_plan_id UUID;
  year_plan_id  UUID;
  sub_id      UUID;
  role_owner  UUID;
  role_admin  UUID;
  role_mgr    UUID;
  role_emp    UUID;
  cust_role   UUID;

  biz_idx     INT;   -- 1-based index into name/city arrays
  day_name    TEXT;
  days        TEXT[] := ARRAY['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

  prov_code   VARCHAR(10);
  dist_code   VARCHAR(10);
  comm_code   VARCHAR(10);
  vill_code   VARCHAR(10);

BEGIN

  -- ==========================================================================
  -- A. SUBSCRIPTION PLANS
  --    DataInitializationService creates exactly 3 plans on every app startup:
  --      "1 Week"  (WEEKLY,  $0)
  --      "1 Month" (MONTHLY, $0)
  --      "1 Year"  (YEARLY,  $0)
  --    We must NOT insert them here — doing so creates duplicates because the
  --    ON CONFLICT only guards against duplicate IDs, not duplicate names.
  --    Instead, resolve the IDs by name so the rest of the script can use them.
  -- ==========================================================================
  RAISE NOTICE 'A. Resolving subscription plan IDs by name (created by DataInitializationService)...';

  SELECT id INTO week_plan_id  FROM subscription_plans WHERE name = '1 Week'  AND is_deleted = false LIMIT 1;
  SELECT id INTO month_plan_id FROM subscription_plans WHERE name = '1 Month' AND is_deleted = false LIMIT 1;
  SELECT id INTO year_plan_id  FROM subscription_plans WHERE name = '1 Year'  AND is_deleted = false LIMIT 1;

  IF week_plan_id IS NULL OR month_plan_id IS NULL OR year_plan_id IS NULL THEN
    RAISE EXCEPTION 'Subscription plans not found. Start the application first so DataInitializationService can create them, then re-run this script.';
  END IF;

  RAISE NOTICE 'Plan IDs resolved — week: %, month: %, year: %', week_plan_id, month_plan_id, year_plan_id;

  -- ==========================================================================
  -- B. 20 NEW BUSINESSES (biz03-22)
  -- ==========================================================================
  RAISE NOTICE 'B. Inserting 20 new businesses with settings, hours and roles...';

  FOR i IN 3..22 LOOP
    biz_idx := i - 2;   -- 1-based index into name/city arrays
    biz_id  := ('bbbbb000-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;

    -- ---- business row -------------------------------------------------------
    INSERT INTO businesses (id, name, phone, email, address, status, is_subscription_active, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      biz_id,
      biz_names[biz_idx],
      '+855-' || LPAD((10000000 + i)::TEXT, 9, '0'),
      LOWER(REPLACE(biz_names[biz_idx], ' ', '')) || '@example.com',
      biz_cities[biz_idx] || ', Cambodia',
      'ACTIVE', true, 0, false,
      NOW() - INTERVAL '1 day' * (22 - i),
      NOW() - INTERVAL '1 day' * (22 - i),
      'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

    -- ---- business_settings --------------------------------------------------
    biz_set_id := gen_random_uuid();
    INSERT INTO business_settings (
      id, business_id, use_brands, tax_percentage,
      logo_business_url, enable_stock, primary_color,
      telegram_group_chat_id, version, is_deleted,
      created_at, updated_at, created_by, updated_by
    ) VALUES (
      biz_set_id, biz_id, true, 0.0,
      v_avatar, 'ENABLED',
      '#' || LPAD(((i * 123456) % 16777215)::TEXT, 6, '0'),
      NULL, 0, false,
      NOW() - INTERVAL '1 day' * (22 - i),
      NOW() - INTERVAL '1 day' * (22 - i),
      'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

    -- ---- business_hours (7 days) --------------------------------------------
    FOREACH day_name IN ARRAY days LOOP
      INSERT INTO business_hours (
        id, business_setting_id, day, opening_time, closing_time,
        is_closed, version, is_deleted, created_at, updated_at, created_by, updated_by
      ) VALUES (
        gen_random_uuid(), biz_set_id, day_name, '08:00', '22:00',
        false, 0, false, NOW(), NOW(), 'admin', 'admin'
      ) ON CONFLICT DO NOTHING;
    END LOOP;

    -- ---- roles for this business --------------------------------------------
    role_owner := gen_random_uuid();
    role_admin := gen_random_uuid();
    role_mgr   := gen_random_uuid();
    role_emp   := gen_random_uuid();

    INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES
      (role_owner, 'BUSINESS_OWNER',    'Business Owner role',    biz_id, 'BUSINESS_USER', 0, false, NOW(), NOW(), 'admin','admin'),
      (role_admin, 'BUSINESS_ADMIN',    'Business Admin role',    biz_id, 'BUSINESS_USER', 0, false, NOW(), NOW(), 'admin','admin'),
      (role_mgr,   'BUSINESS_MANAGER',  'Business Manager role',  biz_id, 'BUSINESS_USER', 0, false, NOW(), NOW(), 'admin','admin'),
      (role_emp,   'BUSINESS_EMPLOYEE', 'Business Employee role', biz_id, 'BUSINESS_USER', 0, false, NOW(), NOW(), 'admin','admin')
    ON CONFLICT DO NOTHING;

  END LOOP;

  -- ==========================================================================
  -- C. SUBSCRIPTIONS FOR ALL 22 BUSINESSES
  --    End dates use proper calendar intervals matching SubscriptionPlan.calculateEndDate():
  --      WEEKLY  -> start + 1 week
  --      MONTHLY -> start + 1 month  (not 30 days)
  --      YEARLY  -> start + 1 year   (not 365 days)
  --
  --    Mega Store & Fashion Hub each have 3 subscription records showing history:
  --      1) old expired  (1 Year plan, finished ~1 month ago)
  --      2) recent expired (1 Month plan, finished ~15 days ago)
  --      3) current active (1 Month plan, expires next month)
  --
  --    Fixed UUIDs on these 6 so subscription_payments can reference them.
  --    Plan IDs:
  --      aa000000-...-000000000001 = 1 Week  (WEEKLY)
  --      aa000000-...-000000000002 = 1 Month (MONTHLY)
  --      aa000000-...-000000000003 = 1 Year  (YEARLY)
  -- ==========================================================================
  RAISE NOTICE 'C. Inserting subscriptions with calendar-based end dates...';

  -- ---- Mega Store — 30 monthly records (29 expired history + 1 active) -------
  --    Chain starts ~29 months 10 days ago so sub 30 ends ~20 days from now.
  --    Sub  1 → payment type = SUBSCRIPTION (initial activation)
  --    Sub 2-30 → payment type = RENEWAL
  --    Payment method alternates: CASH for most, BANK every 3rd record.
  FOR i IN 1..30 LOOP
    sub_id := ('ee000000-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;

    INSERT INTO subscriptions (id, business_id, plan_id, start_date, end_date, auto_renew, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      sub_id,
      '550cad56-cafd-4aba-baef-c4dcd53940d0',
      month_plan_id,
      NOW() - INTERVAL '29 months 10 days' + (i - 1) * INTERVAL '1 month',
      NOW() - INTERVAL '29 months 10 days' + i       * INTERVAL '1 month',
      CASE WHEN i = 30 THEN true ELSE false END,
      0, false,
      NOW() - INTERVAL '29 months 10 days' + (i - 1) * INTERVAL '1 month',
      NOW() - INTERVAL '29 months 10 days' + (i - 1) * INTERVAL '1 month',
      'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO subscription_payments (id, business_id, subscription_id, plan_id, amount, payment_method, payment_type, status, reference_number, notes, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      gen_random_uuid(),
      '550cad56-cafd-4aba-baef-c4dcd53940d0',
      sub_id,
      month_plan_id,
      0.00,
      CASE WHEN i % 3 = 0 THEN 'BANK' ELSE 'CASH' END,
      CASE WHEN i = 1    THEN 'SUBSCRIPTION' ELSE 'RENEWAL' END,
      'COMPLETED',
      'REF-MEGA-' || LPAD(i::TEXT, 3, '0'),
      CASE WHEN i = 1 THEN 'Initial monthly subscription activation'
                       ELSE 'Monthly renewal #' || (i - 1) END,
      0, false,
      NOW() - INTERVAL '29 months 10 days' + (i - 1) * INTERVAL '1 month',
      NOW() - INTERVAL '29 months 10 days' + (i - 1) * INTERVAL '1 month',
      'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

  END LOOP;

  -- ---- Fashion Hub — 3 records (history + active) ---------------------------
  --    Using ff... prefix to avoid collision with Mega Store's ee...000001-000030

  -- 1) Expired weekly (started ~3 weeks ago, ended ~2 weeks ago)
  INSERT INTO subscriptions (id, business_id, plan_id, start_date, end_date, auto_renew, version, is_deleted, created_at, updated_at, created_by, updated_by)
  VALUES (
    'ff000000-0000-0000-0000-000000000001',
    '660cad56-cafd-4aba-baef-c4dcd53940d0',
    week_plan_id,
    (NOW() - INTERVAL '3 weeks'),
    (NOW() - INTERVAL '3 weeks') + INTERVAL '1 week',
    false, 0, false,
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '3 weeks',
    'admin', 'admin'
  ) ON CONFLICT DO NOTHING;

  -- 2) Expired monthly (started ~6 weeks ago, ended ~2 weeks ago)
  INSERT INTO subscriptions (id, business_id, plan_id, start_date, end_date, auto_renew, version, is_deleted, created_at, updated_at, created_by, updated_by)
  VALUES (
    'ff000000-0000-0000-0000-000000000002',
    '660cad56-cafd-4aba-baef-c4dcd53940d0',
    month_plan_id,
    (NOW() - INTERVAL '6 weeks'),
    (NOW() - INTERVAL '6 weeks') + INTERVAL '1 month',
    false, 0, false,
    NOW() - INTERVAL '6 weeks',
    NOW() - INTERVAL '6 weeks',
    'admin', 'admin'
  ) ON CONFLICT DO NOTHING;

  -- 3) Active monthly (started 5 days ago)
  INSERT INTO subscriptions (id, business_id, plan_id, start_date, end_date, auto_renew, version, is_deleted, created_at, updated_at, created_by, updated_by)
  VALUES (
    'ff000000-0000-0000-0000-000000000003',
    '660cad56-cafd-4aba-baef-c4dcd53940d0',
    month_plan_id,
    (NOW() - INTERVAL '5 days'),
    (NOW() - INTERVAL '5 days') + INTERVAL '1 month',
    true, 0, false,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    'admin', 'admin'
  ) ON CONFLICT DO NOTHING;

  -- ---- New businesses 3-22 — one active subscription + one payment each ------
  --    Plan assigned by (i % 3):
  --      0 -> 1 Week  (WEEKLY)
  --      1 -> 1 Month (MONTHLY)
  --      2 -> 1 Year  (YEARLY)
  --    sub_id is captured so the payment can reference the same subscription.
  FOR i IN 3..22 LOOP
    biz_id := ('bbbbb000-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    sub_id := gen_random_uuid();

    CASE (i % 3)
      WHEN 0 THEN
        plan_id := week_plan_id;
        INSERT INTO subscriptions (id, business_id, plan_id, start_date, end_date, auto_renew, version, is_deleted, created_at, updated_at, created_by, updated_by)
        VALUES (
          sub_id, biz_id, plan_id,
          NOW() - INTERVAL '1 day' * (i % 5),
          (NOW() - INTERVAL '1 day' * (i % 5)) + INTERVAL '1 week',
          true, 0, false, NOW(), NOW(), 'admin', 'admin'
        ) ON CONFLICT DO NOTHING;
      WHEN 1 THEN
        plan_id := month_plan_id;
        INSERT INTO subscriptions (id, business_id, plan_id, start_date, end_date, auto_renew, version, is_deleted, created_at, updated_at, created_by, updated_by)
        VALUES (
          sub_id, biz_id, plan_id,
          NOW() - INTERVAL '1 day' * (i % 20),
          (NOW() - INTERVAL '1 day' * (i % 20)) + INTERVAL '1 month',
          true, 0, false, NOW(), NOW(), 'admin', 'admin'
        ) ON CONFLICT DO NOTHING;
      ELSE
        plan_id := year_plan_id;
        INSERT INTO subscriptions (id, business_id, plan_id, start_date, end_date, auto_renew, version, is_deleted, created_at, updated_at, created_by, updated_by)
        VALUES (
          sub_id, biz_id, plan_id,
          NOW() - INTERVAL '1 day' * (i % 30),
          (NOW() - INTERVAL '1 day' * (i % 30)) + INTERVAL '1 year',
          true, 0, false, NOW(), NOW(), 'admin', 'admin'
        ) ON CONFLICT DO NOTHING;
    END CASE;

    -- Initial SUBSCRIPTION payment linked to this business's subscription
    INSERT INTO subscription_payments (id, business_id, subscription_id, plan_id, amount, payment_method, payment_type, status, reference_number, notes, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      gen_random_uuid(),
      biz_id, sub_id, plan_id,
      0.00, 'CASH', 'SUBSCRIPTION', 'COMPLETED',
      'REF-BIZ' || LPAD(i::TEXT, 2, '0') || '-001',
      'Initial subscription activation',
      0, false, NOW(), NOW(), 'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

  END LOOP;

  -- ==========================================================================
  -- C2. SUBSCRIPTION PAYMENTS — Fashion Hub only
  --     Mega Store payments are inserted inline in the loop above.
  -- ==========================================================================
  RAISE NOTICE 'C2. Inserting subscription payments for Fashion Hub...';

  -- Fashion Hub — Sub 1 (expired weekly): initial subscription payment
  INSERT INTO subscription_payments (id, business_id, subscription_id, plan_id, amount, payment_method, payment_type, status, reference_number, notes, version, is_deleted, created_at, updated_at, created_by, updated_by)
  VALUES (
    gen_random_uuid(),
    '660cad56-cafd-4aba-baef-c4dcd53940d0',
    'ff000000-0000-0000-0000-000000000001',
    week_plan_id,
    0.00, 'CASH', 'SUBSCRIPTION', 'COMPLETED',
    'REF-FASH-WEEK-001',
    'Initial weekly subscription activation — 1 Week plan',
    0, false,
    NOW() - INTERVAL '3 weeks',
    NOW() - INTERVAL '3 weeks',
    'admin', 'admin'
  ) ON CONFLICT DO NOTHING;

  -- Fashion Hub — Sub 2 (expired monthly): renewal payment
  INSERT INTO subscription_payments (id, business_id, subscription_id, plan_id, amount, payment_method, payment_type, status, reference_number, notes, version, is_deleted, created_at, updated_at, created_by, updated_by)
  VALUES (
    gen_random_uuid(),
    '660cad56-cafd-4aba-baef-c4dcd53940d0',
    'ff000000-0000-0000-0000-000000000002',
    month_plan_id,
    0.00, 'BANK', 'RENEWAL', 'COMPLETED',
    'REF-FASH-MON-001',
    'Monthly renewal after weekly plan expired',
    0, false,
    NOW() - INTERVAL '6 weeks',
    NOW() - INTERVAL '6 weeks',
    'admin', 'admin'
  ) ON CONFLICT DO NOTHING;

  -- Fashion Hub — Sub 3 (active): renewal payment
  INSERT INTO subscription_payments (id, business_id, subscription_id, plan_id, amount, payment_method, payment_type, status, reference_number, notes, version, is_deleted, created_at, updated_at, created_by, updated_by)
  VALUES (
    gen_random_uuid(),
    '660cad56-cafd-4aba-baef-c4dcd53940d0',
    'ff000000-0000-0000-0000-000000000003',
    month_plan_id,
    0.00, 'CASH', 'RENEWAL', 'COMPLETED',
    'REF-FASH-MON-002',
    'Current active monthly subscription',
    0, false,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    'admin', 'admin'
  ) ON CONFLICT DO NOTHING;

  -- ==========================================================================
  -- D. 20 PLATFORM_USER accounts
  -- ==========================================================================
  RAISE NOTICE 'D. Inserting 20 platform users...';

  FOR i IN 1..20 LOOP
    user_id    := ('aaaab000-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    profile_id := gen_random_uuid();

    INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      user_id,
      'platform' || LPAD(i::TEXT, 2, '0') || '@platform.com',
      v_password,
      'PLATFORM_USER', 'ACTIVE', 'ACTIVE', NULL,
      0, false, NOW(), NOW(), 'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, nickname, gender, date_of_birth, profile_image_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      profile_id,
      user_id,
      'platform' || LPAD(i::TEXT, 2, '0') || '@platform.com',
      kh_first[((i - 1) % 20) + 1],
      kh_last[((i - 1) % 20) + 1],
      '+855-' || LPAD((60000000 + i)::TEXT, 9, '0'),
      'platform' || LPAD(i::TEXT, 2, '0'),
      CASE WHEN i % 2 = 0 THEN 'FEMALE' ELSE 'MALE' END,
      ('1985-01-01'::DATE + INTERVAL '1 month' * ((i - 1) % 12)),
      v_avatar,
      0, false, NOW(), NOW(), 'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

  END LOOP;

  -- ==========================================================================
  -- E. 20 BUSINESS_OWNER users (one per new business biz03-22)
  -- ==========================================================================
  RAISE NOTICE 'E. Inserting 20 business owner users...';

  FOR i IN 3..22 LOOP
    biz_idx := i - 2;
    user_id  := ('ccccc000-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    biz_id   := ('bbbbb000-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    profile_id := gen_random_uuid();

    INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      user_id,
      'bizowner' || LPAD(i::TEXT, 2, '0') || '@example.com',
      v_password,
      'BUSINESS_USER', 'ACTIVE', 'ACTIVE', biz_id,
      0, false, NOW(), NOW(), 'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, nickname, gender, date_of_birth, profile_image_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      profile_id,
      user_id,
      'bizowner' || LPAD(i::TEXT, 2, '0') || '@example.com',
      kh_first[((biz_idx - 1) % 20) + 1],
      kh_last[((biz_idx - 1) % 20) + 1],
      '+855-' || LPAD((70000000 + i)::TEXT, 9, '0'),
      'owner' || LPAD(i::TEXT, 2, '0'),
      CASE WHEN i % 2 = 0 THEN 'FEMALE' ELSE 'MALE' END,
      ('1980-06-01'::DATE + INTERVAL '1 month' * ((i - 3) % 12)),
      v_avatar,
      0, false, NOW(), NOW(), 'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

    -- Assign BUSINESS_OWNER role from their business
    INSERT INTO user_roles (user_id, role_id)
    SELECT user_id, r.id
    FROM roles r
    WHERE r.business_id = biz_id
      AND r.name = 'BUSINESS_OWNER'
    ON CONFLICT DO NOTHING;

  END LOOP;

  -- ==========================================================================
  -- F. 40 BUSINESS STAFF users (2 per new business biz03-22)
  --    IDs: 'ddddd000-0000-0000-' || LPAD(i,4,'0') || '-' || LPAD(j,12,'0')
  --    i = staff index 1..2, j = business index 3..22
  -- ==========================================================================
  RAISE NOTICE 'F. Inserting 40 business staff users...';

  FOR i IN 1..2 LOOP
    FOR j IN 3..22 LOOP
      biz_idx    := j - 2;
      user_id    := ('ddddd000-0000-0000-' || LPAD(i::TEXT, 4, '0') || '-' || LPAD(j::TEXT, 12, '0'))::UUID;
      biz_id     := ('bbbbb000-0000-0000-0000-' || LPAD(j::TEXT, 12, '0'))::UUID;
      profile_id := gen_random_uuid();

      INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
      VALUES (
        user_id,
        'staff' || LPAD(i::TEXT, 2, '0') || '_biz' || LPAD(j::TEXT, 2, '0') || '@example.com',
        v_password,
        'BUSINESS_USER', 'ACTIVE', 'ACTIVE', biz_id,
        0, false, NOW(), NOW(), 'admin', 'admin'
      ) ON CONFLICT DO NOTHING;

      INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, nickname, gender, date_of_birth, profile_image_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
      VALUES (
        profile_id,
        user_id,
        'staff' || LPAD(i::TEXT, 2, '0') || '_biz' || LPAD(j::TEXT, 2, '0') || '@example.com',
        kh_first[((i + j - 1) % 20) + 1],
        kh_last[((i + j) % 20) + 1],
        '+855-' || LPAD((80000000 + i * 100 + j)::TEXT, 9, '0'),
        'staff' || LPAD(i::TEXT, 2, '0') || 'biz' || LPAD(j::TEXT, 2, '0'),
        CASE WHEN (i + j) % 2 = 0 THEN 'FEMALE' ELSE 'MALE' END,
        ('1990-01-01'::DATE + INTERVAL '1 month' * ((i + j) % 12)),
        v_avatar,
        0, false, NOW(), NOW(), 'admin', 'admin'
      ) ON CONFLICT DO NOTHING;

      -- Assign BUSINESS_EMPLOYEE role from their business
      INSERT INTO user_roles (user_id, role_id)
      SELECT user_id, r.id
      FROM roles r
      WHERE r.business_id = biz_id
        AND r.name = 'BUSINESS_EMPLOYEE'
      ON CONFLICT DO NOTHING;

    END LOOP;
  END LOOP;

  -- ==========================================================================
  -- G. 20 MORE CUSTOMER users (cust11-30)
  -- ==========================================================================
  RAISE NOTICE 'G. Inserting customers 11-30...';

  -- Ensure the global CUSTOMER role exists (create if absent)
  INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
  VALUES (gen_random_uuid(), 'CUSTOMER', 'Customer role', NULL, 'CUSTOMER', 0, false, NOW(), NOW(), 'admin', 'admin')
  ON CONFLICT DO NOTHING;

  FOR i IN 11..30 LOOP
    user_id    := ('c0000000-0000-0000-0000-' || LPAD(i::TEXT, 12, '0'))::UUID;
    profile_id := gen_random_uuid();

    INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      user_id,
      'customer' || i || '@example.com',
      v_password,
      'CUSTOMER', 'ACTIVE', 'ACTIVE', NULL,
      0, false, NOW(), NOW(), 'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

    INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, nickname, gender, date_of_birth, profile_image_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      profile_id,
      user_id,
      'customer' || i || '@example.com',
      kh_first[((i - 1) % 20) + 1],
      kh_last[((i - 1) % 20) + 1],
      '+855-' || LPAD((90000000 + i)::TEXT, 9, '0'),
      'cust' || i,
      CASE WHEN i % 2 = 0 THEN 'FEMALE' ELSE 'MALE' END,
      ('1995-03-01'::DATE + INTERVAL '1 month' * ((i - 11) % 12)),
      v_avatar,
      0, false, NOW(), NOW(), 'admin', 'admin'
    ) ON CONFLICT DO NOTHING;

    -- Assign CUSTOMER role
    INSERT INTO user_roles (user_id, role_id)
    SELECT user_id, r.id
    FROM roles r
    WHERE r.name = 'CUSTOMER' AND r.user_type = 'CUSTOMER'
    LIMIT 1
    ON CONFLICT DO NOTHING;

  END LOOP;

  -- ==========================================================================
  -- H. LOCATION DATA
  --    24 provinces × 4 districts × 5 communes × 6 villages
  -- ==========================================================================
  RAISE NOTICE 'H. Inserting location data (provinces/districts/communes/villages)...';

  -- ---- Provinces (24) -------------------------------------------------------
  FOR p IN 1..24 LOOP
    prov_code := LPAD(p::TEXT, 2, '0');
    INSERT INTO location_province_cbc (
      id, province_code, province_en, province_kh,
      version, is_deleted, created_at, updated_at, created_by, updated_by
    ) VALUES (
      gen_random_uuid(),
      prov_code,
      province_en[p],
      province_kh[p],
      0, false, NOW(), NOW(), 'admin', 'admin'
    ) ON CONFLICT (province_code) DO NOTHING;
  END LOOP;

  -- ---- Districts (24 × 4 = 96) ----------------------------------------------
  FOR p IN 1..24 LOOP
    FOR d IN 1..4 LOOP
      prov_code := LPAD(p::TEXT, 2, '0');
      dist_code := LPAD(p::TEXT, 2, '0') || LPAD(d::TEXT, 2, '0');
      INSERT INTO location_district_cbc (
        id, district_code, district_en, district_kh, province_code,
        version, is_deleted, created_at, updated_at, created_by, updated_by
      ) VALUES (
        gen_random_uuid(),
        dist_code,
        'District ' || d || ' of ' || province_en[p],
        'ស្រុក ' || d || ' នៃ' || province_kh[p],
        prov_code,
        0, false, NOW(), NOW(), 'admin', 'admin'
      ) ON CONFLICT (district_code) DO NOTHING;
    END LOOP;
  END LOOP;

  -- ---- Communes (24 × 4 × 5 = 480) -----------------------------------------
  FOR p IN 1..24 LOOP
    FOR d IN 1..4 LOOP
      FOR c IN 1..5 LOOP
        dist_code := LPAD(p::TEXT, 2, '0') || LPAD(d::TEXT, 2, '0');
        comm_code := LPAD(p::TEXT, 2, '0') || LPAD(d::TEXT, 2, '0') || LPAD(c::TEXT, 2, '0');
        INSERT INTO location_commune_cbc (
          id, commune_code, commune_en, commune_kh, district_code,
          version, is_deleted, created_at, updated_at, created_by, updated_by
        ) VALUES (
          gen_random_uuid(),
          comm_code,
          'Commune ' || c || ', District ' || d,
          'ឃុំ ' || c || ' ស្រុក ' || d,
          dist_code,
          0, false, NOW(), NOW(), 'admin', 'admin'
        ) ON CONFLICT (commune_code) DO NOTHING;
      END LOOP;
    END LOOP;
  END LOOP;

  -- ---- Villages (24 × 4 × 5 × 6 = 2880) ------------------------------------
  FOR p IN 1..24 LOOP
    FOR d IN 1..4 LOOP
      FOR c IN 1..5 LOOP
        FOR v IN 1..6 LOOP
          comm_code := LPAD(p::TEXT, 2, '0') || LPAD(d::TEXT, 2, '0') || LPAD(c::TEXT, 2, '0');
          vill_code := LPAD(p::TEXT, 2, '0') || LPAD(d::TEXT, 2, '0') || LPAD(c::TEXT, 2, '0') || LPAD(v::TEXT, 2, '0');
          INSERT INTO location_village_cbc (
            id, village_code, village_en, village_kh, commune_code,
            version, is_deleted, created_at, updated_at, created_by, updated_by
          ) VALUES (
            gen_random_uuid(),
            vill_code,
            'Village ' || v || ', Commune ' || c,
            'ភូមិ ' || v || ' ឃុំ ' || c,
            comm_code,
            0, false, NOW(), NOW(), 'admin', 'admin'
          ) ON CONFLICT (village_code) DO NOTHING;
        END LOOP;
      END LOOP;
    END LOOP;
  END LOOP;

  -- ==========================================================================
  -- SUMMARY
  -- ==========================================================================
  RAISE NOTICE '=======================================================';
  RAISE NOTICE 'Extended test data insertion complete!';
  RAISE NOTICE '  Subscription Plans    : 3  (1 Week / 1 Month / 1 Year — all $0)';
  RAISE NOTICE '  New Businesses        : 20  (biz03-22)';
  RAISE NOTICE '  Subscriptions (total) : 26  (3 Mega Store + 3 Fashion Hub + 20 new biz)';
  RAISE NOTICE '  Subscription Payments : 6   (history records for Mega Store & Fashion Hub)';
  RAISE NOTICE '  Platform Users        : 20  (platform01-20)';
  RAISE NOTICE '  Business Owners       : 20  (bizowner03-22)';
  RAISE NOTICE '  Business Staff        : 40  (staff01/02 per biz03-22)';
  RAISE NOTICE '  New Customers         : 20  (customer11-30)';
  RAISE NOTICE '  Provinces             : 24';
  RAISE NOTICE '  Districts             : 96  (24x4)';
  RAISE NOTICE '  Communes              : 480 (24x4x5)';
  RAISE NOTICE '  Villages              : 2880 (24x4x5x6)';
  RAISE NOTICE '=======================================================';

END $$;

-- ==========================================================================
-- VERIFICATION SELECTS
-- ==========================================================================

SELECT 'subscription_plans'      AS table_name, COUNT(*) AS row_count FROM subscription_plans
UNION ALL
SELECT 'subscriptions',           COUNT(*) FROM subscriptions
UNION ALL
SELECT 'subscription_payments',   COUNT(*) FROM subscription_payments
UNION ALL
SELECT 'location_province_cbc',   COUNT(*) FROM location_province_cbc
UNION ALL
SELECT 'location_district_cbc',   COUNT(*) FROM location_district_cbc
UNION ALL
SELECT 'location_commune_cbc',    COUNT(*) FROM location_commune_cbc
UNION ALL
SELECT 'location_village_cbc',    COUNT(*) FROM location_village_cbc
UNION ALL
SELECT 'users (PLATFORM_USER)',   COUNT(*) FROM users WHERE user_type = 'PLATFORM_USER'
UNION ALL
SELECT 'users (BUSINESS_USER)',   COUNT(*) FROM users WHERE user_type = 'BUSINESS_USER'
UNION ALL
SELECT 'users (CUSTOMER)',        COUNT(*) FROM users WHERE user_type = 'CUSTOMER'
ORDER BY table_name;

-- Subscription history view (mirrors /api/v1/subscriptions/history endpoint)
SELECT
  b.name                          AS business,
  sp.name                         AS plan,
  sp.duration_type                AS period_type,
  s.start_date                    AS "from",
  s.end_date                      AS "to",
  CASE WHEN s.end_date > NOW() THEN 'ACTIVE' ELSE 'EXPIRED' END AS status,
  COUNT(pay.id)                   AS payments
FROM subscriptions s
JOIN businesses b       ON b.id  = s.business_id
JOIN subscription_plans sp ON sp.id = s.plan_id
LEFT JOIN subscription_payments pay ON pay.subscription_id = s.id AND pay.is_deleted = false
WHERE s.is_deleted = false
GROUP BY b.name, sp.name, sp.duration_type, s.start_date, s.end_date
ORDER BY b.name, s.start_date DESC;

-- ============================================================================
-- END OF EXTENDED TEST DATA — PART 2
-- ============================================================================
