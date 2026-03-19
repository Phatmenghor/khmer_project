-- ============================================================
-- ULTIMATE MASSIVE TEST DATA - PRODUCTION READY (CORRECTED)
-- ============================================================
-- ENHANCED WITH 4X PRODUCTS: 180,000 Items
-- ============================================================
-- DATA MULTIPLICATION:
--   Platform: 1 key + 40,000 admins = 40,001 total
--   Business: 1 key + 60,000 staff = 60,001 total
--   Customers: 1 key + 120,000 customers = 120,001 total
--
-- BUSINESS USER (phatmenghor20@gmail.com):
--   📦 180,000 PRODUCTS (4x increase!)
--   📸 720,000+ Product Images (4 per product)
--   📌 240 Categories (4x)
--   🎨 240 Brands (4x)
--   🚚 150 Delivery Options
--   📢 300 Banners
--   📅 500 Work Schedules
--   👥 20,000 Attendances
--   🕐 40,000 Check-ins
--   📄 5,000 Leaves
--
-- VERIFIED ENUM VALUES:
--   Promotion Types: PERCENTAGE, FIXED_AMOUNT
--   Payment Methods: CASH, BANK_TRANSFER, ONLINE, OTHER
--   Order Status: Pending, Confirmed, Preparing, Ready, In Delivery, Delivered, Completed, Cancelled, Refunded, Failed
--   Account Status: ACTIVE, INACTIVE, LOCKED, SUSPENDED
--   User Types: PLATFORM_USER, BUSINESS_USER, CUSTOMER
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
SET synchronous_commit TO OFF;

DO $$
DECLARE
    v_start_time TIMESTAMPTZ := NOW();
    t TIMESTAMPTZ := NOW();
    photo1 TEXT := 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop';
    photo2 TEXT := 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop';

    role_admin UUID := gen_random_uuid();
    role_business UUID := gen_random_uuid();
    role_customer UUID := gen_random_uuid();
    plan1 UUID := gen_random_uuid();
    plan2 UUID := gen_random_uuid();
    plan3 UUID := gen_random_uuid();

    -- KEY USERS
    platform_user_id UUID := gen_random_uuid();
    business_user_id UUID := gen_random_uuid();
    customer_user_id UUID := gen_random_uuid();
    key_business_id UUID := gen_random_uuid();

    v_product_count INT := 0;
    v_image_count INT := 0;
    v_order_count INT := 0;
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '🚀 ULTIMATE TEST DATA GENERATION (4x PRODUCTS - CORRECTED)';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE 'Started: %', v_start_time;
    RAISE NOTICE '';

    -- ========== CLEANUP PHASE ==========
    RAISE NOTICE '📋 Phase 1: Cleaning database...';
    TRUNCATE TABLE order_status_history CASCADE;
    TRUNCATE TABLE order_items CASCADE;
    TRUNCATE TABLE order_payments CASCADE;
    TRUNCATE TABLE orders CASCADE;
    TRUNCATE TABLE order_process_statuses CASCADE;
    TRUNCATE TABLE cart_items CASCADE;
    TRUNCATE TABLE carts CASCADE;
    TRUNCATE TABLE product_favorites CASCADE;
    TRUNCATE TABLE product_images CASCADE;
    TRUNCATE TABLE product_sizes CASCADE;
    TRUNCATE TABLE products CASCADE;
    TRUNCATE TABLE banners CASCADE;
    TRUNCATE TABLE delivery_options CASCADE;
    TRUNCATE TABLE business_exchange_rates CASCADE;
    TRUNCATE TABLE subscriptions CASCADE;
    TRUNCATE TABLE subscription_plans CASCADE;
    TRUNCATE TABLE customer_addresses CASCADE;
    TRUNCATE TABLE attendance_check_ins CASCADE;
    TRUNCATE TABLE attendances CASCADE;
    TRUNCATE TABLE leaves CASCADE;
    TRUNCATE TABLE work_schedules CASCADE;
    TRUNCATE TABLE business_settings CASCADE;
    TRUNCATE TABLE categories CASCADE;
    TRUNCATE TABLE brands CASCADE;
    TRUNCATE TABLE user_roles CASCADE;
    TRUNCATE TABLE businesses CASCADE;
    TRUNCATE TABLE users CASCADE;
    TRUNCATE TABLE roles CASCADE;
    TRUNCATE TABLE exchange_rates CASCADE;
    TRUNCATE TABLE reference_counters CASCADE;
    RAISE NOTICE '✅ Database cleaned!';
    RAISE NOTICE '';

    -- ========== ROLES ==========
    RAISE NOTICE '⚙️  Phase 2: Creating roles...';
    INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type)
    VALUES
        (role_admin, 0, t, t, 'system', 'system', false, NULL, NULL, 'PLATFORM_ADMIN', 'Platform Administrator', NULL, 'PLATFORM_USER'),
        (role_business, 0, t, t, 'system', 'system', false, NULL, NULL, 'BUSINESS_OWNER', 'Business Owner', NULL, 'BUSINESS_USER'),
        (role_customer, 0, t, t, 'system', 'system', false, NULL, NULL, 'CUSTOMER', 'Customer', NULL, 'CUSTOMER');
    RAISE NOTICE '✅ 3 roles created';

    -- ========== KEY USERS ==========
    RAISE NOTICE '👤 Phase 3: Creating key users...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES
        (platform_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'phatmenghor19@gmail.com', 'phatmenghor19@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Platform', 'Admin', '+855 10 100 0001', photo1, 'PLATFORM_USER', 'ACTIVE', NULL, 'Platform Admin', 'Phnom Penh', 'Key Platform Admin', t - INTERVAL '1 day', t, 1),
        (business_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'phatmenghor20@gmail.com', 'phatmenghor20@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Business', 'Manager', '+855 10 200 0001', photo2, 'BUSINESS_USER', 'ACTIVE', NULL, 'Business Manager', 'Phnom Penh', 'Key Business Manager', t - INTERVAL '2 days', t, 1),
        (customer_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'phatmenghor21@gmail.com', 'phatmenghor21@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Customer', 'User', '+855 10 300 0001', photo1, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh', 'Key Customer', t - INTERVAL '5 days', t, 1);

    INSERT INTO user_roles (user_id, role_id)
    SELECT business_user_id, role_business
    UNION ALL
    SELECT customer_user_id, role_customer
    UNION ALL
    SELECT platform_user_id, role_admin;
    RAISE NOTICE '✅ 3 key users created';

    -- ========== SUBSCRIPTION PLANS ==========
    RAISE NOTICE '💰 Phase 4: Creating subscription plans...';
    INSERT INTO subscription_plans (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, price, duration_days, status)
    VALUES
        (plan1, 0, t, t, 'system', 'system', false, NULL, NULL, 'Basic Plan', 'Basic features', 99.99, 30, 'PUBLIC'),
        (plan2, 0, t, t, 'system', 'system', false, NULL, NULL, 'Pro Plan', 'Advanced features', 299.99, 365, 'PUBLIC'),
        (plan3, 0, t, t, 'system', 'system', false, NULL, NULL, 'Enterprise', 'Enterprise features', 999.99, 365, 'PUBLIC');
    RAISE NOTICE '✅ 3 subscription plans created';

    -- ========== KEY BUSINESS ==========
    RAISE NOTICE '🏢 Phase 5: Creating key business...';
    INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, owner_id, name, email, phone, address, description, status, is_subscription_active)
    VALUES
        (key_business_id, 0, t, t, 'system', 'system', false, NULL, NULL, platform_user_id, 'Phatmenghor MEGA Business', 'mega@test.com', '+855 23 9999999', 'Phnom Penh, Cambodia', 'Ultimate business with 180K products!', 'ACTIVE', true);

    INSERT INTO business_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, logo_url, banner_url, business_type, opening_time, closing_time, is_open_24_hours, working_days, timezone, currency, language, usd_to_khr_rate, contact_email, contact_phone, whatsapp_number, facebook_url, instagram_url, website_url, primary_color, secondary_color, email_notifications_enabled, sms_notifications_enabled, order_notifications_enabled, tax_rate, service_charge_percentage, min_order_amount, delivery_radius_km, estimated_delivery_time, terms_and_conditions, privacy_policy, refund_policy)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, photo1, photo2, 'MEGA_STORE', '06:00', '23:00', false, 'MONDAY-SUNDAY', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, 'mega@test.com', '+855 23 9999999', '+855 10 100 0001', photo1, photo2, photo1, '#FF6B6B', '#FFE66D', true, true, true, 0.0, 10.0, 5.0, 25.0, '30-45 minutes', 'Premium guarantee', 'Data protection', 'Full refund');

    INSERT INTO subscriptions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, plan_id, start_date, end_date, auto_renew)
    VALUES
        (gen_random_uuid(), 0, t - INTERVAL '6 months', t, 'system', 'system', false, NULL, NULL, key_business_id, plan2, t - INTERVAL '6 months', t + INTERVAL '12 months', true);
    RAISE NOTICE '✅ Key business created with settings';

    -- ========== 40,000 PLATFORM ADMINS ==========
    RAISE NOTICE '👥 Phase 6: Creating 40,000 platform admins...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        'admin' || n || '@platform.com', 'admin' || n || '@platform.com',
        '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Admin' || n, 'User' || n,
        '+855 10 100 ' || LPAD((n % 10000)::TEXT, 4, '0'),
        CASE WHEN n % 2 = 0 THEN photo1 ELSE photo2 END, 'PLATFORM_USER', 'ACTIVE', NULL,
        'Platform Admin', 'Phnom Penh', 'Admin ' || n, t - (RANDOM() * INTERVAL '90 days'), t - (RANDOM() * INTERVAL '7 days'), 1
    FROM GENERATE_SERIES(1, 40000) n;

    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, role_admin FROM users u WHERE u.user_type = 'PLATFORM_USER' AND u.id != platform_user_id;
    RAISE NOTICE '✅ 40,000 platform admins created';

    -- ========== 99 OTHER BUSINESSES ==========
    RAISE NOTICE '🏢 Phase 7: Creating 99 other businesses...';
    INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, owner_id, name, email, phone, address, description, status, is_subscription_active)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        (SELECT u.id FROM users u WHERE u.user_type = 'PLATFORM_USER' ORDER BY RANDOM() LIMIT 1),
        'Business ' || n, 'business' || n || '@test.com', '+855 23 ' || LPAD((n % 10000)::TEXT, 4, '0'),
        'Address ' || n || ', Phnom Penh', 'Business ' || n, 'ACTIVE',
        CASE WHEN n % 2 = 0 THEN true ELSE false END
    FROM GENERATE_SERIES(1, 99) n;

    INSERT INTO business_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, logo_url, banner_url, business_type, opening_time, closing_time, is_open_24_hours, working_days, timezone, currency, language, usd_to_khr_rate, contact_email, contact_phone, whatsapp_number, facebook_url, instagram_url, website_url, primary_color, secondary_color, email_notifications_enabled, sms_notifications_enabled, order_notifications_enabled, tax_rate, service_charge_percentage, min_order_amount, delivery_radius_km, estimated_delivery_time, terms_and_conditions, privacy_policy, refund_policy)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, bs.id,
        photo1, photo2, 'RESTAURANT', '06:00', '23:00', false, 'MONDAY-SUNDAY', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0,
        bs.email, bs.phone, '+855 10 100 0001', photo1, photo2, photo1, '#FF6B6B', '#FFE66D', true, false, true, 0.0, 10.0, 5.0, 25.0, '30-45 minutes', 'Fresh guarantee', 'Data protection', 'Full refund'
    FROM businesses bs WHERE bs.id != key_business_id;

    INSERT INTO subscriptions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, plan_id, start_date, end_date, auto_renew)
    SELECT gen_random_uuid(), 0, t - INTERVAL '6 months', t, 'system', 'system', false, NULL, NULL, bs.id,
        CASE (ROW_NUMBER() OVER (ORDER BY bs.id) % 3) WHEN 0 THEN plan1 WHEN 1 THEN plan2 ELSE plan3 END,
        t - INTERVAL '6 months', t + INTERVAL '6 months', true
    FROM businesses bs;
    RAISE NOTICE '✅ 99 businesses created';

    -- ========== BUSINESS ROLES (12 per business) ==========
    INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        CASE r WHEN 1 THEN 'Manager' WHEN 2 THEN 'Chef' WHEN 3 THEN 'Sous Chef' WHEN 4 THEN 'Waiter' WHEN 5 THEN 'Cashier' WHEN 6 THEN 'Delivery Driver' WHEN 7 THEN 'Kitchen Staff' WHEN 8 THEN 'Supervisor' WHEN 9 THEN 'Accountant' WHEN 10 THEN 'Marketing' WHEN 11 THEN 'HR Officer' WHEN 12 THEN 'Customer Service' END,
        'Business Role ' || r, br.id, 'BUSINESS_USER'
    FROM businesses br, GENERATE_SERIES(1, 12) r;

    -- ========== 60,000 BUSINESS USERS ==========
    RAISE NOTICE '👥 Phase 8: Creating 60,000 business users...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        'staff' || b_idx || '-' || s || '@business.com', 'staff' || b_idx || '-' || s || '@business.com',
        '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Staff', 'Member ' || b_idx || '-' || s,
        '+855 10 200 ' || LPAD((s)::TEXT, 4, '0'),
        CASE WHEN s % 2 = 0 THEN photo1 ELSE photo2 END, 'BUSINESS_USER', 'ACTIVE',
        (SELECT id FROM businesses WHERE id != key_business_id ORDER BY id OFFSET ((b_idx - 1) % 99) LIMIT 1),
        'Position ' || s, 'Business Address', 'Staff ' || b_idx || '-' || s,
        t - (RANDOM() * INTERVAL '30 days'), t - (RANDOM() * INTERVAL '2 days'), 1
    FROM GENERATE_SERIES(1, 100) b_idx, GENERATE_SERIES(1, 600) s;

    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, r.id FROM users u JOIN businesses b ON u.business_id = b.id JOIN roles r ON r.business_id = b.id
    WHERE u.user_type = 'BUSINESS_USER' AND u.id != business_user_id LIMIT 60000;
    RAISE NOTICE '✅ 60,000 business users created';

    -- ========== 120,000 CUSTOMERS ==========
    RAISE NOTICE '👤 Phase 9: Creating 120,000 customers...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        'customer' || n || '@test.com', 'customer' || n || '@test.com',
        '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Customer' || n, 'User' || n,
        '+855 10 300 ' || LPAD((n % 10000)::TEXT, 4, '0'),
        CASE WHEN n % 2 = 0 THEN photo1 ELSE photo2 END, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh',
        'Customer ' || n, t - (RANDOM() * INTERVAL '60 days'), t - (RANDOM() * INTERVAL '5 days'), 1
    FROM GENERATE_SERIES(1, 120000) n;

    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, role_customer FROM users u WHERE u.user_type = 'CUSTOMER';
    RAISE NOTICE '✅ 120,000 customers created';
    RAISE NOTICE '';

    -- ========== 240 CATEGORIES (4x) FOR KEY BUSINESS ==========
    RAISE NOTICE '📂 Phase 10: Creating 240 categories...';
    INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id,
        'Category ' || c || ' (' ||
        CASE (c % 8)
            WHEN 0 THEN 'Premium'
            WHEN 1 THEN 'Budget'
            WHEN 2 THEN 'New'
            WHEN 3 THEN 'Popular'
            WHEN 4 THEN 'Sale'
            WHEN 5 THEN 'Seasonal'
            WHEN 6 THEN 'Limited'
            ELSE 'Exclusive'
        END || ')',
        CASE WHEN c % 2 = 0 THEN photo1 ELSE photo2 END, 'ACTIVE'
    FROM GENERATE_SERIES(1, 240) c;
    RAISE NOTICE '✅ 240 categories created';

    -- ========== 240 BRANDS (4x) FOR KEY BUSINESS ==========
    RAISE NOTICE '🎨 Phase 11: Creating 240 brands...';
    INSERT INTO brands (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url, description, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id,
        'Brand ' || br || ' - ' || CASE (br % 5)
            WHEN 0 THEN 'Premium'
            WHEN 1 THEN 'Standard'
            WHEN 2 THEN 'Economy'
            WHEN 3 THEN 'Luxury'
            ELSE 'Boutique'
        END,
        CASE WHEN br % 2 = 0 THEN photo1 ELSE photo2 END,
        'Premium brand with quality products ' || br, 'ACTIVE'
    FROM GENERATE_SERIES(1, 240) br;
    RAISE NOTICE '✅ 240 brands created';

    -- ========== 180,000 PRODUCTS (4x!) FOR KEY BUSINESS ==========
    RAISE NOTICE '📦 Phase 12: Creating 180,000 PRODUCTS (4x increase!)...';
    INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, category_id, brand_id, name, description, status, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, display_price, display_origin_price, display_promotion_type, display_promotion_value, display_promotion_from_date, display_promotion_to_date, has_sizes, has_active_promotion, view_count, favorite_count, main_image_url)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id,
        (SELECT id FROM categories WHERE business_id = key_business_id ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM brands WHERE business_id = key_business_id ORDER BY RANDOM() LIMIT 1),
        'Premium Product ' || p || ' (' || CASE (p % 100) WHEN 0 THEN 'Bestseller' WHEN 1 THEN 'New' ELSE 'Popular' END || ')',
        'High-quality product with comprehensive description - Item #' || p, 'ACTIVE',
        (15.00 + (p % 300))::NUMERIC,
        CASE WHEN p % 2 = 0 THEN 'PERCENTAGE' WHEN p % 2 = 1 THEN 'FIXED_AMOUNT' ELSE NULL END,
        CASE WHEN p % 2 = 0 THEN (5 + (p % 40)) WHEN p % 2 = 1 THEN (2.00 + (p % 50)) ELSE NULL END,
        CASE WHEN p % 2 > 0 THEN t - INTERVAL '5 days' ELSE NULL END,
        CASE WHEN p % 2 > 0 THEN t + INTERVAL '90 days' ELSE NULL END,
        (15.00 + (p % 300))::NUMERIC,
        (15.00 + (p % 300))::NUMERIC,
        CASE WHEN p % 2 = 0 THEN 'PERCENTAGE' WHEN p % 2 = 1 THEN 'FIXED_AMOUNT' ELSE NULL END,
        CASE WHEN p % 2 = 0 THEN (5 + (p % 40)) WHEN p % 2 = 1 THEN (2.00 + (p % 50)) ELSE NULL END,
        CASE WHEN p % 2 > 0 THEN t - INTERVAL '5 days' ELSE NULL END,
        CASE WHEN p % 2 > 0 THEN t + INTERVAL '90 days' ELSE NULL END,
        CASE WHEN p % 4 = 0 THEN true ELSE false END,
        CASE WHEN p % 2 = 0 THEN true ELSE false END,
        (p % 10000),
        (p % 1000),
        CASE WHEN p % 2 = 0 THEN photo1 ELSE photo2 END
    FROM GENERATE_SERIES(1, 180000) p;

    SELECT COUNT(*) INTO v_product_count FROM products WHERE business_id = key_business_id;
    RAISE NOTICE '✅ % products created!', v_product_count;

    -- ========== 720,000+ PRODUCT IMAGES (4 per product) ==========
    RAISE NOTICE '📸 Phase 13: Creating 720,000+ product images...';
    INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, p.id,
        CASE WHEN (ROW_NUMBER() OVER (PARTITION BY p.id) - 1) % 2 = 0 THEN photo1 ELSE photo2 END
    FROM products p, GENERATE_SERIES(1, 4) img_num
    WHERE p.business_id = key_business_id;

    SELECT COUNT(*) INTO v_image_count FROM product_images;
    RAISE NOTICE '✅ % product images created!', v_image_count;

    -- ========== PRODUCT SIZES FOR SIZED PRODUCTS ==========
    RAISE NOTICE '📏 Phase 14: Creating product sizes...';
    INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, name, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, p.id,
        CASE s WHEN 1 THEN 'XS/Small' WHEN 2 THEN 'S/Medium' WHEN 3 THEN 'M/Large' WHEN 4 THEN 'L/XL' WHEN 5 THEN 'XXL/Plus' END,
        (p.price + (s * 2.5))::NUMERIC, p.promotion_type, p.promotion_value, p.promotion_from_date, p.promotion_to_date
    FROM (SELECT id, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date FROM products WHERE has_sizes = true AND business_id = key_business_id) p,
    GENERATE_SERIES(1, 5) s;
    RAISE NOTICE '✅ Product sizes created!';

    -- ========== 150 DELIVERY OPTIONS ==========
    RAISE NOTICE '🚚 Phase 15: Creating 150 delivery options...';
    INSERT INTO delivery_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, image_url, price, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id,
        CASE (d % 5)
            WHEN 0 THEN 'Standard Delivery'
            WHEN 1 THEN 'Express Delivery (1hr)'
            WHEN 2 THEN 'Scheduled Delivery'
            WHEN 3 THEN 'Pickup at Store'
            ELSE 'Dine-in Service'
        END,
        CASE (d % 5)
            WHEN 0 THEN 'Regular delivery within 24 hours'
            WHEN 1 THEN 'Ultra-fast delivery in 1 hour'
            WHEN 2 THEN 'Choose your delivery time'
            WHEN 3 THEN 'Pickup from store location'
            ELSE 'Enjoy dining at our location'
        END,
        CASE WHEN d % 2 = 0 THEN photo1 ELSE photo2 END,
        CASE (d % 5) WHEN 0 THEN 2.00 WHEN 1 THEN 5.00 WHEN 2 THEN 2.50 WHEN 3 THEN 0.00 ELSE 0.00 END, 'ACTIVE'
    FROM GENERATE_SERIES(1, 150) d;
    RAISE NOTICE '✅ 150 delivery options created';

    -- ========== 300 BANNERS ==========
    RAISE NOTICE '📢 Phase 16: Creating 300 promotional banners...';
    INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, image_url, link_url, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id,
        CASE WHEN bn % 2 = 0 THEN photo1 ELSE photo2 END, '/menu?promotion=' || bn, 'ACTIVE'
    FROM GENERATE_SERIES(1, 300) bn;
    RAISE NOTICE '✅ 300 banners created';

    -- ========== 280,000+ CUSTOMER ADDRESSES ==========
    RAISE NOTICE '📍 Phase 17: Creating 280,000+ customer addresses...';
    INSERT INTO customer_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer_user_id,
        'Village ' || a, 'Commune ' || a, 'District ' || a, 'Phnom Penh', 'Cambodia', 'Street ' || a, 'House ' || a,
        'Apt ' || a, 11.5564 + (a::NUMERIC / 1000), 104.9282 + (a::NUMERIC / 1000), a = 1
    FROM GENERATE_SERIES(1, 300) a;

    INSERT INTO customer_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        (SELECT id FROM users WHERE user_type = 'CUSTOMER' AND id != customer_user_id ORDER BY RANDOM() LIMIT 1),
        'Village ' || a, 'Commune ' || a, 'District ' || a, 'Phnom Penh', 'Cambodia', 'Street ' || a, 'House ' || a,
        'Apt ' || a, 11.5564 + (a::NUMERIC / 1000), 104.9282 + (a::NUMERIC / 1000), a % 3 = 1
    FROM GENERATE_SERIES(1, 279700) a;
    RAISE NOTICE '✅ 280,000+ customer addresses created';

    -- ========== CARTS & CART ITEMS ==========
    RAISE NOTICE '🛒 Phase 18: Creating carts and items...';
    INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, business_id)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, u.id, key_business_id
    FROM (SELECT id FROM users WHERE user_type = 'CUSTOMER' ORDER BY RANDOM() LIMIT 120000) u;

    INSERT INTO cart_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, cart_id, product_id, product_size_id, quantity)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        (SELECT id FROM carts WHERE user_id = customer_user_id LIMIT 1),
        (SELECT id FROM products ORDER BY RANDOM() LIMIT 1), NULL, (1 + (ci % 20))
    FROM GENERATE_SERIES(1, 2000) ci;

    INSERT INTO cart_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, cart_id, product_id, product_size_id, quantity)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        (SELECT id FROM carts WHERE user_id != customer_user_id ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM products ORDER BY RANDOM() LIMIT 1), NULL, (1 + (ci % 20))
    FROM GENERATE_SERIES(1, 118000) ci;

    INSERT INTO product_favorites (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, product_id)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        (SELECT id FROM users WHERE user_type = 'CUSTOMER' ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM products ORDER BY RANDOM() LIMIT 1)
    FROM GENERATE_SERIES(1, 100000) pf
    ON CONFLICT DO NOTHING;
    RAISE NOTICE '✅ Carts, items, and favorites created';

    -- ========== ORDER PROCESS STATUSES ==========
    INSERT INTO order_process_statuses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id,
        CASE s WHEN 1 THEN 'Pending' WHEN 2 THEN 'Confirmed' WHEN 3 THEN 'Preparing' WHEN 4 THEN 'Ready' WHEN 5 THEN 'In Delivery' WHEN 6 THEN 'Delivered' WHEN 7 THEN 'Completed' WHEN 8 THEN 'Cancelled' WHEN 9 THEN 'Refunded' WHEN 10 THEN 'Failed' END,
        'Order status: ' || CASE s WHEN 1 THEN 'Pending' WHEN 2 THEN 'Confirmed' WHEN 3 THEN 'Preparing' WHEN 4 THEN 'Ready' WHEN 5 THEN 'In Delivery' WHEN 6 THEN 'Delivered' WHEN 7 THEN 'Completed' WHEN 8 THEN 'Cancelled' WHEN 9 THEN 'Refunded' WHEN 10 THEN 'Failed' END,
        'ACTIVE'
    FROM GENERATE_SERIES(1, 10) s;

    INSERT INTO reference_counters (entity_type, counter_date, counter_value)
    VALUES ('ORDER', CURRENT_DATE, 0) ON CONFLICT (entity_type, counter_date) DO NOTHING;

    -- ========== ORDERS & ORDER ITEMS ==========
    RAISE NOTICE '📦 Phase 19: Creating 200,000 orders with 600,000 items...';
    -- 10,000 orders for key customer
    INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_process_status_name, delivery_address_snapshot, delivery_option_snapshot, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, confirmed_at, completed_at)
    SELECT gen_random_uuid(), 0, t - (RANDOM() * INTERVAL '180 days'), t, 'system', 'system', false, NULL, NULL,
        key_business_id, customer_user_id, 'ORD-KCU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(ord_n::TEXT, 6, '0'),
        CASE WHEN ord_n % 10 = 0 THEN 'Pending' WHEN ord_n % 10 = 1 THEN 'Confirmed' WHEN ord_n % 10 = 2 THEN 'Preparing' WHEN ord_n % 10 = 3 THEN 'Ready' WHEN ord_n % 10 = 4 THEN 'In Delivery' WHEN ord_n % 10 = 5 THEN 'Delivered' WHEN ord_n % 10 = 6 THEN 'Completed' WHEN ord_n % 10 = 7 THEN 'Cancelled' WHEN ord_n % 10 = 8 THEN 'Refunded' ELSE 'Failed' END,
        '{"village":"Village","commune":"Commune","district":"District","province":"Phnom Penh","street":"Street","house":"House"}',
        '{"name":"Standard","price":2.00}',
        (20.00 + (ord_n % 200))::NUMERIC, (ord_n % 10)::NUMERIC, (2.00 + (ord_n % 15))::NUMERIC, (ord_n % 5)::NUMERIC,
        ((20.00 + (ord_n % 200)) - (ord_n % 10) + (2.00 + (ord_n % 15)) + (ord_n % 5))::NUMERIC,
        CASE (ord_n % 4) WHEN 0 THEN 'CASH' WHEN 1 THEN 'BANK_TRANSFER' WHEN 2 THEN 'ONLINE' ELSE 'OTHER' END,
        CASE (ord_n % 3) WHEN 0 THEN 'UNPAID' WHEN 1 THEN 'PAID' ELSE 'REFUNDED' END,
        'Customer note ' || ord_n, 'Business note ' || ord_n,
        CASE WHEN ord_n % 2 = 0 THEN t - (RANDOM() * INTERVAL '150 days') ELSE NULL END,
        CASE WHEN ord_n % 3 = 2 THEN t - (RANDOM() * INTERVAL '100 days') ELSE NULL END
    FROM GENERATE_SERIES(1, 10000) ord_n;

    -- 190,000 orders for other customers
    INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_process_status_name, delivery_address_snapshot, delivery_option_snapshot, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, confirmed_at, completed_at)
    SELECT gen_random_uuid(), 0, t - (RANDOM() * INTERVAL '180 days'), t, 'system', 'system', false, NULL, NULL,
        key_business_id,
        (SELECT id FROM users WHERE user_type = 'CUSTOMER' AND id != customer_user_id ORDER BY RANDOM() LIMIT 1),
        'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((10000 + ord_n)::TEXT, 6, '0'),
        CASE WHEN ord_n % 10 = 0 THEN 'Pending' WHEN ord_n % 10 = 1 THEN 'Confirmed' WHEN ord_n % 10 = 2 THEN 'Preparing' WHEN ord_n % 10 = 3 THEN 'Ready' WHEN ord_n % 10 = 4 THEN 'In Delivery' WHEN ord_n % 10 = 5 THEN 'Delivered' WHEN ord_n % 10 = 6 THEN 'Completed' WHEN ord_n % 10 = 7 THEN 'Cancelled' WHEN ord_n % 10 = 8 THEN 'Refunded' ELSE 'Failed' END,
        '{"village":"Village","commune":"Commune","district":"District","province":"Phnom Penh","street":"Street","house":"House"}',
        '{"name":"Standard","price":2.00}',
        (20.00 + (ord_n % 200))::NUMERIC, (ord_n % 10)::NUMERIC, (2.00 + (ord_n % 15))::NUMERIC, (ord_n % 5)::NUMERIC,
        ((20.00 + (ord_n % 200)) - (ord_n % 10) + (2.00 + (ord_n % 15)) + (ord_n % 5))::NUMERIC,
        CASE (ord_n % 4) WHEN 0 THEN 'CASH' WHEN 1 THEN 'BANK_TRANSFER' WHEN 2 THEN 'ONLINE' ELSE 'OTHER' END,
        CASE (ord_n % 3) WHEN 0 THEN 'UNPAID' WHEN 1 THEN 'PAID' ELSE 'REFUNDED' END,
        'Customer note ' || ord_n, 'Business note ' || ord_n,
        CASE WHEN ord_n % 2 = 0 THEN t - (RANDOM() * INTERVAL '150 days') ELSE NULL END,
        CASE WHEN ord_n % 3 = 2 THEN t - (RANDOM() * INTERVAL '100 days') ELSE NULL END
    FROM GENERATE_SERIES(1, 190000) ord_n;

    SELECT COUNT(*) INTO v_order_count FROM orders;
    RAISE NOTICE '✅ % orders created!', v_order_count;

    -- 600,000 order items
    INSERT INTO order_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, quantity, total_price, has_promotion)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM products ORDER BY RANDOM() LIMIT 1), NULL, 'Premium Item',
        CASE WHEN oi_n % 2 = 0 THEN photo1 ELSE photo2 END,
        CASE WHEN oi_n % 2 = 0 THEN 'Medium' ELSE 'Large' END,
        (10.00 + (oi_n % 100))::NUMERIC(10,2), (10.00 + (oi_n % 100))::NUMERIC(10,2),
        (10.00 + (oi_n % 100))::NUMERIC(10,2), (1 + (oi_n % 10))::INTEGER,
        ((10.00 + (oi_n % 100)) * (1 + (oi_n % 10)))::NUMERIC(10,2), false
    FROM GENERATE_SERIES(1, 600000) oi_n;
    RAISE NOTICE '✅ 600,000 order items created!';

    -- Order status history
    INSERT INTO order_status_history (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, order_process_status_id, note, changed_by_user_id)
    SELECT gen_random_uuid(), 0, t - (RANDOM() * INTERVAL '180 days'), t, 'system', 'system', false, NULL, NULL,
        osh_ord.id, osh_stat.id, 'Order status created', NULL
    FROM (SELECT id FROM orders ORDER BY RANDOM()) osh_ord,
    (SELECT id FROM order_process_statuses ORDER BY RANDOM() LIMIT 1) osh_stat;

    -- Order payments
    INSERT INTO order_payments (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, order_id, payment_reference, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, status, customer_payment_method)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        key_business_id,
        (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1),
        'PAY-' || LPAD(opay_n::TEXT, 10, '0'),
        (20.00 + (opay_n % 200))::NUMERIC, (opay_n % 10)::NUMERIC, (2.00 + (opay_n % 15))::NUMERIC, (opay_n % 5)::NUMERIC,
        ((20.00 + (opay_n % 200)) - (opay_n % 10) + (2.00 + (opay_n % 15)) + (opay_n % 5))::NUMERIC,
        CASE (opay_n % 4) WHEN 0 THEN 'CASH' WHEN 1 THEN 'BANK_TRANSFER' WHEN 2 THEN 'ONLINE' ELSE 'OTHER' END,
        CASE (opay_n % 4) WHEN 0 THEN 'PENDING' WHEN 1 THEN 'COMPLETED' WHEN 2 THEN 'FAILED' ELSE 'CANCELLED' END, 'Cash'
    FROM GENERATE_SERIES(1, 200000) opay_n;
    RAISE NOTICE '✅ 200,000 payment records created!';

    -- ========== WORK SCHEDULES ==========
    RAISE NOTICE '📅 Phase 20: Creating 500 work schedules...';
    INSERT INTO work_schedules (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, user_id, name, schedule_type_enum, start_time, end_time, break_start_time, break_end_time)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, business_user_id,
        'Schedule ' || ws || ' (' || CASE WHEN ws % 3 = 0 THEN 'Morning' WHEN ws % 3 = 1 THEN 'Afternoon' ELSE 'Evening' END || ')',
        CASE WHEN ws % 2 = 0 THEN 'MORNING_SHIFT' ELSE 'EVENING_SHIFT' END,
        CASE WHEN ws % 3 = 0 THEN '06:00'::TIME WHEN ws % 3 = 1 THEN '10:00'::TIME ELSE '14:00'::TIME END,
        CASE WHEN ws % 3 = 0 THEN '14:00'::TIME WHEN ws % 3 = 1 THEN '18:00'::TIME ELSE '22:00'::TIME END,
        '12:00'::TIME, '13:00'::TIME
    FROM GENERATE_SERIES(1, 500) ws;
    RAISE NOTICE '✅ 500 work schedules created';

    -- ========== 20,000 ATTENDANCES ==========
    RAISE NOTICE '✅ Phase 21: Creating 20,000 attendance records...';
    INSERT INTO attendances (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_number, user_id, business_id, work_schedule_id, attendance_date, status, remarks)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 'ATT-' || gen_random_uuid()::TEXT,
        business_user_id, key_business_id, (SELECT id FROM work_schedules WHERE user_id = business_user_id LIMIT 1),
        (t - (INTERVAL '1 day' * (att % 365)))::DATE,
        CASE WHEN att % 15 = 0 THEN 'ABSENT' WHEN att % 15 = 1 THEN 'LATE' ELSE 'PRESENT' END, 'Attendance record ' || att
    FROM GENERATE_SERIES(1, 20000) att;
    RAISE NOTICE '✅ 20,000 attendance records created';

    -- ========== 40,000 CHECK-INS ==========
    RAISE NOTICE '🕐 Phase 22: Creating 40,000 check-in records...';
    INSERT INTO attendance_check_ins (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_number, attendance_id, check_in_type, check_in_time, latitude, longitude, remarks)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 'CHK-' || gen_random_uuid()::TEXT,
        (SELECT id FROM attendances WHERE user_id = business_user_id ORDER BY RANDOM() LIMIT 1),
        CASE WHEN aci % 2 = 0 THEN 'START' ELSE 'END' END,
        (t - (INTERVAL '1 day' * (aci % 365)))::TIMESTAMP + ('06:' || LPAD((aci % 60)::TEXT, 2, '0') || ':00')::TIME,
        11.5564 + (aci::NUMERIC / 1000), 104.9282 + (aci::NUMERIC / 1000), 'Check-in ' || aci
    FROM GENERATE_SERIES(1, 40000) aci;
    RAISE NOTICE '✅ 40,000 check-in records created';

    -- ========== 5,000 LEAVE RECORDS ==========
    RAISE NOTICE '📄 Phase 23: Creating 5,000 leave records...';
    INSERT INTO leaves (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_number, user_id, business_id, leave_type_enum, start_date, end_date, total_days, reason, status, action_by, action_at, action_note)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 'LEV-' || gen_random_uuid()::TEXT,
        business_user_id, key_business_id, 'SICK_LEAVE',
        (t + (INTERVAL '1 day' * (lv % 365)))::DATE, (t + (INTERVAL '1 day' * ((lv % 365) + 3)))::DATE,
        (3 + (lv % 7))::DOUBLE PRECISION, 'Leave reason ' || lv,
        CASE WHEN lv % 4 = 0 THEN 'PENDING' WHEN lv % 4 = 1 THEN 'APPROVED' WHEN lv % 4 = 2 THEN 'REJECTED' ELSE 'CANCELLED' END,
        CASE WHEN lv % 2 = 0 THEN business_user_id ELSE NULL END,
        CASE WHEN lv % 2 = 0 THEN t ELSE NULL END,
        CASE WHEN lv % 2 = 0 THEN 'Approved by manager' ELSE NULL END
    FROM GENERATE_SERIES(1, 5000) lv;
    RAISE NOTICE '✅ 5,000 leave records created';

    -- ========== EXCHANGE RATES ==========
    INSERT INTO exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, usd_to_khr_rate, is_active, notes)
    VALUES (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 4100.0, true, 'Standard USD to KHR rate');

    INSERT INTO business_exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, usd_to_khr_rate, usd_to_thb_rate, usd_to_cny_rate, usd_to_vnd_rate, is_active, notes)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id,
        4105.0 + (ber % 15)::NUMERIC, 35.45 + (ber % 2)::NUMERIC, 7.25 + (ber % 1)::NUMERIC, 24500.0 + (ber % 200)::NUMERIC,
        true, 'Business exchange rates ' || ber
    FROM GENERATE_SERIES(1, 5) ber;

    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '✅ GENERATION COMPLETE!';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '📊 FINAL STATISTICS:';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '👥 Users: 220,003 total';
    RAISE NOTICE '   • Platform Admins: 40,001';
    RAISE NOTICE '   • Business Users: 60,001';
    RAISE NOTICE '   • Customers: 120,001';
    RAISE NOTICE '';
    RAISE NOTICE '📦 Products & Catalog: ' || v_product_count || ' items';
    RAISE NOTICE '   • Product Images: ' || v_image_count || ' images';
    RAISE NOTICE '   • Categories: 240';
    RAISE NOTICE '   • Brands: 240';
    RAISE NOTICE '   • Product Sizes: Thousands of variants';
    RAISE NOTICE '';
    RAISE NOTICE '🛒 Shopping Data:';
    RAISE NOTICE '   • Orders: ' || v_order_count || ' total';
    RAISE NOTICE '   • Order Items: 600,000';
    RAISE NOTICE '   • Carts: 120,000';
    RAISE NOTICE '   • Cart Items: 120,000';
    RAISE NOTICE '   • Favorites: 100,000';
    RAISE NOTICE '   • Customer Addresses: 280,000+';
    RAISE NOTICE '';
    RAISE NOTICE '🏪 Business Operations:';
    RAISE NOTICE '   • Delivery Options: 150';
    RAISE NOTICE '   • Banners: 300';
    RAISE NOTICE '   • Payment Records: 200,000';
    RAISE NOTICE '';
    RAISE NOTICE '👔 HR Management:';
    RAISE NOTICE '   • Work Schedules: 500';
    RAISE NOTICE '   • Attendance Records: 20,000';
    RAISE NOTICE '   • Check-in Records: 40,000';
    RAISE NOTICE '   • Leave Records: 5,000';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 TEST ACCOUNT CREDENTIALS:';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '1️⃣  Platform Admin:      phatmenghor19@gmail.com';
    RAISE NOTICE '2️⃣  Business Manager:    phatmenghor20@gmail.com (180K products!)';
    RAISE NOTICE '3️⃣  Customer:            phatmenghor21@gmail.com (300 addresses)';
    RAISE NOTICE '🔐 Password: (Same bcrypt hash - use in your auth tests)';
    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '⏱️  Execution Time: ' || EXTRACT(EPOCH FROM (NOW() - v_start_time))::INT || ' seconds';
    RAISE NOTICE '';
    RAISE NOTICE '✨ VERIFIED ENUMS USED:';
    RAISE NOTICE '   Promotion Types: PERCENTAGE, FIXED_AMOUNT (50% each)';
    RAISE NOTICE '   Payment Methods: CASH, BANK_TRANSFER, ONLINE, OTHER (25% each)';
    RAISE NOTICE '   Payment Status: UNPAID, PAID, REFUNDED (33% each)';
    RAISE NOTICE '   Order Status: Pending, Confirmed, Preparing, Ready, In Delivery, Delivered, Completed, Cancelled, Refunded, Failed (10% each)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for testing! All systems operational.';
    RAISE NOTICE '';

END $$;

SELECT '✅ DONE - ULTIMATE TEST DATA POPULATED!' as status;
