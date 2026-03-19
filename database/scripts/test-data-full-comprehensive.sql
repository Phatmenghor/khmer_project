-- ============================================================================
-- COMPREHENSIVE TEST DATA FOR ALL SCENARIOS
-- ============================================================================
-- Full test coverage: products, orders, users, promotions, cart operations
-- Designed for integration testing, performance testing, and development
-- Run AFTER schema is created but BEFORE indexes (faster inserts)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
SET synchronous_commit TO OFF;
SET maintenance_work_mem TO '1GB';
SET work_mem TO '256MB';

DO $$ DECLARE
    t TIMESTAMPTZ := NOW();
    photo1 TEXT := 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop';
    photo2 TEXT := 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop';

    -- Role IDs
    role_admin UUID := gen_random_uuid();
    role_business UUID := gen_random_uuid();
    role_customer UUID := gen_random_uuid();

    -- Plan IDs
    plan1 UUID := gen_random_uuid();
    plan2 UUID := gen_random_uuid();
    plan3 UUID := gen_random_uuid();

    -- User IDs
    admin_user UUID := gen_random_uuid();
    business_owner UUID := gen_random_uuid();
    business_manager UUID := gen_random_uuid();
    customer1 UUID := gen_random_uuid();
    customer2 UUID := gen_random_uuid();

    -- Business IDs
    main_business UUID := gen_random_uuid();
    alt_business UUID := gen_random_uuid();

BEGIN
    RAISE NOTICE '🧪 COMPREHENSIVE TEST DATA GENERATION STARTED';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

    -- ========================================================================
    -- CLEANUP
    -- ========================================================================
    RAISE NOTICE 'Phase 1/6: Cleaning up existing data...';

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

    RAISE NOTICE '✅ Database cleaned';

    -- ========================================================================
    -- PHASE 2: ROLES & PLANS
    -- ========================================================================
    RAISE NOTICE 'Phase 2/6: Creating roles and subscription plans...';

    INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type)
    VALUES
        (role_admin, 0, t, t, 'system', 'system', false, NULL, NULL, 'PLATFORM_ADMIN', 'Platform Administrator', NULL, 'PLATFORM_USER'),
        (role_business, 0, t, t, 'system', 'system', false, NULL, NULL, 'BUSINESS_OWNER', 'Business Owner', NULL, 'BUSINESS_USER'),
        (role_customer, 0, t, t, 'system', 'system', false, NULL, NULL, 'CUSTOMER', 'Customer', NULL, 'CUSTOMER');

    INSERT INTO subscription_plans (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, price, duration_days, status)
    VALUES
        (plan1, 0, t, t, 'system', 'system', false, NULL, NULL, 'Basic', 'Basic features', 99.99, 30, 'PUBLIC'),
        (plan2, 0, t, t, 'system', 'system', false, NULL, NULL, 'Pro', 'Advanced features', 299.99, 365, 'PUBLIC'),
        (plan3, 0, t, t, 'system', 'system', false, NULL, NULL, 'Enterprise', 'Enterprise features', 999.99, 365, 'PUBLIC');

    RAISE NOTICE '✅ Roles and plans created';

    -- ========================================================================
    -- PHASE 3: USERS & BUSINESSES
    -- ========================================================================
    RAISE NOTICE 'Phase 3/6: Creating users and businesses...';

    -- Platform Admin
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES (admin_user, 0, t, t, 'system', 'system', false, NULL, NULL, 'admin@test.com', 'admin@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'System', 'Admin', '+855 10 100 0001', photo1, 'PLATFORM_USER', 'ACTIVE', NULL, 'Administrator', 'Phnom Penh', 'Main admin account', t - INTERVAL '1 day', t, 5);

    INSERT INTO user_roles (user_id, role_id) VALUES (admin_user, role_admin);

    -- Business Owner
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES (business_owner, 0, t, t, 'system', 'system', false, NULL, NULL, 'owner@test.com', 'owner@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'John', 'Doe', '+855 10 200 0001', photo1, 'BUSINESS_USER', 'ACTIVE', main_business, 'Owner', 'Phnom Penh', 'Business owner', t - INTERVAL '2 days', t, 3);

    -- Business Manager
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES (business_manager, 0, t, t, 'system', 'system', false, NULL, NULL, 'manager@test.com', 'manager@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Jane', 'Smith', '+855 10 200 0002', photo2, 'BUSINESS_USER', 'ACTIVE', main_business, 'Manager', 'Phnom Penh', 'Business manager', t - INTERVAL '3 days', t - INTERVAL '1 hour', 2);

    INSERT INTO user_roles (user_id, role_id) VALUES (business_owner, role_business), (business_manager, role_business);

    -- Customers
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES
        (customer1, 0, t, t, 'system', 'system', false, NULL, NULL, 'customer1@test.com', 'customer1@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Alice', 'Johnson', '+855 10 300 0001', photo1, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh', 'Regular customer', t - INTERVAL '10 days', t - INTERVAL '2 hours', 8),
        (customer2, 0, t, t, 'system', 'system', false, NULL, NULL, 'customer2@test.com', 'customer2@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Bob', 'Williams', '+855 10 300 0002', photo2, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh', 'Premium customer', t - INTERVAL '20 days', t - INTERVAL '30 minutes', 15);

    INSERT INTO user_roles (user_id, role_id) VALUES (customer1, role_customer), (customer2, role_customer);

    -- Main Business
    INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, owner_id, name, email, phone, address, description, status, is_subscription_active)
    VALUES (main_business, 0, t, t, 'system', 'system', false, NULL, NULL, business_owner, 'Premium Restaurant', 'info@restaurant.com', '+855 23 999999', '123 Main Street, Phnom Penh', 'High-end restaurant with full menu', 'ACTIVE', true);

    -- Alternative Business
    INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, owner_id, name, email, phone, address, description, status, is_subscription_active)
    VALUES (alt_business, 0, t, t, 'system', 'system', false, NULL, NULL, admin_user, 'Cafe Shop', 'cafe@test.com', '+855 23 888888', '456 Secondary Street, Phnom Penh', 'Casual cafe', 'ACTIVE', false);

    -- Business Settings
    INSERT INTO business_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, logo_url, banner_url, business_type, opening_time, closing_time, is_open_24_hours, working_days, timezone, currency, language, usd_to_khr_rate, contact_email, contact_phone, whatsapp_number, facebook_url, instagram_url, website_url, primary_color, secondary_color, email_notifications_enabled, sms_notifications_enabled, order_notifications_enabled, tax_rate, service_charge_percentage, min_order_amount, delivery_radius_km, estimated_delivery_time, terms_and_conditions, privacy_policy, refund_policy)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, photo1, photo2, 'RESTAURANT', '06:00', '23:00', false, 'MONDAY-SUNDAY', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, 'info@restaurant.com', '+855 23 999999', '+855 10 100 0001', photo1, photo2, photo1, '#FF6B6B', '#FFE66D', true, true, true, 10.0, 15.0, 10.0, 25.0, '30-45 minutes', 'Fresh guarantee', 'Data protection', 'Full refund'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, alt_business, photo1, photo2, 'CAFE', '07:00', '20:00', false, 'MONDAY-SUNDAY', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, 'cafe@test.com', '+855 23 888888', '+855 10 100 0001', photo1, photo2, photo1, '#4ECDC4', '#95E1D3', true, false, true, 5.0, 0.0, 5.0, 15.0, '15-20 minutes', 'Quality assured', 'Data protection', 'Full refund');

    -- Subscriptions
    INSERT INTO subscriptions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, plan_id, start_date, end_date, auto_renew)
    VALUES
        (gen_random_uuid(), 0, t - INTERVAL '6 months', t, 'system', 'system', false, NULL, NULL, main_business, plan2, t - INTERVAL '6 months', t + INTERVAL '6 months', true),
        (gen_random_uuid(), 0, t - INTERVAL '1 month', t, 'system', 'system', false, NULL, NULL, alt_business, plan1, t - INTERVAL '1 month', t + INTERVAL '29 days', false);

    RAISE NOTICE '✅ Users and businesses created';

    -- ========================================================================
    -- PHASE 4: PRODUCTS & VARIANTS
    -- ========================================================================
    RAISE NOTICE 'Phase 4/6: Creating products and variants (2000 products)...';

    -- Categories
    INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url, status)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Appetizers', photo1, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Main Courses', photo2, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Desserts', photo1, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Beverages', photo2, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, alt_business, 'Coffee', photo1, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, alt_business, 'Pastries', photo2, 'ACTIVE');

    -- Brands
    INSERT INTO brands (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url, description, status)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Premium Selection', photo1, 'High-end ingredients', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'House Special', photo2, 'Chef''s special recipes', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, alt_business, 'Artisan Coffee', photo1, 'Specialty coffee beans', 'ACTIVE');

    -- 2000 Products with various promotion scenarios
    INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, category_id, brand_id, name, description, status, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, display_price, display_origin_price, display_promotion_type, display_promotion_value, display_promotion_from_date, display_promotion_to_date, has_sizes, has_active_promotion, view_count, favorite_count, main_image_url)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        main_business,
        (SELECT id FROM categories WHERE business_id = main_business ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM brands WHERE business_id = main_business ORDER BY RANDOM() LIMIT 1),
        'Product ' || p || ' (' || CASE (p % 10) WHEN 0 THEN 'BESTSELLER' WHEN 1 THEN 'NEW' WHEN 2 THEN 'LIMITED' ELSE 'FEATURED' END || ')',
        'Delicious product with great taste - Item ' || p,
        'ACTIVE',
        (25.00 + (p % 100))::NUMERIC,
        CASE WHEN p % 3 = 0 THEN 'PERCENTAGE' WHEN p % 3 = 1 THEN 'FIXED_AMOUNT' ELSE NULL END,
        CASE WHEN p % 3 = 0 THEN (10 + (p % 30)) WHEN p % 3 = 1 THEN (5.00 + (p % 20)) ELSE NULL END,
        CASE WHEN p % 3 > 0 THEN t - INTERVAL '5 days' ELSE NULL END,
        CASE WHEN p % 3 > 0 THEN t + INTERVAL '30 days' ELSE NULL END,
        (25.00 + (p % 100))::NUMERIC,
        (25.00 + (p % 100))::NUMERIC,
        CASE WHEN p % 3 = 0 THEN 'PERCENTAGE' WHEN p % 3 = 1 THEN 'FIXED_AMOUNT' ELSE NULL END,
        CASE WHEN p % 3 = 0 THEN (10 + (p % 30)) WHEN p % 3 = 1 THEN (5.00 + (p % 20)) ELSE NULL END,
        CASE WHEN p % 3 > 0 THEN t - INTERVAL '5 days' ELSE NULL END,
        CASE WHEN p % 3 > 0 THEN t + INTERVAL '30 days' ELSE NULL END,
        CASE WHEN p % 5 = 0 THEN true ELSE false END,
        CASE WHEN p % 3 = 0 THEN true ELSE false END,
        (p % 500),
        (p % 100),
        CASE WHEN p % 2 = 0 THEN photo1 ELSE photo2 END
    FROM GENERATE_SERIES(1, 2000) p;

    -- Product images (4 per product)
    INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        p.id,
        CASE WHEN (ROW_NUMBER() OVER (PARTITION BY p.id) - 1) % 2 = 0 THEN photo1 ELSE photo2 END
    FROM products p, GENERATE_SERIES(1, 4) img_num
    WHERE p.business_id = main_business;

    -- Product sizes (for 400 products)
    INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, name, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        p.id,
        CASE s WHEN 1 THEN 'Small' WHEN 2 THEN 'Medium' WHEN 3 THEN 'Large' WHEN 4 THEN 'Extra Large' WHEN 5 THEN 'Family' END,
        (p.price + (s * 3.0))::NUMERIC,
        p.promotion_type,
        p.promotion_value,
        p.promotion_from_date,
        p.promotion_to_date
    FROM (SELECT id, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date FROM products WHERE has_sizes = true AND business_id = main_business) p,
    GENERATE_SERIES(1, 5) s;

    RAISE NOTICE '✅ 2000 products created with images and sizes';

    -- ========================================================================
    -- PHASE 5: CARTS & ORDERS
    -- ========================================================================
    RAISE NOTICE 'Phase 5/6: Creating carts, orders, and order items...';

    -- Carts for customers
    INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, business_id)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer1, main_business),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer2, main_business),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer1, alt_business);

    -- Cart items
    INSERT INTO cart_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, cart_id, product_id, product_size_id, quantity)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        (SELECT id FROM carts WHERE user_id = customer1 AND business_id = main_business LIMIT 1),
        (SELECT id FROM products WHERE business_id = main_business ORDER BY RANDOM() LIMIT 1),
        NULL,
        (1 + (ci % 5))
    FROM GENERATE_SERIES(1, 50) ci;

    INSERT INTO cart_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, cart_id, product_id, product_size_id, quantity)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        (SELECT id FROM carts WHERE user_id = customer2 AND business_id = main_business LIMIT 1),
        (SELECT id FROM products WHERE business_id = main_business ORDER BY RANDOM() LIMIT 1),
        NULL,
        (1 + (ci % 3))
    FROM GENERATE_SERIES(1, 30) ci;

    -- Delivery options
    INSERT INTO delivery_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, image_url, price, status)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Standard Delivery', 'Delivery in 30-45 minutes', photo1, 2.00, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Express Delivery', 'Fast delivery in 15-20 minutes', photo2, 5.00, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Pickup', 'Pick up your order', photo1, 0.00, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, alt_business, 'Delivery', 'Standard delivery', photo2, 1.50, 'ACTIVE');

    -- Banners
    INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, image_url, link_url, status)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, photo1, '/promo/summer', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, photo2, '/promo/weekend', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, alt_business, photo1, '/promo/coffee', 'ACTIVE');

    -- Customer addresses
    INSERT INTO customer_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer1, 'Toul Kouk', 'Phsar Depot', 'Tuol Kouk', 'Phnom Penh', 'Cambodia', '123', 'A1', 'Apt 5F', 11.5564, 104.9282, true),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer1, 'Boeung Keng Kong', 'Boeng Keng Kang', 'Chamkarmon', 'Phnom Penh', 'Cambodia', '456', 'B2', 'Office building', 11.5500, 104.9300, false),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer2, 'Psar Depo', 'Phsar Depot', 'Tuol Kouk', 'Phnom Penh', 'Cambodia', '789', 'C3', 'Near market', 11.5550, 104.9350, true);

    -- Order process statuses
    INSERT INTO order_process_statuses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, status)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Pending', 'Awaiting confirmation', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Confirmed', 'Order confirmed', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Preparing', 'Being prepared', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Ready', 'Ready for delivery', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'In Delivery', 'On the way', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Delivered', 'Successfully delivered', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Completed', 'Order completed', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 'Cancelled', 'Order cancelled', 'ACTIVE');

    INSERT INTO reference_counters (entity_type, counter_date, counter_value) VALUES ('ORDER', CURRENT_DATE, 0) ON CONFLICT (entity_type, counter_date) DO NOTHING;

    -- Orders (500 total)
    INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_process_status_name, delivery_address_snapshot, delivery_option_snapshot, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, confirmed_at, completed_at)
    SELECT
        gen_random_uuid(), 0,
        t - (RANDOM() * INTERVAL '180 days'),
        t,
        'system', 'system', false, NULL, NULL,
        main_business,
        CASE WHEN ord % 2 = 0 THEN customer1 ELSE customer2 END,
        'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(ord::TEXT, 6, '0'),
        CASE WHEN ord % 8 = 0 THEN 'Pending' WHEN ord % 8 = 1 THEN 'Confirmed' WHEN ord % 8 = 2 THEN 'Preparing' WHEN ord % 8 = 3 THEN 'Ready' WHEN ord % 8 = 4 THEN 'In Delivery' WHEN ord % 8 = 5 THEN 'Delivered' WHEN ord % 8 = 6 THEN 'Completed' ELSE 'Cancelled' END,
        '{"village":"Toul Kouk","commune":"Phsar Depot","district":"Tuol Kouk"}',
        '{"name":"Standard Delivery","price":2.00}',
        (40.00 + (ord % 150))::NUMERIC,
        (ord % 20)::NUMERIC,
        2.00,
        (4.00 + (ord % 10))::NUMERIC,
        ((40.00 + (ord % 150)) - (ord % 20) + 2.00 + (4.00 + (ord % 10)))::NUMERIC,
        CASE (ord % 4) WHEN 0 THEN 'CASH' WHEN 1 THEN 'BANK_TRANSFER' WHEN 2 THEN 'ONLINE' ELSE 'CREDIT_CARD' END,
        CASE (ord % 3) WHEN 0 THEN 'UNPAID' WHEN 1 THEN 'PAID' ELSE 'REFUNDED' END,
        'Please deliver after ' || (2 + (ord % 8)) || ' PM',
        'Order for ' || CASE (ord % 3) WHEN 0 THEN 'event' WHEN 1 THEN 'party' ELSE 'business meeting' END,
        CASE WHEN ord % 2 = 0 THEN t - (RANDOM() * INTERVAL '150 days') ELSE NULL END,
        CASE WHEN ord % 3 = 2 THEN t - (RANDOM() * INTERVAL '100 days') ELSE NULL END
    FROM GENERATE_SERIES(1, 250) ord;

    -- Order items (1500 total - avg 3 per order)
    INSERT INTO order_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, quantity, total_price, has_promotion)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        (SELECT id FROM orders WHERE business_id = main_business ORDER BY RANDOM() LIMIT 1),
        (SELECT id FROM products WHERE business_id = main_business ORDER BY RANDOM() LIMIT 1),
        NULL,
        'Product Item',
        photo1,
        'Medium',
        (25.00 + (oi % 50))::NUMERIC,
        (25.00 + (oi % 50) - ((oi % 50) * 0.1))::NUMERIC,
        (25.00 + (oi % 50))::NUMERIC,
        (1 + (oi % 3)),
        ((25.00 + (oi % 50) - ((oi % 50) * 0.1)) * (1 + (oi % 3)))::NUMERIC,
        (oi % 2) = 0
    FROM GENERATE_SERIES(1, 1500) oi;

    -- Order payments
    INSERT INTO order_payments (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, order_id, payment_reference, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, status, customer_payment_method)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        main_business,
        (SELECT id FROM orders WHERE business_id = main_business ORDER BY RANDOM() LIMIT 1),
        'PAY-' || LPAD(op::TEXT, 10, '0'),
        (50.00 + (op % 100))::NUMERIC,
        (op % 15)::NUMERIC,
        2.00,
        (5.00 + (op % 10))::NUMERIC,
        ((50.00 + (op % 100)) - (op % 15) + 2.00 + (5.00 + (op % 10)))::NUMERIC,
        CASE (op % 4) WHEN 0 THEN 'CASH' WHEN 1 THEN 'BANK_TRANSFER' WHEN 2 THEN 'ONLINE' ELSE 'CREDIT_CARD' END,
        CASE (op % 4) WHEN 0 THEN 'PENDING' WHEN 1 THEN 'COMPLETED' WHEN 2 THEN 'FAILED' ELSE 'CANCELLED' END,
        'Cash'
    FROM GENERATE_SERIES(1, 250) op;

    -- Product favorites
    INSERT INTO product_favorites (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, product_id)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        CASE WHEN pf % 2 = 0 THEN customer1 ELSE customer2 END,
        (SELECT id FROM products WHERE business_id = main_business ORDER BY RANDOM() LIMIT 1)
    FROM GENERATE_SERIES(1, 100) pf
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 250 orders with 1500 items created';

    -- ========================================================================
    -- PHASE 6: WORK & ATTENDANCE
    -- ========================================================================
    RAISE NOTICE 'Phase 6/6: Creating work schedules and attendance records...';

    -- Work schedules
    INSERT INTO work_schedules (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, user_id, name, schedule_type_enum, start_time, end_time, break_start_time, break_end_time)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, business_manager, 'Morning Shift', 'MORNING_SHIFT', '06:00'::TIME, '14:00'::TIME, '10:00'::TIME, '11:00'::TIME),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, business_manager, 'Evening Shift', 'EVENING_SHIFT', '14:00'::TIME, '22:00'::TIME, '18:00'::TIME, '19:00'::TIME),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, business_owner, 'Flexible Schedule', 'FLEXIBLE_SHIFT', '09:00'::TIME, '18:00'::TIME, '12:00'::TIME, '13:00'::TIME);

    -- Attendances (365 days)
    INSERT INTO attendances (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_number, user_id, business_id, work_schedule_id, attendance_date, status, remarks)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        'ATT-' || gen_random_uuid()::TEXT,
        business_manager,
        main_business,
        (SELECT id FROM work_schedules WHERE user_id = business_manager ORDER BY RANDOM() LIMIT 1),
        (t - (INTERVAL '1 day' * (att % 365)))::DATE,
        CASE WHEN att % 30 = 0 THEN 'ABSENT' WHEN att % 30 = 1 THEN 'LATE' WHEN att % 30 = 2 THEN 'HALF_DAY' ELSE 'PRESENT' END,
        CASE WHEN att % 15 = 0 THEN 'Holiday' WHEN att % 15 = 1 THEN 'Sick leave' ELSE 'Regular' END
    FROM GENERATE_SERIES(1, 365) att;

    -- Check-ins (720 total)
    INSERT INTO attendance_check_ins (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_number, attendance_id, check_in_type, check_in_time, latitude, longitude, remarks)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL,
        'CHK-' || gen_random_uuid()::TEXT,
        (SELECT id FROM attendances WHERE user_id = business_manager ORDER BY RANDOM() LIMIT 1),
        CASE WHEN aci % 2 = 0 THEN 'START' ELSE 'END' END,
        (t - (INTERVAL '1 day' * (aci % 365)))::TIMESTAMP + (INTERVAL '1 hour' * (6 + (aci % 12))),
        11.5564 + (RANDOM() * 0.05),
        104.9282 + (RANDOM() * 0.05),
        'Check-in at ' || CASE WHEN aci % 2 = 0 THEN 'office entrance' ELSE 'office exit' END
    FROM GENERATE_SERIES(1, 720) aci;

    -- Exchange rates
    INSERT INTO exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, usd_to_khr_rate, is_active, notes)
    VALUES (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 4100.0, true, 'Current market rate');

    INSERT INTO business_exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, usd_to_khr_rate, usd_to_thb_rate, usd_to_cny_rate, usd_to_vnd_rate, is_active, notes)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, main_business, 4105.0, 35.45, 7.25, 24500.0, true, 'Business rates'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, alt_business, 4105.0, 35.45, 7.25, 24500.0, true, 'Business rates');

    RAISE NOTICE '✅ Attendance and scheduling data created';

    -- ========================================================================
    -- COMPLETION
    -- ========================================================================
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ COMPREHENSIVE TEST DATA LOADED SUCCESSFULLY!';
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUMMARY:';
    RAISE NOTICE '  • 2,000 products';
    RAISE NOTICE '  • 8,000 product images';
    RAISE NOTICE '  • 400 product size variants';
    RAISE NOTICE '  • 250 orders with 1,500 items';
    RAISE NOTICE '  • 100 customer favorites';
    RAISE NOTICE '  • 365 attendance records';
    RAISE NOTICE '  • 720 check-in records';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 TEST ACCOUNTS:';
    RAISE NOTICE '  Admin:   admin@test.com / password123';
    RAISE NOTICE '  Manager: manager@test.com / password123';
    RAISE NOTICE '  Owner:   owner@test.com / password123';
    RAISE NOTICE '  Customer1: customer1@test.com / password123';
    RAISE NOTICE '  Customer2: customer2@test.com / password123';
    RAISE NOTICE '';
    RAISE NOTICE '🏢 BUSINESSES:';
    RAISE NOTICE '  • Premium Restaurant (2000 products)';
    RAISE NOTICE '  • Cafe Shop';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ NEXT STEP: Run index creation script for performance';

END $$;

SET synchronous_commit TO ON;
SELECT 'Test data generation completed!' as status;
