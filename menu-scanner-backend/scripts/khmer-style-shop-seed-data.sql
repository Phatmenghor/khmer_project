-- ============================================================================
-- KHMER STYLE SHOP — SAMPLE SEED DATA
-- 1 Business · 4 Roles · 4 Users (full HR profile: employment, address,
-- emergency contact, education, ID document, remark) · 10 Customers ·
-- 10 Banners · 6 Categories
-- 12 Brands · 12 Exchange Rates · 12 Delivery Options · 12 Payment Options
-- 48 Products (12 no-size, 12 with-size, 12 with-customize, 12 size+customize)
-- 1 Full Portfolio Profile
--
-- Safe to re-run: every INSERT uses gen_random_uuid()/ON CONFLICT or
-- WHERE NOT EXISTS guards keyed off fixed UUIDs so duplicates aren't created.
-- ============================================================================

-- ============================================================================
-- 1. BUSINESS
-- ============================================================================
INSERT INTO businesses (id, name, phone, email, address, status, is_subscription_active, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  'a1000000-0000-4000-8000-000000000001',
  'Khmer Style Shop',
  '+855-23-900-123',
  'hello@khmerstyleshop.com',
  '#45, Street 113, Toul Kork, Phnom Penh, Cambodia',
  'ACTIVE', true, 0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2. ROLES (4)
-- ============================================================================
INSERT INTO roles (id, name, description, business_id, user_type, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('a1000000-0000-4000-8000-000000000101', 'Business Owner', 'Full access to own business: products, orders, staff', 'a1000000-0000-4000-8000-000000000001', 'BUSINESS_USER', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000102', 'Staff', 'Manage products, orders, inventory (no settings/finance)', 'a1000000-0000-4000-8000-000000000001', 'BUSINESS_USER', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000103', 'Customer Service', 'View orders/customers, handle support, no product edit', 'a1000000-0000-4000-8000-000000000001', 'BUSINESS_USER', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000104', 'Super Admin', 'Full platform access, manages all businesses', NULL, 'PLATFORM_USER', 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3. USERS (4) — password hash below = bcrypt of "Password123!" (test data only)
-- ============================================================================
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('a1000000-0000-4000-8000-000000000201', 'admin@khmerstyle.com',   '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW', 'PLATFORM_USER', 'ACTIVE', 'ACTIVE', NULL, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000202', 'owner@khmerstyle.com',   '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW', 'BUSINESS_USER', 'ACTIVE', 'ACTIVE', 'a1000000-0000-4000-8000-000000000001', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000203', 'sokha.staff@khmerstyle.com', '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW', 'BUSINESS_USER', 'ACTIVE', 'ACTIVE', 'a1000000-0000-4000-8000-000000000001', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000204', 'dara.support@khmerstyle.com', '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW', 'BUSINESS_USER', 'ACTIVE', 'ACTIVE', 'a1000000-0000-4000-8000-000000000001', 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  (gen_random_uuid(), 'a1000000-0000-4000-8000-000000000201', 'admin@khmerstyle.com', 'Platform', 'Admin', '+855-12-000-001', 0, false, NOW(), NOW(), 'admin', 'admin'),
  (gen_random_uuid(), 'a1000000-0000-4000-8000-000000000202', 'owner@khmerstyle.com', 'Vannak', 'Sok', '+855-12-000-002', 0, false, NOW(), NOW(), 'admin', 'admin'),
  (gen_random_uuid(), 'a1000000-0000-4000-8000-000000000203', 'sokha.staff@khmerstyle.com', 'Sokha', 'Pen', '+855-12-000-003', 0, false, NOW(), NOW(), 'admin', 'admin'),
  (gen_random_uuid(), 'a1000000-0000-4000-8000-000000000204', 'dara.support@khmerstyle.com', 'Dara', 'Chan', '+855-12-000-004', 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
  ('a1000000-0000-4000-8000-000000000201', 'a1000000-0000-4000-8000-000000000104'),
  ('a1000000-0000-4000-8000-000000000202', 'a1000000-0000-4000-8000-000000000101'),
  ('a1000000-0000-4000-8000-000000000203', 'a1000000-0000-4000-8000-000000000102'),
  ('a1000000-0000-4000-8000-000000000204', 'a1000000-0000-4000-8000-000000000103')
ON CONFLICT DO NOTHING;

-- Extra profile fields (nickname / gender / date_of_birth) for the 4 seed users
UPDATE user_profiles SET nickname = 'Bong Admin', gender = 'MALE',   date_of_birth = '1990-01-15' WHERE user_id = 'a1000000-0000-4000-8000-000000000201';
UPDATE user_profiles SET nickname = 'Bong Nak',   gender = 'MALE',   date_of_birth = '1985-05-22' WHERE user_id = 'a1000000-0000-4000-8000-000000000202';
UPDATE user_profiles SET nickname = 'Sokha',      gender = 'FEMALE', date_of_birth = '1996-09-03' WHERE user_id = 'a1000000-0000-4000-8000-000000000203';
UPDATE user_profiles SET nickname = 'Dara',       gender = 'FEMALE', date_of_birth = '1998-11-30' WHERE user_id = 'a1000000-0000-4000-8000-000000000204';

-- Remarks for the 4 seed users
UPDATE users SET remark = 'Platform super admin account, manages all businesses on the system.'        WHERE id = 'a1000000-0000-4000-8000-000000000201';
UPDATE users SET remark = 'Owner of Khmer Style Shop, oversees products, orders and staff.'             WHERE id = 'a1000000-0000-4000-8000-000000000202';
UPDATE users SET remark = 'Full-time sales staff, handles daily order fulfillment and inventory.'       WHERE id = 'a1000000-0000-4000-8000-000000000203';
UPDATE users SET remark = 'Part-time customer service agent, handles customer chats and support tickets.' WHERE id = 'a1000000-0000-4000-8000-000000000204';

-- ============================================================================
-- 3a. USER EMPLOYMENT — position/department/join date for staff users
-- ============================================================================
INSERT INTO user_employments (id, user_id, employee_id, position, department, employment_type, join_date, leave_date, shift, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('a1000000-0000-4000-8000-000000000401', 'a1000000-0000-4000-8000-000000000201', 'EMP-0001', 'System Administrator',  'Platform Operations',  'FULL_TIME', '2023-01-10', NULL, 'Day',       0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000402', 'a1000000-0000-4000-8000-000000000202', 'EMP-0002', 'Business Owner',        'Management',            'FULL_TIME', '2023-02-01', NULL, 'Day',       0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000403', 'a1000000-0000-4000-8000-000000000203', 'EMP-0003', 'Sales Staff',           'Sales & Service',       'FULL_TIME', '2023-03-15', NULL, 'Morning',   0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000404', 'a1000000-0000-4000-8000-000000000204', 'EMP-0004', 'Customer Service Agent','Customer Support',      'PART_TIME', '2023-06-01', NULL, 'Afternoon', 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3b. USER ADDRESSES — current address + place of birth for each seed user
-- ============================================================================
INSERT INTO user_addresses (id, user_id, address_type, house_no, street, village, commune, district, province, country, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('a1000000-0000-4000-8000-000000000501', 'a1000000-0000-4000-8000-000000000201', 'CURRENT',       '12', 'Street 271', 'Boeung Tumpun', 'Boeung Tumpun', 'Mean Chey',  'Phnom Penh', 'Cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000502', 'a1000000-0000-4000-8000-000000000202', 'CURRENT',       '45', 'Street 113', 'Boeung Kak 1',  'Toul Kork',     'Toul Kork',  'Phnom Penh', 'Cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000503', 'a1000000-0000-4000-8000-000000000203', 'CURRENT',       '8B', 'Street 360', 'Boeung Keng Kang 3', 'Boeung Keng Kang 3', 'Chamkar Mon', 'Phnom Penh', 'Cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000504', 'a1000000-0000-4000-8000-000000000204', 'CURRENT',       '21', 'Street 70',  'Phsar Doeum Thkov', 'Phsar Doeum Thkov', 'Chamkar Mon', 'Phnom Penh', 'Cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000511', 'a1000000-0000-4000-8000-000000000201', 'PLACE_OF_BIRTH', NULL, NULL, 'Kandal Steung', 'Kandal Steung', 'Kandal Steung', 'Kandal',      'Cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000512', 'a1000000-0000-4000-8000-000000000202', 'PLACE_OF_BIRTH', NULL, NULL, 'Wat Bo',        'Sla Kram',       'Siem Reap',     'Siem Reap',   'Cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000513', 'a1000000-0000-4000-8000-000000000203', 'PLACE_OF_BIRTH', NULL, NULL, 'Prek Pra',      'Prek Pra',       'Chbar Ampov',   'Phnom Penh',  'Cambodia', 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000514', 'a1000000-0000-4000-8000-000000000204', 'PLACE_OF_BIRTH', NULL, NULL, 'Svay Pak',      'Bek Chan',       'Battambang',    'Battambang',  'Cambodia', 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3c. USER EMERGENCY CONTACTS
-- ============================================================================
INSERT INTO user_emergency_contacts (id, user_id, name, phone, relationship, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('a1000000-0000-4000-8000-000000000601', 'a1000000-0000-4000-8000-000000000201', 'Sophea Lim',   '+855-12-100-001', 'Spouse',  0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000602', 'a1000000-0000-4000-8000-000000000202', 'Channary Sok', '+855-12-100-002', 'Spouse',  0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000603', 'a1000000-0000-4000-8000-000000000203', 'Sokunthea Pen','+855-12-100-003', 'Mother',  0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000604', 'a1000000-0000-4000-8000-000000000204', 'Visal Chan',   '+855-12-100-004', 'Brother', 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3d. USER EDUCATIONS
-- ============================================================================
INSERT INTO user_educations (id, user_id, level, school_name, field_of_study, start_year, end_year, is_graduated, certificate_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('a1000000-0000-4000-8000-000000000701', 'a1000000-0000-4000-8000-000000000201', 'MASTER',   'Royal University of Phnom Penh',          'Information Technology', '2010', '2012', true, NULL, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000702', 'a1000000-0000-4000-8000-000000000202', 'BACHELOR', 'National University of Management',       'Business Administration', '2005', '2009', true, NULL, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000703', 'a1000000-0000-4000-8000-000000000203', 'BACHELOR', 'Royal University of Phnom Penh',          'Marketing',               '2015', '2019', true, NULL, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000704', 'a1000000-0000-4000-8000-000000000204', 'DIPLOMA',  'National Polytechnic Institute of Cambodia','Office Administration', '2016', '2018', true, NULL, 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 3e. USER DOCUMENTS — National ID cards
-- ============================================================================
INSERT INTO user_documents (id, user_id, type, number, file_url, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES
  ('a1000000-0000-4000-8000-000000000801', 'a1000000-0000-4000-8000-000000000201', 'ID_CARD', '001-123456789', NULL, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000802', 'a1000000-0000-4000-8000-000000000202', 'ID_CARD', '001-987654321', NULL, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000803', 'a1000000-0000-4000-8000-000000000203', 'ID_CARD', '001-456789123', NULL, 0, false, NOW(), NOW(), 'admin', 'admin'),
  ('a1000000-0000-4000-8000-000000000804', 'a1000000-0000-4000-8000-000000000204', 'ID_CARD', '001-789123456', NULL, 0, false, NOW(), NOW(), 'admin', 'admin')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 4. CUSTOMERS (10) — userType CUSTOMER, no business association
-- ============================================================================
INSERT INTO users (id, user_identifier, password, user_type, account_status, status, business_id, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT v.id::uuid, v.email, '$2a$12$STgqMsjrgi5GweWm/gry2eZIrmD.fnmGzNH7krWKZKeklw9/sXjvW', 'CUSTOMER', 'ACTIVE', 'ACTIVE', NULL, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('a1000000-0000-4000-8000-000000000301', 'sopheak.chan@gmail.com'),
  ('a1000000-0000-4000-8000-000000000302', 'sreymom.vong@gmail.com'),
  ('a1000000-0000-4000-8000-000000000303', 'vichea.long@gmail.com'),
  ('a1000000-0000-4000-8000-000000000304', 'channary.pich@gmail.com'),
  ('a1000000-0000-4000-8000-000000000305', 'bunthoeun.heng@gmail.com'),
  ('a1000000-0000-4000-8000-000000000306', 'sreyleak.im@gmail.com'),
  ('a1000000-0000-4000-8000-000000000307', 'pisach.roeun@gmail.com'),
  ('a1000000-0000-4000-8000-000000000308', 'chanthou.sok@gmail.com'),
  ('a1000000-0000-4000-8000-000000000309', 'maly.ouk@gmail.com'),
  ('a1000000-0000-4000-8000-000000000310', 'rithy.kong@gmail.com')
) AS v(id, email)
ON CONFLICT DO NOTHING;

INSERT INTO user_profiles (id, user_id, email, first_name, last_name, phone_number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), v.id::uuid, v.email, v.first_name, v.last_name, v.phone, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('a1000000-0000-4000-8000-000000000301', 'sopheak.chan@gmail.com', 'Sopheak', 'Chan', '012345671'),
  ('a1000000-0000-4000-8000-000000000302', 'sreymom.vong@gmail.com', 'Sreymom', 'Vong', '012345672'),
  ('a1000000-0000-4000-8000-000000000303', 'vichea.long@gmail.com', 'Vichea', 'Long', '012345673'),
  ('a1000000-0000-4000-8000-000000000304', 'channary.pich@gmail.com', 'Channary', 'Pich', '012345674'),
  ('a1000000-0000-4000-8000-000000000305', 'bunthoeun.heng@gmail.com', 'Bunthoeun', 'Heng', '012345675'),
  ('a1000000-0000-4000-8000-000000000306', 'sreyleak.im@gmail.com', 'Sreyleak', 'Im', '012345676'),
  ('a1000000-0000-4000-8000-000000000307', 'pisach.roeun@gmail.com', 'Pisach', 'Roeun', '012345677'),
  ('a1000000-0000-4000-8000-000000000308', 'chanthou.sok@gmail.com', 'Chanthou', 'Sok', '012345678'),
  ('a1000000-0000-4000-8000-000000000309', 'maly.ouk@gmail.com', 'Maly', 'Ouk', '012345679'),
  ('a1000000-0000-4000-8000-000000000310', 'rithy.kong@gmail.com', 'Rithy', 'Kong', '012345680')
) AS v(id, email, first_name, last_name, phone)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. BANNERS (10)
-- ============================================================================
INSERT INTO banners (id, business_id, image, description, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001',
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  v.description, 'ACTIVE', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('New Year Mega Sale — Up to 50% off all hoodies'),
  ('Khmer New Year Collection 2026 — Shop Now'),
  ('Free Delivery in Phnom Penh on orders over $20'),
  ('New Arrivals: Custom Print T-Shirts'),
  ('Buy 2 Get 1 Free — Caps & Hats'),
  ('Pchum Ben Special — Family Bundle Discount'),
  ('Back to School Backpack Sale'),
  ('Limited Edition Angkor Heritage Tee'),
  ('Rainy Season Jacket Collection'),
  ('Flash Sale 24H — Accessories')
) AS v(description);

-- ============================================================================
-- 6. CATEGORIES (6)
-- ============================================================================
INSERT INTO categories (id, business_id, name, image, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001', v.name,
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  'ACTIVE', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('T-Shirts'), ('Hoodies & Jackets'), ('Caps & Hats'),
  ('Bags & Accessories'), ('Footwear'), ('Home & Lifestyle')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.name);

-- ============================================================================
-- 7. BRANDS (12)
-- ============================================================================
INSERT INTO brands (id, business_id, name, image, description, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001', v.name,
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  v.name || ' — premium quality apparel', 'ACTIVE', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Khmer Style'), ('Angkor Wear'), ('Mekong Threads'), ('Tonle Sap Co.'),
  ('Bayon Active'), ('Naga Street'), ('Kampuchea Krom'), ('Reach Denim'),
  ('Apsara Collective'), ('Sambor Kids'), ('Phnom Outdoor'), ('Lotus & Co')
) AS v(name)
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.name);

-- ============================================================================
-- 8. EXCHANGE RATES (12) — only the most recent is_active = true
-- ============================================================================
INSERT INTO exchange_rates (id, usd_to_khr_rate, is_active, notes, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), v.rate, v.active, v.notes, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  (4100.0, false, 'Jan 2026 rate'),
  (4105.0, false, 'Feb 2026 rate'),
  (4110.0, false, 'Mar 2026 rate'),
  (4108.0, false, 'Apr 2026 rate'),
  (4112.0, false, 'May 2026 rate'),
  (4115.0, false, 'Early Jun 2026 rate'),
  (4118.0, false, 'Mid Jun 2026 rate'),
  (4120.0, false, 'Jun 20 2026 rate'),
  (4122.0, false, 'Jun 22 2026 rate'),
  (4119.0, false, 'Jun 23 2026 rate'),
  (4121.0, false, 'Jun 24 2026 rate'),
  (4123.0, true,  'Current active rate (Jun 25 2026)')
) AS v(rate, active, notes);

-- ============================================================================
-- 9. DELIVERY OPTIONS (12)
-- ============================================================================
INSERT INTO delivery_options (id, business_id, name, description, image, price, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001', v.name, v.description,
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  v.price, 'ACTIVE', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Standard Delivery (Phnom Penh)', '1-2 business days within Phnom Penh', 1.50),
  ('Express Delivery (Phnom Penh)', 'Same-day delivery within Phnom Penh', 3.00),
  ('Standard Delivery (Provinces)', '2-4 business days to provinces', 3.50),
  ('Express Delivery (Provinces)', '1-2 business days to provinces', 6.00),
  ('Free Delivery (Orders over $20)', 'Free shipping promo, Phnom Penh only', 0.00),
  ('J&T Express', 'Delivered via J&T Express courier', 2.00),
  ('Virak Buntham Logistics', 'Inter-province bus delivery', 2.50),
  ('Store Pickup', 'Pick up at Khmer Style Shop outlet', 0.00),
  ('Cambodia Post', 'Standard national postal delivery', 1.80),
  ('VET (Virak Express Transport)', 'Cross-province parcel service', 2.20),
  ('Grab Express', 'On-demand courier within city', 3.50),
  ('International Shipping', 'Delivery outside Cambodia, 5-10 days', 15.00)
) AS v(name, description, price);

-- ============================================================================
-- 10. PAYMENT OPTIONS (12)
-- ============================================================================
INSERT INTO payment_options (id, business_id, name, payment_option_type, status, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001', v.name, v.type, 'ACTIVE', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Cash on Delivery', 'CASH'),
  ('Cash at Store', 'CASH'),
  ('ABA Bank Transfer', 'BANK'),
  ('ACLEDA Bank Transfer', 'BANK'),
  ('Canadia Bank Transfer', 'BANK'),
  ('Wing Money', 'BANK'),
  ('Bakong (NBC)', 'BANK'),
  ('TrueMoney', 'BANK'),
  ('PiPay', 'BANK'),
  ('Sathapana Bank Transfer', 'BANK'),
  ('PayPal', 'BANK'),
  ('Visa / Mastercard', 'BANK')
) AS v(name, type);

-- ============================================================================
-- 11. PRODUCTS — NO SIZE, NO CUSTOMIZE (12)
-- ============================================================================
INSERT INTO products (id, business_id, category_id, brand_id, name, description, price, main_image, barcode, sku, status, stock_status, has_sizes, view_count, favorite_count, category_name, brand_name, business_name, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001',
  (SELECT id FROM categories WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.category),
  (SELECT id FROM brands WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.brand),
  v.name, v.name || ' — quality product from Khmer Style Shop', v.price,
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  v.sku, v.sku, 'ACTIVE', 'ENABLED', false, 0, 0, v.category, v.brand, 'Khmer Style Shop', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Khmer Style Canvas Tote Bag', 'Bags & Accessories', 'Lotus & Co', 8.00, 'KS-BAG-001'),
  ('Angkor Wat Embroidered Cap', 'Caps & Hats', 'Angkor Wear', 7.50, 'KS-CAP-001'),
  ('Leather Wallet Classic Brown', 'Bags & Accessories', 'Reach Denim', 12.00, 'KS-WAL-001'),
  ('Naga Street Bucket Hat', 'Caps & Hats', 'Naga Street', 9.00, 'KS-CAP-002'),
  ('Bayon Active Sports Socks (3-pack)', 'Bags & Accessories', 'Bayon Active', 5.00, 'KS-SOX-001'),
  ('Mekong Threads Travel Backpack', 'Bags & Accessories', 'Mekong Threads', 22.00, 'KS-BAG-002'),
  ('Phnom Outdoor Waist Bag', 'Bags & Accessories', 'Phnom Outdoor', 10.00, 'KS-BAG-003'),
  ('Apsara Collective Hair Scarf', 'Bags & Accessories', 'Apsara Collective', 4.50, 'KS-ACC-001'),
  ('Tonle Sap Co. Sunglasses', 'Bags & Accessories', 'Tonle Sap Co.', 6.50, 'KS-ACC-002'),
  ('Khmer Style Keychain Set', 'Bags & Accessories', 'Khmer Style', 3.00, 'KS-ACC-003'),
  ('Sambor Kids Mini Backpack', 'Bags & Accessories', 'Sambor Kids', 11.00, 'KS-BAG-004'),
  ('Kampuchea Krom Woven Belt', 'Bags & Accessories', 'Kampuchea Krom', 7.00, 'KS-ACC-004')
) AS v(name, category, brand, price, sku);

-- ============================================================================
-- 12. PRODUCTS — HAVE SIZE (12), each gets S/M/L/XL rows in product_sizes
-- ============================================================================
INSERT INTO products (id, business_id, category_id, brand_id, name, description, price, main_image, barcode, sku, status, stock_status, has_sizes, view_count, favorite_count, category_name, brand_name, business_name, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001',
  (SELECT id FROM categories WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.category),
  (SELECT id FROM brands WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.brand),
  v.name, v.name || ' — available in multiple sizes', NULL,
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  v.sku, v.sku, 'ACTIVE', 'ENABLED', true, 0, 0, v.category, v.brand, 'Khmer Style Shop', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Classic Logo T-Shirt', 'T-Shirts', 'Khmer Style', 6.00, 'KS-TS-001'),
  ('Angkor Heritage Graphic Tee', 'T-Shirts', 'Angkor Wear', 6.50, 'KS-TS-002'),
  ('Mekong Threads Organic Cotton Tee', 'T-Shirts', 'Mekong Threads', 7.00, 'KS-TS-003'),
  ('Naga Street Oversized Hoodie', 'Hoodies & Jackets', 'Naga Street', 14.00, 'KS-HD-001'),
  ('Bayon Active Zip-Up Jacket', 'Hoodies & Jackets', 'Bayon Active', 15.00, 'KS-HD-002'),
  ('Reach Denim Jacket', 'Hoodies & Jackets', 'Reach Denim', 18.00, 'KS-HD-003'),
  ('Apsara Collective Blouse', 'T-Shirts', 'Apsara Collective', 8.00, 'KS-TS-004'),
  ('Tonle Sap Co. Polo Shirt', 'T-Shirts', 'Tonle Sap Co.', 7.50, 'KS-TS-005'),
  ('Sambor Kids Graphic Tee', 'T-Shirts', 'Sambor Kids', 5.50, 'KS-TS-006'),
  ('Phnom Outdoor Windbreaker', 'Hoodies & Jackets', 'Phnom Outdoor', 16.00, 'KS-HD-004'),
  ('Kampuchea Krom Sweatshirt', 'Hoodies & Jackets', 'Kampuchea Krom', 14.50, 'KS-HD-005'),
  ('Khmer Style Rain Jacket', 'Hoodies & Jackets', 'Khmer Style', 17.00, 'KS-HD-006')
) AS v(name, category, brand, price, sku);

INSERT INTO product_sizes (id, product_id, name, price, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), p.id, s.size_name,
  (p_price.price + s.increment)::numeric,
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM products p
JOIN (VALUES
  ('Classic Logo T-Shirt', 6.00), ('Angkor Heritage Graphic Tee', 6.50), ('Mekong Threads Organic Cotton Tee', 7.00),
  ('Naga Street Oversized Hoodie', 14.00), ('Bayon Active Zip-Up Jacket', 15.00), ('Reach Denim Jacket', 18.00),
  ('Apsara Collective Blouse', 8.00), ('Tonle Sap Co. Polo Shirt', 7.50), ('Sambor Kids Graphic Tee', 5.50),
  ('Phnom Outdoor Windbreaker', 16.00), ('Kampuchea Krom Sweatshirt', 14.50), ('Khmer Style Rain Jacket', 17.00)
) AS p_price(name, price) ON p.name = p_price.name
CROSS JOIN (VALUES ('S', 0.0), ('M', 0.5), ('L', 1.0), ('XL', 1.5)) AS s(size_name, increment)
WHERE p.business_id = 'a1000000-0000-4000-8000-000000000001' AND p.has_sizes = true;

-- ============================================================================
-- 13. PRODUCTS — WITH CUSTOMIZE, NO SIZE (12)
-- ============================================================================
INSERT INTO products (id, business_id, category_id, brand_id, name, description, price, main_image, barcode, sku, status, stock_status, has_sizes, view_count, favorite_count, category_name, brand_name, business_name, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001',
  (SELECT id FROM categories WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.category),
  (SELECT id FROM brands WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.brand),
  v.name, v.name || ' — fully customizable', v.price,
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  v.sku, v.sku, 'ACTIVE', 'ENABLED', false, 0, 0, v.category, v.brand, 'Khmer Style Shop', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Custom Photo Mug', 'Home & Lifestyle', 'Khmer Style', 6.00, 'KS-CUS-001'),
  ('Personalized Phone Case', 'Home & Lifestyle', 'Lotus & Co', 8.50, 'KS-CUS-002'),
  ('Custom Name Keychain', 'Home & Lifestyle', 'Khmer Style', 4.00, 'KS-CUS-003'),
  ('Engraved Wooden Photo Frame', 'Home & Lifestyle', 'Angkor Wear', 10.00, 'KS-CUS-004'),
  ('Custom Embroidered Tote Bag', 'Bags & Accessories', 'Mekong Threads', 9.50, 'KS-CUS-005'),
  ('Personalized Leather Wallet', 'Bags & Accessories', 'Reach Denim', 14.00, 'KS-CUS-006'),
  ('Custom Print Canvas Print', 'Home & Lifestyle', 'Apsara Collective', 15.00, 'KS-CUS-007'),
  ('Custom Initial Necklace', 'Bags & Accessories', 'Lotus & Co', 7.00, 'KS-CUS-008'),
  ('Personalized Water Bottle', 'Home & Lifestyle', 'Bayon Active', 8.00, 'KS-CUS-009'),
  ('Custom Family Calendar', 'Home & Lifestyle', 'Khmer Style', 6.50, 'KS-CUS-010'),
  ('Custom Pet Portrait Print', 'Home & Lifestyle', 'Apsara Collective', 18.00, 'KS-CUS-011'),
  ('Personalized Cap (No Size)', 'Caps & Hats', 'Naga Street', 9.00, 'KS-CUS-012')
) AS v(name, category, brand, price, sku);

INSERT INTO product_customizations (id, product_id, name, price_adjustment, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), p.id, c.name, c.price_adjustment, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM products p
CROSS JOIN (VALUES
  ('Add Custom Text', 1.00), ('Add Custom Photo', 2.00), ('Gift Wrapping', 1.50), ('Premium Material Upgrade', 3.00)
) AS c(name, price_adjustment)
WHERE p.business_id = 'a1000000-0000-4000-8000-000000000001'
  AND p.sku LIKE 'KS-CUS-%';

-- ============================================================================
-- 14. PRODUCTS — HAVE SIZE + CUSTOMIZE (12)
-- ============================================================================
INSERT INTO products (id, business_id, category_id, brand_id, name, description, price, main_image, barcode, sku, status, stock_status, has_sizes, view_count, favorite_count, category_name, brand_name, business_name, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000001',
  (SELECT id FROM categories WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.category),
  (SELECT id FROM brands WHERE business_id = 'a1000000-0000-4000-8000-000000000001' AND name = v.brand),
  v.name, v.name || ' — sized and customizable', NULL,
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  v.sku, v.sku, 'ACTIVE', 'ENABLED', true, 0, 0, v.category, v.brand, 'Khmer Style Shop', 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Custom Name Print T-Shirt', 'T-Shirts', 'Khmer Style', 7.00, 'KS-SCU-001'),
  ('Custom Team Jersey', 'T-Shirts', 'Bayon Active', 9.00, 'KS-SCU-002'),
  ('Personalized Hoodie', 'Hoodies & Jackets', 'Naga Street', 14.00, 'KS-SCU-003'),
  ('Custom Family Matching Tee', 'T-Shirts', 'Sambor Kids', 6.50, 'KS-SCU-004'),
  ('Custom Wedding Couple Shirt', 'T-Shirts', 'Apsara Collective', 8.00, 'KS-SCU-005'),
  ('Custom Embroidered Jacket', 'Hoodies & Jackets', 'Reach Denim', 18.00, 'KS-SCU-006'),
  ('Custom Logo Polo Shirt (Company)', 'T-Shirts', 'Tonle Sap Co.', 8.50, 'KS-SCU-007'),
  ('Custom Graphic Print Hoodie', 'Hoodies & Jackets', 'Mekong Threads', 15.00, 'KS-SCU-008'),
  ('Custom School Uniform Shirt', 'T-Shirts', 'Sambor Kids', 5.50, 'KS-SCU-009'),
  ('Custom Event Staff T-Shirt', 'T-Shirts', 'Khmer Style', 6.00, 'KS-SCU-010'),
  ('Personalized Sports Jacket', 'Hoodies & Jackets', 'Bayon Active', 17.00, 'KS-SCU-011'),
  ('Custom Anniversary Couple Hoodie', 'Hoodies & Jackets', 'Angkor Wear', 16.00, 'KS-SCU-012')
) AS v(name, category, brand, price, sku);

INSERT INTO product_sizes (id, product_id, name, price, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), p.id, s.size_name, (pp.price + s.increment)::numeric, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM products p
JOIN (VALUES
  ('Custom Name Print T-Shirt', 7.00), ('Custom Team Jersey', 9.00), ('Personalized Hoodie', 14.00),
  ('Custom Family Matching Tee', 6.50), ('Custom Wedding Couple Shirt', 8.00), ('Custom Embroidered Jacket', 18.00),
  ('Custom Logo Polo Shirt (Company)', 8.50), ('Custom Graphic Print Hoodie', 15.00), ('Custom School Uniform Shirt', 5.50),
  ('Custom Event Staff T-Shirt', 6.00), ('Personalized Sports Jacket', 17.00), ('Custom Anniversary Couple Hoodie', 16.00)
) AS pp(name, price) ON p.name = pp.name
CROSS JOIN (VALUES ('S', 0.0), ('M', 0.5), ('L', 1.0), ('XL', 1.5)) AS s(size_name, increment)
WHERE p.business_id = 'a1000000-0000-4000-8000-000000000001' AND p.sku LIKE 'KS-SCU-%';

INSERT INTO product_customizations (id, product_id, name, price_adjustment, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), p.id, c.name, c.price_adjustment, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM products p
CROSS JOIN (VALUES
  ('Add Custom Text', 1.00), ('Add Custom Photo', 2.00), ('Add Custom Name & Date', 1.50), ('Premium Fabric Upgrade', 3.00)
) AS c(name, price_adjustment)
WHERE p.business_id = 'a1000000-0000-4000-8000-000000000001'
  AND p.sku LIKE 'KS-SCU-%';

-- ============================================================================
-- 15. PORTFOLIO (full profile)
-- ============================================================================
INSERT INTO portfolio_profile (id, business_id, business_name, description, logo, cover_image, contact_email, contact_phone, contact_whatsapp, contact_telegram, address, map_link, version, is_deleted, created_at, updated_at, created_by, updated_by)
VALUES (
  'a1000000-0000-4000-8000-000000000901',
  'a1000000-0000-4000-8000-000000000001',
  'Khmer Style Shop',
  'Khmer Style Shop is a Cambodian-born fashion and lifestyle brand offering trendy apparel, accessories, and fully customizable prints — blending modern streetwear with Khmer heritage design since 2020.',
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  'hello@khmerstyleshop.com', '023 900 123', '855 12 345 671', '@khmerstyleshop',
  '#45, Street 113, Toul Kork, Phnom Penh, Cambodia',
  'https://maps.google.com/?q=Khmer+Style+Shop+Phnom+Penh',
  0, false, NOW(), NOW(), 'admin', 'admin'
) ON CONFLICT DO NOTHING;

INSERT INTO portfolio_phone (id, profile_id, number, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000901', v.number, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES ('023 900 123'), ('012 345 671'), ('096 555 871')) AS v(number);

INSERT INTO portfolio_social_media (id, profile_id, name, url, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000901', v.name, v.url, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Facebook', 'https://facebook.com/khmerstyleshop'),
  ('Instagram', 'https://instagram.com/khmerstyleshop'),
  ('TikTok', 'https://tiktok.com/@khmerstyleshop'),
  ('Telegram', 'https://t.me/khmerstyleshop')
) AS v(name, url);

INSERT INTO portfolio_feature (id, profile_id, name, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000901', v.name, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Free Delivery in Phnom Penh on orders over $20'),
  ('Custom Printing on almost any product'),
  ('Authentic Quality — premium cotton and durable materials'),
  ('Fast Support — replies within 30 minutes on Telegram/WhatsApp')
) AS v(name);

INSERT INTO portfolio_hours (id, profile_id, day, open_time, close_time, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000901', v.day, v.open_time, v.close_time, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('MONDAY', '08:00', '19:00'), ('TUESDAY', '08:00', '19:00'), ('WEDNESDAY', '08:00', '19:00'),
  ('THURSDAY', '08:00', '19:00'), ('FRIDAY', '08:00', '20:00'), ('SATURDAY', '08:00', '20:00'),
  ('SUNDAY', '09:00', '18:00')
) AS v(day, open_time, close_time);

INSERT INTO portfolio_gallery (id, profile_id, image, title, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000901',
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  v.title, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Our flagship store in Toul Kork'),
  ('Custom print studio in action'),
  ('The Khmer Style Shop team'),
  ('2026 New Year Collection launch')
) AS v(title);

INSERT INTO portfolio_service_item (id, profile_id, name, description, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000901', v.name, v.description, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Custom Apparel Printing', 'Bulk and individual custom printing for events, teams, schools'),
  ('Corporate Uniform Orders', 'Custom branded uniforms for businesses'),
  ('Gift Wrapping & Personalization', 'Personalized gifts for special occasions')
) AS v(name, description);

INSERT INTO portfolio_team_member (id, profile_id, name, position, bio, photo, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000901', v.name, v.position, v.bio,
  '{"sm":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","md":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce","o":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce"}'::jsonb,
  0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Vannak Sok', 'Founder & CEO', 'Leads brand vision and strategy for Khmer Style Shop.'),
  ('Sreypov Chan', 'Head of Design', 'Creates the seasonal collections and custom print designs.'),
  ('Sokha Pen', 'Operations Manager', 'Oversees daily operations, inventory and order fulfillment.')
) AS v(name, position, bio);

INSERT INTO portfolio_custom_stat (id, profile_id, label, stat_value, version, is_deleted, created_at, updated_at, created_by, updated_by)
SELECT gen_random_uuid(), 'a1000000-0000-4000-8000-000000000901', v.label, v.value, 0, false, NOW(), NOW(), 'admin', 'admin'
FROM (VALUES
  ('Happy Customers', '5,000+'),
  ('Products Sold', '20,000+'),
  ('Years in Business', '6'),
  ('Provinces Delivered', '25')
) AS v(label, value);
