-- ============================================================================
-- PRODUCTION INIT DATA
-- Run once on a fresh production database after the backend starts up.
-- Safe to re-run — all inserts use WHERE NOT EXISTS checks.
--
-- Creates:
--   1. PLATFORM_OWNER role (global)
--   2. Platform owner user  phatmenghor19@gmail.com / 88889999
--   3. User profile
--   4. Role assignment
--   5. 3 Subscription plans  (1 Week / 1 Month / 1 Year)
-- ============================================================================

-- ============================================================================
-- 1. PLATFORM_OWNER ROLE (global — no business)
-- ============================================================================
INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'PLATFORM_OWNER', 'Platform Owner — full access to all platform features and businesses',
  NULL, 'PLATFORM_USER', 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE name = 'PLATFORM_OWNER' AND business_id IS NULL AND is_deleted = false
);

-- CUSTOMER role (used by social auth auto-create)
INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'CUSTOMER', 'Customer — access to public menu and order features',
  NULL, 'CUSTOMER', 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (
  SELECT 1 FROM roles WHERE name = 'CUSTOMER' AND business_id IS NULL AND is_deleted = false
);

-- ============================================================================
-- 2. PLATFORM OWNER USER
--    password: 88889999 (bcrypt $2a$12$...)
-- ============================================================================
INSERT INTO users (
  id, user_identifier, password, user_type,
  account_status, status, business_id,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  'phatmenghor19@gmail.com',
  '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW',
  'PLATFORM_USER',
  'ACTIVE', 'ACTIVE', NULL,
  0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE user_identifier = 'phatmenghor19@gmail.com' AND is_deleted = false
);

-- ============================================================================
-- 3. USER PROFILE
-- ============================================================================
INSERT INTO user_profiles (
  id, user_id, email, first_name, last_name,
  phone_number, nickname, gender, date_of_birth,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(), u.id,
  'phatmenghor19@gmail.com', 'Phat', 'Menghor',
  '+855-19-000-019', 'Platform Owner', 'MALE', '1988-08-19'::date,
  0, false, NOW(), NOW(), 'system', 'system'
FROM users u
WHERE u.user_identifier = 'phatmenghor19@gmail.com'
  AND u.is_deleted = false
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = u.id
  );

-- ============================================================================
-- 4. ASSIGN PLATFORM_OWNER ROLE TO USER
-- ============================================================================
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.user_identifier = 'phatmenghor19@gmail.com'
  AND u.is_deleted = false
  AND r.name = 'PLATFORM_OWNER'
  AND r.business_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. SUBSCRIPTION PLANS (3 tiers)
-- ============================================================================
INSERT INTO subscription_plans (
  id, name, description, price, status, duration_type,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), '1 Week',
  'Weekly plan — perfect for trying out eMenu Cambodia. Includes full access to menu management, QR code generation, order tracking, and customer analytics for 7 days.',
  0.00, 'PUBLIC', 'WEEKLY', 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE name = '1 Week' AND is_deleted = false
);

INSERT INTO subscription_plans (
  id, name, description, price, status, duration_type,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), '1 Month',
  'Monthly plan — ideal for growing businesses. Get unlimited products, staff accounts, real-time orders, payment tracking, HR management, and priority support for 30 days.',
  0.00, 'PUBLIC', 'MONTHLY', 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE name = '1 Month' AND is_deleted = false
);

INSERT INTO subscription_plans (
  id, name, description, price, status, duration_type,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT gen_random_uuid(), '1 Year',
  'Annual plan — best value for established businesses. Everything in the monthly plan plus advanced reports, multi-branch support, custom branding, and dedicated account manager for 365 days.',
  0.00, 'PUBLIC', 'YEARLY', 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans WHERE name = '1 Year' AND is_deleted = false
);

-- ============================================================================
-- VERIFY
-- ============================================================================
SELECT '=== PLATFORM OWNER USER ===' AS info;
SELECT u.id, u.user_identifier, u.user_type, u.account_status,
       up.first_name, up.last_name, up.email
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.user_identifier = 'phatmenghor19@gmail.com';

SELECT '=== ROLES ===' AS info;
SELECT u.user_identifier, r.name AS role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.user_identifier = 'phatmenghor19@gmail.com';

SELECT '=== SUBSCRIPTION PLANS ===' AS info;
SELECT id, name, price, status, duration_type FROM subscription_plans WHERE is_deleted = false ORDER BY created_at;
