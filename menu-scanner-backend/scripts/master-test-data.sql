-- ============================================================================
-- ULTIMATE PRODUCTION TEST DATA - 180,000 PRODUCTS + STOCK
-- Complete dataset with 3 main test users (phatmenghor19, 20, 21)
-- Tables already created by JPA/Hibernate - data only
-- ============================================================================

SET synchronous_commit TO OFF;

DO $$ DECLARE
    t TIMESTAMPTZ := NOW();
    photo1 TEXT := 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop';
    photo2 TEXT := 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop';
    role_admin UUID := gen_random_uuid();
    role_business UUID := gen_random_uuid();
    role_customer UUID := gen_random_uuid();
    plan1 UUID := gen_random_uuid();
    plan2 UUID := gen_random_uuid();
    plan3 UUID := gen_random_uuid();
    platform_user_id UUID := gen_random_uuid();
    business_user_id UUID := gen_random_uuid();
    customer_user_id UUID := gen_random_uuid();
    key_business_id UUID := gen_random_uuid();

BEGIN
    RAISE NOTICE '🚀 ULTIMATE TEST DATA GENERATION STARTED!';
    RAISE NOTICE '📊 Progress: 0% - Initializing...';

    -- =====================================================
    -- CLEANUP
    -- =====================================================
    RAISE NOTICE '📊 Progress: 3% - 🧹 Cleaning database...';

    TRUNCATE TABLE product_stock CASCADE;
    TRUNCATE TABLE order_status_history CASCADE;
    TRUNCATE TABLE order_items CASCADE;
    TRUNCATE TABLE order_payments CASCADE;
    TRUNCATE TABLE orders CASCADE;
    TRUNCATE TABLE cart_items CASCADE;
    TRUNCATE TABLE carts CASCADE;
    TRUNCATE TABLE product_favorites CASCADE;
    TRUNCATE TABLE product_images CASCADE;
    TRUNCATE TABLE product_sizes CASCADE;
    TRUNCATE TABLE products CASCADE;
    TRUNCATE TABLE banners CASCADE;
    TRUNCATE TABLE delivery_options CASCADE;
    TRUNCATE TABLE payment_options CASCADE;
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

    RAISE NOTICE 'Database cleaned!';

    -- =====================================================
    -- ROLES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 6% - Creating roles...';
    INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type)
    VALUES
        (role_admin, 0, t, t, 'system', 'system', false, NULL, NULL, 'PLATFORM_ADMIN', 'Platform Administrator', NULL, 'PLATFORM_USER'),
        (role_business, 0, t, t, 'system', 'system', false, NULL, NULL, 'BUSINESS_OWNER', 'Business Owner', NULL, 'BUSINESS_USER'),
        (role_customer, 0, t, t, 'system', 'system', false, NULL, NULL, 'CUSTOMER', 'Customer', NULL, 'CUSTOMER');

    -- =====================================================
    -- SUBSCRIPTION PLANS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 9% - Creating subscription plans...';
    INSERT INTO subscription_plans (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, price, duration_days, status)
    VALUES
        (plan1, 0, t, t, 'system', 'system', false, NULL, NULL, 'Basic Plan', 'Basic features', 99.99, 30, 'PUBLIC'),
        (plan2, 0, t, t, 'system', 'system', false, NULL, NULL, 'Pro Plan', 'Advanced features', 299.99, 365, 'PUBLIC'),
        (plan3, 0, t, t, 'system', 'system', false, NULL, NULL, 'Enterprise', 'Enterprise features', 999.99, 365, 'PUBLIC');

    -- =====================================================
    -- 3 MAIN TEST USERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 12% - Creating 3 main test users...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES
        (platform_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'phatmenghor19@gmail.com', 'phatmenghor19@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Platform', 'Admin', '+855 10 100 0001', photo1, 'PLATFORM_USER', 'ACTIVE', NULL, 'Platform Admin', 'Phnom Penh', 'Key Platform Admin', t - INTERVAL '1 day', t, 1);

    INSERT INTO user_roles (user_id, role_id) VALUES (platform_user_id, role_admin);

    -- =====================================================
    -- KEY BUSINESS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 15% - Creating key business...';
    INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, owner_id, name, email, phone, address, description, status, is_subscription_active)
    VALUES (key_business_id, 0, t, t, 'system', 'system', false, NULL, NULL, platform_user_id, 'Phatmenghor MEGA Business', 'mega@test.com', '+855 23 9999999', 'Phnom Penh, Cambodia', 'Ultimate business with 180K products!', 'ACTIVE', true);

    INSERT INTO business_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, logo_url, banner_url, business_type, opening_time, closing_time, is_open_24_hours, working_days, timezone, currency, language, usd_to_khr_rate, contact_email, contact_phone, whatsapp_number, facebook_url, instagram_url, website_url, primary_color, secondary_color, email_notifications_enabled, sms_notifications_enabled, order_notifications_enabled, tax_rate, service_charge_percentage, min_order_amount, delivery_radius_km, estimated_delivery_time, terms_and_conditions, privacy_policy, refund_policy)
    VALUES (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, photo1, photo2, 'MEGA_STORE', '06:00', '23:00', false, 'MONDAY-SUNDAY', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, 'mega@test.com', '+855 23 9999999', '+855 10 100 0001', photo1, photo2, photo1, '#FF6B6B', '#FFE66D', true, true, true, 0.0, 10.0, 5.0, 25.0, '30-45 minutes', 'Premium guarantee', 'Data protection', 'Full refund');

    INSERT INTO subscriptions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, plan_id, start_date, end_date, auto_renew)
    VALUES (gen_random_uuid(), 0, t - INTERVAL '6 months', t, 'system', 'system', false, NULL, NULL, key_business_id, plan2, t - INTERVAL '6 months', t + INTERVAL '12 months', true);

    -- =====================================================
    -- OTHER 2 MAIN USERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 18% - Creating other 2 main users...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES
        (business_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'phatmenghor20@gmail.com', 'phatmenghor20@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Business', 'Manager', '+855 10 200 0001', photo2, 'BUSINESS_USER', 'ACTIVE', key_business_id, 'Business Manager', 'Phnom Penh', 'Key Business Manager', t - INTERVAL '2 days', t, 1),
        (customer_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'phatmenghor21@gmail.com', 'phatmenghor21@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Customer', 'User', '+855 10 300 0001', photo1, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh', 'Key Customer', t - INTERVAL '5 days', t, 1);

    INSERT INTO user_roles (user_id, role_id) SELECT business_user_id, role_business UNION ALL SELECT customer_user_id, role_customer;

    -- =====================================================
    -- 40,000 PLATFORM ADMINS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 21% - Creating 40,000 platform admins...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 'admin' || n || '@platform.com', 'admin' || n || '@platform.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Admin' || n, 'User' || n, '+855 10 100 ' || LPAD((n % 10000)::TEXT, 4, '0'), CASE WHEN n % 2 = 0 THEN photo1 ELSE photo2 END, 'PLATFORM_USER', 'ACTIVE', NULL, 'Platform Admin', 'Phnom Penh', 'Admin ' || n, t - (RANDOM() * INTERVAL '90 days'), t - (RANDOM() * INTERVAL '7 days'), 1
    FROM GENERATE_SERIES(1, 40000) n;

    INSERT INTO user_roles (user_id, role_id) SELECT u.id, role_admin FROM users u WHERE u.user_type = 'PLATFORM_USER' AND u.id != platform_user_id;

    -- =====================================================
    -- 99 OTHER BUSINESSES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 24% - Creating 99 other businesses...';
    INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, owner_id, name, email, phone, address, description, status, is_subscription_active)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT u.id FROM users u WHERE u.user_type = 'PLATFORM_USER' ORDER BY RANDOM() LIMIT 1), 'Business ' || n, 'business' || n || '@test.com', '+855 23 ' || LPAD((n % 10000)::TEXT, 4, '0'), 'Address ' || n || ', Phnom Penh', 'Business ' || n, 'ACTIVE', CASE WHEN n % 2 = 0 THEN true ELSE false END
    FROM GENERATE_SERIES(1, 99) n;

    INSERT INTO business_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, logo_url, banner_url, business_type, opening_time, closing_time, is_open_24_hours, working_days, timezone, currency, language, usd_to_khr_rate, contact_email, contact_phone, whatsapp_number, facebook_url, instagram_url, website_url, primary_color, secondary_color, email_notifications_enabled, sms_notifications_enabled, order_notifications_enabled, tax_rate, service_charge_percentage, min_order_amount, delivery_radius_km, estimated_delivery_time, terms_and_conditions, privacy_policy, refund_policy)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, bs.id, photo1, photo2, 'RESTAURANT', '06:00', '23:00', false, 'MONDAY-SUNDAY', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, bs.email, bs.phone, '+855 10 100 0001', photo1, photo2, photo1, '#FF6B6B', '#FFE66D', true, false, true, 0.0, 10.0, 5.0, 25.0, '30-45 minutes', 'Fresh guarantee', 'Data protection', 'Full refund'
    FROM businesses bs WHERE bs.id != key_business_id;

    INSERT INTO subscriptions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, plan_id, start_date, end_date, auto_renew)
    SELECT gen_random_uuid(), 0, t - INTERVAL '6 months', t, 'system', 'system', false, NULL, NULL, bs.id, CASE (ROW_NUMBER() OVER (ORDER BY bs.id) % 3) WHEN 0 THEN plan1 WHEN 1 THEN plan2 ELSE plan3 END, t - INTERVAL '6 months', t + INTERVAL '6 months', true
    FROM businesses bs;

    -- =====================================================
    -- BUSINESS ROLES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 27% - Creating business roles...';
    INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, CASE r WHEN 1 THEN 'Manager' WHEN 2 THEN 'Chef' WHEN 3 THEN 'Sous Chef' WHEN 4 THEN 'Waiter' WHEN 5 THEN 'Cashier' WHEN 6 THEN 'Delivery Driver' WHEN 7 THEN 'Kitchen Staff' WHEN 8 THEN 'Supervisor' WHEN 9 THEN 'Accountant' WHEN 10 THEN 'Marketing' WHEN 11 THEN 'HR Officer' WHEN 12 THEN 'Customer Service' END, 'Business Role ' || r, br.id, 'BUSINESS_USER'
    FROM businesses br, GENERATE_SERIES(1, 12) r;

    -- =====================================================
    -- 60,000 BUSINESS USERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 30% - Creating 60,000 business users...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 'staff' || b_idx || '-' || s || '@business.com', 'staff' || b_idx || '-' || s || '@business.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Staff', 'Member ' || b_idx || '-' || s, '+855 10 200 ' || LPAD((s)::TEXT, 4, '0'), CASE WHEN s % 2 = 0 THEN photo1 ELSE photo2 END, 'BUSINESS_USER', 'ACTIVE', (SELECT id FROM businesses WHERE id != key_business_id ORDER BY id OFFSET ((b_idx - 1) % 99) LIMIT 1), 'Position ' || s, 'Business Address', 'Staff ' || b_idx || '-' || s, t - (RANDOM() * INTERVAL '30 days'), t - (RANDOM() * INTERVAL '2 days'), 1
    FROM GENERATE_SERIES(1, 100) b_idx, GENERATE_SERIES(1, 600) s;

    INSERT INTO user_roles (user_id, role_id) SELECT u.id, r.id FROM users u JOIN businesses b ON u.business_id = b.id JOIN roles r ON r.business_id = b.id WHERE u.user_type = 'BUSINESS_USER' AND u.id != business_user_id LIMIT 60000;

    -- =====================================================
    -- 120,000 CUSTOMERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 33% - Creating 120,000 customers...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 'customer' || n || '@test.com', 'customer' || n || '@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Customer' || n, 'User' || n, '+855 10 300 ' || LPAD((n % 10000)::TEXT, 4, '0'), CASE WHEN n % 2 = 0 THEN photo1 ELSE photo2 END, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh', 'Customer ' || n, t - (RANDOM() * INTERVAL '60 days'), t - (RANDOM() * INTERVAL '5 days'), 1
    FROM GENERATE_SERIES(1, 120000) n;

    INSERT INTO user_roles (user_id, role_id) SELECT u.id, role_customer FROM users u WHERE u.user_type = 'CUSTOMER';

    -- =====================================================
    -- 240 CATEGORIES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 36% - Creating 240 categories...';
    INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Category ' || c || ' (' || CASE (c % 8) WHEN 0 THEN 'Premium' WHEN 1 THEN 'Budget' WHEN 2 THEN 'New' WHEN 3 THEN 'Popular' WHEN 4 THEN 'Sale' WHEN 5 THEN 'Seasonal' WHEN 6 THEN 'Limited' ELSE 'Exclusive' END || ')', CASE WHEN c % 2 = 0 THEN photo1 ELSE photo2 END, 'ACTIVE'
    FROM GENERATE_SERIES(1, 240) c;

    -- =====================================================
    -- 240 BRANDS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 39% - Creating 240 brands...';
    INSERT INTO brands (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url, description, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Brand ' || br || ' - ' || CASE (br % 5) WHEN 0 THEN 'Premium' WHEN 1 THEN 'Standard' WHEN 2 THEN 'Economy' WHEN 3 THEN 'Luxury' ELSE 'Boutique' END, CASE WHEN br % 2 = 0 THEN photo1 ELSE photo2 END, 'Premium brand with quality products ' || br, 'ACTIVE'
    FROM GENERATE_SERIES(1, 240) br;

    -- =====================================================
    -- 180,000 PRODUCTS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 42% - Creating 180,000 products...';
    INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, category_id, brand_id, name, description, status, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, display_price, display_origin_price, display_promotion_type, display_promotion_value, display_promotion_from_date, display_promotion_to_date, has_sizes, has_active_promotion, view_count, favorite_count, main_image_url)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, (SELECT id FROM categories WHERE business_id = key_business_id ORDER BY RANDOM() LIMIT 1), (SELECT id FROM brands WHERE business_id = key_business_id ORDER BY RANDOM() LIMIT 1), 'Premium Product ' || p || ' (' || CASE (p % 100) WHEN 0 THEN 'Bestseller' WHEN 1 THEN 'New' ELSE 'Popular' END || ')', 'High-quality product with comprehensive description - Item ' || p, 'ACTIVE', (15.00 + (p % 300))::NUMERIC, CASE WHEN p % 4 = 0 THEN CASE WHEN (p / 4) % 2 = 0 THEN 'PERCENTAGE' ELSE 'FIXED_AMOUNT' END ELSE NULL END, CASE WHEN p % 4 = 0 THEN CASE WHEN (p / 4) % 2 = 0 THEN (5 + (p % 40)) ELSE (2.00 + (p % 50)) END ELSE NULL END, CASE WHEN p % 4 = 0 THEN t - INTERVAL '5 days' ELSE NULL END, CASE WHEN p % 4 = 0 THEN t + INTERVAL '90 days' ELSE NULL END, (15.00 + (p % 300))::NUMERIC, (15.00 + (p % 300))::NUMERIC, CASE WHEN p % 4 = 0 THEN CASE WHEN (p / 4) % 2 = 0 THEN 'PERCENTAGE' ELSE 'FIXED_AMOUNT' END ELSE NULL END, CASE WHEN p % 4 = 0 THEN CASE WHEN (p / 4) % 2 = 0 THEN (5 + (p % 40)) ELSE (2.00 + (p % 50)) END ELSE NULL END, CASE WHEN p % 4 = 0 THEN t - INTERVAL '5 days' ELSE NULL END, CASE WHEN p % 4 = 0 THEN t + INTERVAL '90 days' ELSE NULL END, CASE WHEN p % 4 = 0 THEN true ELSE false END, CASE WHEN p % 4 = 0 THEN true ELSE false END, (p % 10000), (p % 1000), CASE WHEN p % 2 = 0 THEN photo1 ELSE photo2 END
    FROM GENERATE_SERIES(1, 180000) p;
    RAISE NOTICE 'Products created!';

    -- =====================================================
    -- 720,000+ PRODUCT IMAGES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 45% - Creating 720,000+ product images...';
    INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, p.id, CASE WHEN (ROW_NUMBER() OVER (PARTITION BY p.id) - 1) % 2 = 0 THEN photo1 ELSE photo2 END
    FROM products p, GENERATE_SERIES(1, 4) img_num WHERE p.business_id = key_business_id;
    RAISE NOTICE 'Product images created!';

    -- =====================================================
    -- PRODUCT SIZES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 48% - Creating product sizes...';
    INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, name, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, p.id, CASE s WHEN 1 THEN 'XS/Small' WHEN 2 THEN 'S/Medium' WHEN 3 THEN 'M/Large' WHEN 4 THEN 'L/XL' WHEN 5 THEN 'XXL/Plus' END, (p.price + (s * 2.5))::NUMERIC, p.promotion_type, p.promotion_value, p.promotion_from_date, p.promotion_to_date
    FROM (SELECT id, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date FROM products WHERE has_sizes = true AND business_id = key_business_id) p, GENERATE_SERIES(1, 5) s;

    -- =====================================================
    -- PRODUCT STOCK (NEW - FOR ALL PRODUCTS)
    -- =====================================================
    RAISE NOTICE '📊 Progress: 51% - Creating product stock for all 180,000 products...';
    INSERT INTO product_stock (id, business_id, product_id, product_size_id, quantity_on_hand, quantity_reserved, quantity_available, price_in, date_in, date_out, expiry_date, barcode, sku, location, status, is_expired, created_at, updated_at, created_by, updated_by)
    SELECT
        gen_random_uuid(),
        key_business_id,
        p.id,
        NULL,
        (100 + (ps.stock_qty % 500))::INTEGER,
        (ps.stock_qty % 20)::INTEGER,
        ((100 + (ps.stock_qty % 500)) - (ps.stock_qty % 20))::INTEGER,
        (p.price - 5.00)::NUMERIC(19,4),
        t - INTERVAL '30 days',
        NULL,
        t + INTERVAL '180 days',
        'BARCODE-' || p.id::TEXT || '-' || ps.stock_qty::TEXT,
        'SKU-' || LPAD(ps.stock_qty::TEXT, 8, '0'),
        'Warehouse-' || CASE WHEN ps.stock_qty % 5 = 0 THEN 'A' WHEN ps.stock_qty % 5 = 1 THEN 'B' WHEN ps.stock_qty % 5 = 2 THEN 'C' WHEN ps.stock_qty % 5 = 3 THEN 'D' ELSE 'E' END,
        'ACTIVE',
        false,
        t,
        t,
        NULL,
        NULL
    FROM (SELECT id, price FROM products WHERE business_id = key_business_id) p, GENERATE_SERIES(1, 1) ps(stock_qty);
    RAISE NOTICE 'Product stock created!';

    -- =====================================================
    -- PRODUCT STOCK FOR SIZES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 54% - Creating product stock for sizes...';
    INSERT INTO product_stock (id, business_id, product_id, product_size_id, quantity_on_hand, quantity_reserved, quantity_available, price_in, date_in, date_out, expiry_date, barcode, sku, location, status, is_expired, created_at, updated_at, created_by, updated_by)
    SELECT
        gen_random_uuid(),
        key_business_id,
        ps.product_id,
        ps.id,
        (100 + (ps_qty.stock_qty % 500))::INTEGER,
        (ps_qty.stock_qty % 20)::INTEGER,
        ((100 + (ps_qty.stock_qty % 500)) - (ps_qty.stock_qty % 20))::INTEGER,
        (p.price + (5 * 2.5) - 5.00)::NUMERIC(19,4),
        t - INTERVAL '30 days',
        NULL,
        t + INTERVAL '180 days',
        'BARCODE-SIZE-' || ps.id::TEXT || '-' || ps_qty.stock_qty::TEXT,
        'SKU-SIZE-' || LPAD(ps_qty.stock_qty::TEXT, 8, '0'),
        'Warehouse-' || CASE WHEN ps_qty.stock_qty % 5 = 0 THEN 'A' WHEN ps_qty.stock_qty % 5 = 1 THEN 'B' WHEN ps_qty.stock_qty % 5 = 2 THEN 'C' WHEN ps_qty.stock_qty % 5 = 3 THEN 'D' ELSE 'E' END,
        'ACTIVE',
        false,
        t,
        t,
        NULL,
        NULL
    FROM product_sizes ps
    JOIN products p ON p.id = ps.product_id
    JOIN (SELECT id FROM products WHERE business_id = key_business_id AND has_sizes = true) p_sized ON p_sized.id = ps.product_id
    , GENERATE_SERIES(1, 1) ps_qty(stock_qty)
    WHERE ps.product_id IN (SELECT id FROM products WHERE business_id = key_business_id AND has_sizes = true);
    RAISE NOTICE 'Product size stock created!';

    -- =====================================================
    -- DELIVERY OPTIONS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 57% - Creating delivery options...';
    INSERT INTO delivery_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, image_url, price, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, CASE (d % 5) WHEN 0 THEN 'Standard Delivery' WHEN 1 THEN 'Express Delivery' WHEN 2 THEN 'Scheduled Delivery' WHEN 3 THEN 'Pickup' ELSE 'Dine-in' END, 'Delivery option ' || d, CASE WHEN d % 2 = 0 THEN photo1 ELSE photo2 END, CASE (d % 5) WHEN 0 THEN 2.00 WHEN 1 THEN 5.00 WHEN 2 THEN 2.50 ELSE 0.00 END, 'ACTIVE'
    FROM GENERATE_SERIES(1, 150) d;

    -- =====================================================
    -- PAYMENT OPTIONS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 60% - Creating payment options...';
    INSERT INTO payment_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, payment_option_type, status)
    VALUES
        -- CASH
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Cash', 'CASH', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'USD Cash', 'CASH', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'THB Cash', 'CASH', 'INACTIVE'),
        -- BANK TRANSFER
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Bank Transfer', 'BANK_TRANSFER', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Wire Transfer', 'BANK_TRANSFER', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'ACH Transfer', 'BANK_TRANSFER', 'INACTIVE'),
        -- CREDIT CARDS
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Visa', 'CREDIT_CARD', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'MasterCard', 'CREDIT_CARD', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'American Express', 'CREDIT_CARD', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'JCB', 'CREDIT_CARD', 'INACTIVE'),
        -- DEBIT CARDS
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Debit Card', 'DEBIT_CARD', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'ABA Card', 'DEBIT_CARD', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'ACE Card', 'DEBIT_CARD', 'INACTIVE'),
        -- MOBILE WALLET
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Wing Mobile', 'MOBILE_WALLET', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'ABA Mobile', 'MOBILE_WALLET', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'GCash', 'MOBILE_WALLET', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Alipay', 'MOBILE_WALLET', 'INACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'WeChat Pay', 'MOBILE_WALLET', 'ACTIVE'),
        -- CRYPTO
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Bitcoin', 'CRYPTO', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Ethereum', 'CRYPTO', 'INACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'USDC', 'CRYPTO', 'ACTIVE'),
        -- CHECK
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Check', 'CHECK', 'INACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Traveler Check', 'CHECK', 'INACTIVE'),
        -- OTHER
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Barter', 'OTHER', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Gift Card', 'OTHER', 'ACTIVE');

    -- =====================================================
    -- PAYMENT OPTIONS FOR OTHER BUSINESSES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 63% - Creating payment options for 99 other businesses...';
    INSERT INTO payment_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, payment_option_type, status)
    SELECT
        gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, b.id, po_name, po_type, po_status
    FROM (SELECT id FROM businesses WHERE id != key_business_id AND is_deleted = false) b,
    (VALUES
        ('Cash', 'CASH', 'ACTIVE'),
        ('Bank Transfer', 'BANK_TRANSFER', 'ACTIVE'),
        ('Wire Transfer', 'BANK_TRANSFER', 'ACTIVE'),
        ('Visa', 'CREDIT_CARD', 'ACTIVE'),
        ('MasterCard', 'CREDIT_CARD', 'ACTIVE'),
        ('American Express', 'CREDIT_CARD', 'ACTIVE'),
        ('Debit Card', 'DEBIT_CARD', 'ACTIVE'),
        ('ABA Card', 'DEBIT_CARD', 'ACTIVE'),
        ('Wing Mobile', 'MOBILE_WALLET', 'ACTIVE'),
        ('ABA Mobile', 'MOBILE_WALLET', 'ACTIVE'),
        ('GCash', 'MOBILE_WALLET', 'ACTIVE'),
        ('Bitcoin', 'CRYPTO', 'ACTIVE'),
        ('Ethereum', 'CRYPTO', 'ACTIVE'),
        ('USDC', 'CRYPTO', 'ACTIVE'),
        ('Check', 'CHECK', 'INACTIVE'),
        ('Barter', 'OTHER', 'ACTIVE'),
        ('Gift Card', 'OTHER', 'ACTIVE')
    ) AS po(po_name, po_type, po_status);
    RAISE NOTICE 'Payment options created for all businesses!';

    -- =====================================================
    -- BANNERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 66% - Creating banners...';
    INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, image_url, link_url, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, CASE WHEN bn % 2 = 0 THEN photo1 ELSE photo2 END, '/menu?promo=' || bn, 'ACTIVE'
    FROM GENERATE_SERIES(1, 300) bn;

    -- =====================================================
    -- CUSTOMER ADDRESSES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 69% - Creating customer addresses...';
    INSERT INTO customer_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer_user_id, 'Village ' || a, 'Commune ' || a, 'District ' || a, 'Phnom Penh', 'Cambodia', 'Street ' || a, 'House ' || a, 'Apt ' || a, 11.5564 + (a::NUMERIC / 1000), 104.9282 + (a::NUMERIC / 1000), a = 1
    FROM GENERATE_SERIES(1, 300) a;

    INSERT INTO customer_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT id FROM users WHERE user_type = 'CUSTOMER' AND id != customer_user_id ORDER BY RANDOM() LIMIT 1), 'Village ' || a, 'Commune ' || a, 'District ' || a, 'Phnom Penh', 'Cambodia', 'Street ' || a, 'House ' || a, 'Apt ' || a, 11.5564 + (a::NUMERIC / 1000), 104.9282 + (a::NUMERIC / 1000), a % 3 = 1
    FROM GENERATE_SERIES(1, 279700) a;

    -- =====================================================
    -- CARTS & ITEMS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 72% - Creating carts and items...';
    INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, business_id)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, u.id, key_business_id
    FROM (SELECT id FROM users WHERE user_type = 'CUSTOMER' ORDER BY RANDOM() LIMIT 120000) u;

    INSERT INTO cart_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, cart_id, product_id, product_size_id, quantity)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT id FROM carts WHERE user_id = customer_user_id LIMIT 1), (SELECT id FROM products ORDER BY RANDOM() LIMIT 1), NULL, (1 + (ci % 20))
    FROM GENERATE_SERIES(1, 2000) ci;

    INSERT INTO cart_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, cart_id, product_id, product_size_id, quantity)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT id FROM carts WHERE user_id != customer_user_id ORDER BY RANDOM() LIMIT 1), (SELECT id FROM products ORDER BY RANDOM() LIMIT 1), NULL, (1 + (ci % 20))
    FROM GENERATE_SERIES(1, 118000) ci;

    INSERT INTO product_favorites (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, product_id)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT id FROM users WHERE user_type = 'CUSTOMER' ORDER BY RANDOM() LIMIT 1), (SELECT id FROM products ORDER BY RANDOM() LIMIT 1)
    FROM GENERATE_SERIES(1, 100000) pf ON CONFLICT DO NOTHING;

    -- =====================================================
    -- ORDERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 75% - Creating 200,000 orders...';
    INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_status, delivery_address_snapshot, delivery_option_snapshot, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, confirmed_at, completed_at)
    SELECT gen_random_uuid(), 0, t - (RANDOM() * INTERVAL '180 days'), t, 'system', 'system', false, NULL, NULL, key_business_id, customer_user_id, 'ORD-KCU-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(ord_n::TEXT, 6, '0'),
        CASE WHEN ord_n % 8 = 0 THEN 'PENDING'::VARCHAR WHEN ord_n % 8 = 1 THEN 'CONFIRMED' WHEN ord_n % 8 = 2 THEN 'PREPARING' WHEN ord_n % 8 = 3 THEN 'READY' WHEN ord_n % 8 = 4 THEN 'IN_TRANSIT' WHEN ord_n % 8 = 5 THEN 'COMPLETED' WHEN ord_n % 8 = 6 THEN 'CANCELLED' ELSE 'FAILED' END,
        '{"village":"Village"}', '{"name":"Standard"}', (20.00 + (ord_n % 200))::NUMERIC, (ord_n % 10)::NUMERIC, 2.00, (ord_n % 5)::NUMERIC, ((20.00 + (ord_n % 200)) - (ord_n % 10) + 2.00 + (ord_n % 5))::NUMERIC, CASE (ord_n % 4) WHEN 0 THEN 'CASH' WHEN 1 THEN 'BANK_TRANSFER' WHEN 2 THEN 'ONLINE' ELSE 'OTHER' END, CASE (ord_n % 3) WHEN 0 THEN 'UNPAID' WHEN 1 THEN 'PAID' ELSE 'REFUNDED' END, 'Note ' || ord_n, 'Note ' || ord_n, CASE WHEN ord_n % 2 = 0 THEN t - (RANDOM() * INTERVAL '150 days') ELSE NULL END, CASE WHEN ord_n % 3 = 2 THEN t - (RANDOM() * INTERVAL '100 days') ELSE NULL END
    FROM GENERATE_SERIES(1, 10000) ord_n;

    INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_status, delivery_address_snapshot, delivery_option_snapshot, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, confirmed_at, completed_at)
    SELECT gen_random_uuid(), 0, t - (RANDOM() * INTERVAL '180 days'), t, 'system', 'system', false, NULL, NULL, key_business_id, (SELECT id FROM users WHERE user_type = 'CUSTOMER' AND id != customer_user_id ORDER BY RANDOM() LIMIT 1), 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((10000 + ord_n)::TEXT, 6, '0'),
        CASE WHEN ord_n % 8 = 0 THEN 'PENDING'::VARCHAR WHEN ord_n % 8 = 1 THEN 'CONFIRMED' WHEN ord_n % 8 = 2 THEN 'PREPARING' WHEN ord_n % 8 = 3 THEN 'READY' WHEN ord_n % 8 = 4 THEN 'IN_TRANSIT' WHEN ord_n % 8 = 5 THEN 'COMPLETED' WHEN ord_n % 8 = 6 THEN 'CANCELLED' ELSE 'FAILED' END,
        '{"village":"Village"}', '{"name":"Standard"}', (20.00 + (ord_n % 200))::NUMERIC, (ord_n % 10)::NUMERIC, 2.00, (ord_n % 5)::NUMERIC, ((20.00 + (ord_n % 200)) - (ord_n % 10) + 2.00 + (ord_n % 5))::NUMERIC, CASE (ord_n % 4) WHEN 0 THEN 'CASH' WHEN 1 THEN 'BANK_TRANSFER' WHEN 2 THEN 'ONLINE' ELSE 'OTHER' END, CASE (ord_n % 3) WHEN 0 THEN 'UNPAID' WHEN 1 THEN 'PAID' ELSE 'REFUNDED' END, 'Note ' || ord_n, 'Note ' || ord_n, CASE WHEN ord_n % 2 = 0 THEN t - (RANDOM() * INTERVAL '150 days') ELSE NULL END, CASE WHEN ord_n % 3 = 2 THEN t - (RANDOM() * INTERVAL '100 days') ELSE NULL END
    FROM GENERATE_SERIES(1, 190000) ord_n;
    RAISE NOTICE 'Orders created!';

    -- =====================================================
    -- ORDER ITEMS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 78% - Creating order items...';
    INSERT INTO order_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, quantity, total_price, has_promotion)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1), (SELECT id FROM products ORDER BY RANDOM() LIMIT 1), NULL, 'Item', photo1, 'Medium', 10.00, 10.00, 10.00, 1, 10.00, false
    FROM GENERATE_SERIES(1, 600000) oi_n;

    -- =====================================================
    -- ORDER PAYMENTS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 81% - Creating order payments...';
    INSERT INTO order_payments (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, order_id, payment_reference, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, status, customer_payment_method)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1), 'PAY-' || LPAD(opay_n::TEXT, 10, '0'), 100.00, 10.00, 2.00, 5.00, 97.00, CASE (opay_n % 4) WHEN 0 THEN 'CASH' WHEN 1 THEN 'BANK_TRANSFER' WHEN 2 THEN 'ONLINE' ELSE 'OTHER' END, CASE (opay_n % 4) WHEN 0 THEN 'PENDING' WHEN 1 THEN 'COMPLETED' WHEN 2 THEN 'FAILED' ELSE 'CANCELLED' END, 'Cash'
    FROM GENERATE_SERIES(1, 200000) opay_n;

    -- =====================================================
    -- ORDER STATUS HISTORY
    -- =====================================================
    RAISE NOTICE '📊 Progress: 84% - Creating order status history...';
    INSERT INTO order_status_history (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, order_status, changed_by_user_id, changed_by_name, note)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1),
        CASE WHEN osh % 8 = 0 THEN 'PENDING'::VARCHAR WHEN osh % 8 = 1 THEN 'CONFIRMED' WHEN osh % 8 = 2 THEN 'PREPARING' WHEN osh % 8 = 3 THEN 'READY' WHEN osh % 8 = 4 THEN 'IN_TRANSIT' WHEN osh % 8 = 5 THEN 'COMPLETED' WHEN osh % 8 = 6 THEN 'CANCELLED' ELSE 'FAILED' END,
        business_user_id, 'System', 'Order status changed'
    FROM GENERATE_SERIES(1, 200000) osh;

    -- =====================================================
    -- WORK SCHEDULES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 87% - Creating work schedules...';
    INSERT INTO work_schedules (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, user_id, name, schedule_type_enum, start_time, end_time, break_start_time, break_end_time)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, business_user_id, 'Schedule ' || ws, CASE WHEN ws % 2 = 0 THEN 'MORNING_SHIFT' ELSE 'EVENING_SHIFT' END, '06:00'::TIME, '14:00'::TIME, '12:00'::TIME, '13:00'::TIME
    FROM GENERATE_SERIES(1, 500) ws;

    -- =====================================================
    -- ATTENDANCES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 90% - Creating attendances...';
    INSERT INTO attendances (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_number, user_id, business_id, work_schedule_id, attendance_date, status, remarks)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 'ATT-' || gen_random_uuid()::TEXT, business_user_id, key_business_id, (SELECT id FROM work_schedules WHERE user_id = business_user_id LIMIT 1), (t - (INTERVAL '1 day' * (att % 365)))::DATE, CASE WHEN att % 15 = 0 THEN 'ABSENT' WHEN att % 15 = 1 THEN 'LATE' ELSE 'PRESENT' END, 'Attendance'
    FROM GENERATE_SERIES(1, 20000) att;

    -- =====================================================
    -- ATTENDANCE CHECK-INS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 93% - Creating attendance check-ins...';
    INSERT INTO attendance_check_ins (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, reference_number, attendance_id, check_in_type, check_in_time, latitude, longitude, remarks)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 'CHK-' || gen_random_uuid()::TEXT, (SELECT id FROM attendances WHERE user_id = business_user_id ORDER BY RANDOM() LIMIT 1), CASE WHEN aci % 2 = 0 THEN 'START' ELSE 'END' END, (t - (INTERVAL '1 day' * (aci % 365)))::TIMESTAMP, 11.5564, 104.9282, 'Check-in'
    FROM GENERATE_SERIES(1, 40000) aci;

    -- =====================================================
    -- EXCHANGE RATES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 96% - Creating exchange rates...';
    INSERT INTO exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, usd_to_khr_rate, is_active, notes)
    VALUES (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 4100.0, true, 'USD to KHR rate');

    INSERT INTO business_exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, usd_to_khr_rate, usd_to_thb_rate, usd_to_cny_rate, usd_to_vnd_rate, is_active, notes)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 4105.0, 35.45, 7.25, 24500.0, true, 'Exchange rates'
    FROM GENERATE_SERIES(1, 5) ber;

    RAISE NOTICE '📊 Progress: 99% - Finalizing...';
    RAISE NOTICE '✅ SUCCESS: 180,000 products with 720,000+ images created!';
    RAISE NOTICE '✅ PRODUCT STOCK: All 180,000 products + sizes have stock!';
    RAISE NOTICE '✅ 200,000 orders created!';
    RAISE NOTICE '✅ TEST ACCOUNTS: phatmenghor19 / phatmenghor20 / phatmenghor21';
    RAISE NOTICE '📊 Progress: 100% - COMPLETE! ✅';

END $$;

SET synchronous_commit TO ON;

-- ============================================================================
-- PRODUCTION INDEXES
-- ============================================================================
SELECT '✅ Creating production indexes...' as status;

-- Drop old indexes
DROP INDEX IF EXISTS idx_product_stock_business_id;
DROP INDEX IF EXISTS idx_product_stock_product_id;
DROP INDEX IF EXISTS idx_product_stock_product_size_id;
DROP INDEX IF EXISTS idx_product_stock_barcode;
DROP INDEX IF EXISTS idx_product_stock_sku;
DROP INDEX IF EXISTS idx_product_stock_status;

-- Create new indexes
CREATE INDEX idx_product_stock_business_id ON product_stock(business_id) WHERE is_deleted = false;
CREATE INDEX idx_product_stock_product_id ON product_stock(product_id) WHERE is_deleted = false;
CREATE INDEX idx_product_stock_product_size_id ON product_stock(product_size_id) WHERE product_size_id IS NOT NULL AND is_deleted = false;
CREATE UNIQUE INDEX idx_product_stock_barcode ON product_stock(barcode) WHERE is_deleted = false;
CREATE UNIQUE INDEX idx_product_stock_sku ON product_stock(sku) WHERE is_deleted = false;
CREATE INDEX idx_product_stock_status ON product_stock(status) WHERE is_deleted = false;

SELECT '✅ ALL INDEXES CREATED SUCCESSFULLY!' as status;
SELECT '📊 Database is fully optimized for production use' as info;
SELECT '🚀 180K products + Stock ready!' as ready;
