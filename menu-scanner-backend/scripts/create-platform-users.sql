-- ============================================================================
-- PLATFORM OWNER & BUSINESS SEED SCRIPT (1000 Days Yearly Subscription)
-- Safe to re-run — all inserts use WHERE NOT EXISTS / ON CONFLICT checks.
--
-- Uses fallback Business ID: 'a31073bb-a919-4a63-bb54-051d15ddc4c9' to match
-- frontend local fallback defaults.
-- ============================================================================

-- ============================================================================
-- 1. CREATE PLATFORM OWNER ROLE & USER
-- ============================================================================

-- Create PLATFORM_OWNER role
INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'PLATFORM_OWNER', 'Platform Owner — full access to all platform features and businesses', NULL, 'PLATFORM_USER', 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'PLATFORM_OWNER' AND business_id IS NULL AND is_deleted = false);

-- Create PLATFORM OWNER user (Password: 88889999)
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'phatmenghor19@gmail.com', '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW', 'PLATFORM_USER', 'ACTIVE', 'ACTIVE', NULL, 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'phatmenghor19@gmail.com' AND is_deleted = false);

-- Create profile for platform owner
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, nickname, gender, date_of_birth, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), u.id, 'phatmenghor19@gmail.com', 'Phat', 'Menghor', '+855-19-000-019', 'Platform Owner', 'MALE', '1988-08-19'::date, 0, false, NOW(), NOW(), 'system', 'system'
FROM users u WHERE u.user_identifier = 'phatmenghor19@gmail.com' AND u.is_deleted = false AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id);

-- Assign PLATFORM_OWNER role to user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r WHERE u.user_identifier = 'phatmenghor19@gmail.com' AND u.is_deleted = false AND r.name = 'PLATFORM_OWNER' AND r.business_id IS NULL
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = u.id AND role_id = r.id);


-- ============================================================================
-- 2. CREATE SUBSCRIPTION PLAN (1 Year Premium)
-- ============================================================================
INSERT INTO subscription_plans (id, name, description, price, status, duration_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), '1 Year Premium', 'Premium yearly plan for active businesses.', 0.00, 'PUBLIC', 'YEARLY', 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = '1 Year Premium' AND is_deleted = false);


-- ============================================================================
-- 3. CREATE BUSINESS & BUSINESS OWNER USER
-- ============================================================================

-- Create Business: E-Menu Bistro with fixed ID 'a31073bb-a919-4a63-bb54-051d15ddc4c9'
INSERT INTO businesses (id, name, email, phone, address, description, subdomain, owner_id, status, is_subscription_active, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid, 'E-Menu Bistro', 'bistro@emenu.com', '+855-88-888-888', 'Phnom Penh, Cambodia', 'Bistro restaurant', 'emenu-bistro', NULL, 'ACTIVE', true, 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE id = 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid OR subdomain = 'emenu-bistro' AND is_deleted = false);

-- Create Business Owner user: phatmenghor20@gmail.com (Password: 88889999)
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'phatmenghor20@gmail.com', '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW', 'BUSINESS_USER', 'ACTIVE', 'ACTIVE', 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid, 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE user_identifier = 'phatmenghor20@gmail.com' AND is_deleted = false);

-- Sync user's business_id with the active business ID
UPDATE users
SET business_id = 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid
WHERE user_identifier = 'phatmenghor20@gmail.com' AND is_deleted = false;

-- Set the owner_id on the Business entity
UPDATE businesses
SET owner_id = (SELECT id FROM users WHERE user_identifier = 'phatmenghor20@gmail.com' AND is_deleted = false)
WHERE id = 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid;

-- Create Profile for Business Owner
INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, nickname, gender, date_of_birth, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), u.id, 'phatmenghor20@gmail.com', 'Bistro', 'Owner', '+855-88-888-888', 'Bistro Owner', 'MALE', '1990-01-01'::date, 0, false, NOW(), NOW(), 'system', 'system'
FROM users u WHERE u.user_identifier = 'phatmenghor20@gmail.com' AND u.is_deleted = false AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = u.id);

-- Create Business-specific role 'BUSINESS_OWNER'
INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'BUSINESS_OWNER', 'Business Owner - Full access to business operations', 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid, 'BUSINESS_USER', 0, false, NOW(), NOW(), 'system', 'system'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'BUSINESS_OWNER' AND business_id = 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid AND is_deleted = false);

-- Assign BUSINESS_OWNER role to the user
DELETE FROM user_roles WHERE user_id = (SELECT id FROM users WHERE user_identifier = 'phatmenghor20@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u CROSS JOIN roles r WHERE u.user_identifier = 'phatmenghor20@gmail.com' AND u.is_deleted = false AND r.name = 'BUSINESS_OWNER' AND r.business_id = 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid;


-- ============================================================================
-- 4. CREATE 1000 DAYS SUBSCRIPTION & PAYMENT
-- ============================================================================

-- Create Subscription for the Business (valid for 1000 days)
INSERT INTO subscriptions (id, business_id, plan_id, start_date, end_date, auto_renew, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid, p.id, NOW(), NOW() + INTERVAL '1000 days', false, 0, false, NOW(), NOW(), 'system', 'system'
FROM subscription_plans p
WHERE p.name = '1 Year Premium' AND p.is_deleted = false
AND NOT EXISTS (SELECT 1 FROM subscriptions WHERE business_id = 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid AND plan_id = p.id AND is_deleted = false);

-- Create Subscription Payment record
INSERT INTO subscription_payments (id, business_id, subscription_id, plan_id, amount, payment_method, payment_type, status, reference_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid, s.id, p.id, 0.00, 'CASH', 'SUBSCRIPTION', 'COMPLETED', 'CASH-SEED-1000', 0, false, NOW(), NOW(), 'system', 'system'
FROM subscriptions s CROSS JOIN subscription_plans p
WHERE s.business_id = 'a31073bb-a919-4a63-bb54-051d15ddc4c9'::uuid AND s.is_deleted = false AND p.name = '1 Year Premium' AND p.is_deleted = false
AND NOT EXISTS (SELECT 1 FROM subscription_payments WHERE subscription_id = s.id AND is_deleted = false);
