-- ============================================================================
-- MINIMAL TEST DATA - 3 MAIN USERS + 1 BUSINESS
-- Focused dataset for phatmenghor19, phatmenghor20, phatmenghor21
-- ============================================================================

SET synchronous_commit TO OFF;

DO $$ DECLARE
    t TIMESTAMPTZ := NOW();
    photo1 TEXT := 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop';
    photo2 TEXT := 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop';
    role_admin UUID := gen_random_uuid();
    role_business UUID := gen_random_uuid();
    role_customer UUID := gen_random_uuid();
    plan2 UUID := gen_random_uuid();
    platform_user_id UUID := gen_random_uuid();
    business_user_id UUID := gen_random_uuid();
    customer_user_id UUID := gen_random_uuid();
    key_business_id UUID := gen_random_uuid();

BEGIN
    RAISE NOTICE '🚀 MINIMAL TEST DATA GENERATION STARTED!';
    RAISE NOTICE '📊 Progress: 0%% - Initializing...';

    -- =====================================================
    -- CLEANUP
    -- =====================================================
    RAISE NOTICE '📊 Progress: 5%% - 🧹 Cleaning database...';

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
    RAISE NOTICE '📊 Progress: 10%% - Creating roles...';
    INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type)
    VALUES
        (role_admin, 0, t, t, 'system', 'system', false, NULL, NULL, 'PLATFORM_ADMIN', 'Platform Administrator', NULL, 'PLATFORM_USER'),
        (role_business, 0, t, t, 'system', 'system', false, NULL, NULL, 'BUSINESS_OWNER', 'Business Owner', NULL, 'BUSINESS_USER'),
        (role_customer, 0, t, t, 'system', 'system', false, NULL, NULL, 'CUSTOMER', 'Customer', NULL, 'CUSTOMER');

    -- =====================================================
    -- SUBSCRIPTION PLANS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 15%% - Creating subscription plan...';
    INSERT INTO subscription_plans (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, price, duration_days, status)
    VALUES
        (plan2, 0, t, t, 'system', 'system', false, NULL, NULL, 'Pro Plan', 'Advanced features', 299.99, 365, 'PUBLIC');

    -- =====================================================
    -- 3 MAIN USERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 20%% - Creating 3 main test users...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES
        (platform_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'phatmenghor19@gmail.com', 'phatmenghor19@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Platform', 'Admin', '+855 10 100 0001', photo1, 'PLATFORM_USER', 'ACTIVE', NULL, 'Platform Admin', 'Phnom Penh', 'Key Platform Admin', t - INTERVAL '1 day', t, 1),
        (business_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'phatmenghor20@gmail.com', 'phatmenghor20@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Business', 'Manager', '+855 10 200 0001', photo2, 'BUSINESS_USER', 'ACTIVE', NULL, 'Business Manager', 'Phnom Penh', 'Key Business Manager', t - INTERVAL '2 days', t, 1),
        (customer_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'phatmenghor21@gmail.com', 'phatmenghor21@gmail.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Customer', 'User', '+855 10 300 0001', photo1, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh', 'Key Customer', t - INTERVAL '5 days', t, 1);

    INSERT INTO user_roles (user_id, role_id)
    VALUES
        (platform_user_id, role_admin),
        (business_user_id, role_business),
        (customer_user_id, role_customer);

    -- =====================================================
    -- 1 KEY BUSINESS (OWNED BY phatmenghor20)
    -- =====================================================
    RAISE NOTICE '📊 Progress: 25%% - Creating key business owned by phatmenghor20...';
    INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, owner_id, name, email, phone, address, description, status, is_subscription_active)
    VALUES (key_business_id, 0, t, t, 'system', 'system', false, NULL, NULL, business_user_id, 'Phatmenghor Business', 'mega@test.com', '+855 23 9999999', 'Phnom Penh, Cambodia', 'Main business owned by phatmenghor20', 'ACTIVE', true);

    INSERT INTO business_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, logo_url, banner_url, business_type, opening_time, closing_time, is_open_24_hours, working_days, timezone, currency, language, usd_to_khr_rate, contact_email, contact_phone, whatsapp_number, facebook_url, instagram_url, website_url, primary_color, secondary_color, email_notifications_enabled, sms_notifications_enabled, order_notifications_enabled, tax_rate, service_charge_percentage, min_order_amount, delivery_radius_km, estimated_delivery_time, terms_and_conditions, privacy_policy, refund_policy)
    VALUES (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, photo1, photo2, 'RESTAURANT', '06:00', '23:00', false, 'MONDAY-SUNDAY', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, 'mega@test.com', '+855 23 9999999', '+855 10 100 0001', photo1, photo2, photo1, '#FF6B6B', '#FFE66D', true, true, true, 0.0, 10.0, 5.0, 25.0, '30-45 minutes', 'Premium guarantee', 'Data protection', 'Full refund');

    UPDATE users SET business_id = key_business_id WHERE id = business_user_id;

    INSERT INTO subscriptions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, plan_id, start_date, end_date, auto_renew)
    VALUES (gen_random_uuid(), 0, t - INTERVAL '6 months', t, 'system', 'system', false, NULL, NULL, key_business_id, plan2, t - INTERVAL '6 months', t + INTERVAL '12 months', true);

    -- Add phatmenghor20 to the business as owner/manager
    UPDATE users SET business_id = key_business_id WHERE id = business_user_id;

    -- =====================================================
    -- 30 BUSINESS ROLES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 30%% - Creating 30 business roles...';
    INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, CASE r WHEN 1 THEN 'Manager' WHEN 2 THEN 'Chef' WHEN 3 THEN 'Sous Chef' WHEN 4 THEN 'Waiter' WHEN 5 THEN 'Cashier' WHEN 6 THEN 'Delivery Driver' WHEN 7 THEN 'Kitchen Staff' WHEN 8 THEN 'Supervisor' WHEN 9 THEN 'Accountant' WHEN 10 THEN 'Marketing' WHEN 11 THEN 'HR Officer' WHEN 12 THEN 'Customer Service' WHEN 13 THEN 'Security' WHEN 14 THEN 'Maintenance' WHEN 15 THEN 'Inventory' WHEN 16 THEN 'Quality Control' WHEN 17 THEN 'Trainer' WHEN 18 THEN 'Coordinator' WHEN 19 THEN 'Assistant Manager' WHEN 20 THEN 'Head Chef' WHEN 21 THEN 'Server' WHEN 22 THEN 'Host' WHEN 23 THEN 'Bartender' WHEN 24 THEN 'Cook' WHEN 25 THEN 'Dishwasher' WHEN 26 THEN 'Busser' WHEN 27 THEN 'Cleaner' WHEN 28 THEN 'Admin' WHEN 29 THEN 'Support' ELSE 'Specialist' END, 'Role ' || r, key_business_id, 'BUSINESS_USER'
    FROM GENERATE_SERIES(1, 30) r;

    -- =====================================================
    -- 2000 BUSINESS USERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 35%% - Creating 2000 business users...';
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 'staff' || u || '@business.com', 'staff' || u || '@business.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Staff', 'User ' || u, '+855 10 ' || LPAD((u % 10000000)::TEXT, 8, '0'), CASE WHEN u % 2 = 0 THEN photo1 ELSE photo2 END, 'BUSINESS_USER', 'ACTIVE', key_business_id, 'Position ' || u, 'Business Address', 'Staff User ' || u, t - (RANDOM() * INTERVAL '30 days'), t - (RANDOM() * INTERVAL '2 days'), 1
    FROM GENERATE_SERIES(1, 2000) u;

    -- Assign roles to business users
    INSERT INTO user_roles (user_id, role_id)
    SELECT u.id, r.id FROM users u, (SELECT id FROM roles WHERE business_id = key_business_id) r WHERE u.business_id = key_business_id AND u.id != business_user_id LIMIT 2000;

    -- =====================================================
    -- 10 CATEGORIES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 35%% - Creating categories...';
    INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Category ' || c, CASE WHEN c % 2 = 0 THEN photo1 ELSE photo2 END, 'ACTIVE'
    FROM GENERATE_SERIES(1, 10) c;

    -- =====================================================
    -- 5 BRANDS
    -- =====================================================
    INSERT INTO brands (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, image_url, description, status)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Brand ' || br, CASE WHEN br % 2 = 0 THEN photo1 ELSE photo2 END, 'Brand ' || br, 'ACTIVE'
    FROM GENERATE_SERIES(1, 5) br;

    -- =====================================================
    -- 500 PRODUCTS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 40%% - Creating 500 products...';
    INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, category_id, brand_id, name, description, status, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, display_price, display_origin_price, display_promotion_type, display_promotion_value, display_promotion_from_date, display_promotion_to_date, has_sizes, has_active_promotion, view_count, favorite_count, main_image_url)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, (SELECT id FROM categories WHERE business_id = key_business_id ORDER BY RANDOM() LIMIT 1), (SELECT id FROM brands WHERE business_id = key_business_id ORDER BY RANDOM() LIMIT 1), 'Product ' || p, 'Description for product ' || p, 'ACTIVE', (15.00 + (p % 100))::NUMERIC, CASE WHEN p % 3 = 0 THEN 'PERCENTAGE' ELSE NULL END, CASE WHEN p % 3 = 0 THEN 10 ELSE NULL END, CASE WHEN p % 3 = 0 THEN t - INTERVAL '5 days' ELSE NULL END, CASE WHEN p % 3 = 0 THEN t + INTERVAL '90 days' ELSE NULL END, (15.00 + (p % 100))::NUMERIC, (15.00 + (p % 100))::NUMERIC, CASE WHEN p % 3 = 0 THEN 'PERCENTAGE' ELSE NULL END, CASE WHEN p % 3 = 0 THEN 10 ELSE NULL END, CASE WHEN p % 3 = 0 THEN t - INTERVAL '5 days' ELSE NULL END, CASE WHEN p % 3 = 0 THEN t + INTERVAL '90 days' ELSE NULL END, CASE WHEN p % 5 = 0 THEN true ELSE false END, CASE WHEN p % 3 = 0 THEN true ELSE false END, (p % 100), (p % 20), CASE WHEN p % 2 = 0 THEN photo1 ELSE photo2 END
    FROM GENERATE_SERIES(1, 500) p;
    RAISE NOTICE 'Products created!';

    -- =====================================================
    -- PRODUCT IMAGES (2 per product)
    -- =====================================================
    RAISE NOTICE '📊 Progress: 45%% - Creating product images...';
    INSERT INTO product_images (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, image_url)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, p.id, CASE WHEN img % 2 = 0 THEN photo1 ELSE photo2 END
    FROM products p, GENERATE_SERIES(1, 2) img
    WHERE p.business_id = key_business_id;
    RAISE NOTICE 'Product images created!';

    -- =====================================================
    -- PRODUCT SIZES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 50%% - Creating product sizes...';
    INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, name, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, p.id, CASE s WHEN 1 THEN 'Small' WHEN 2 THEN 'Medium' WHEN 3 THEN 'Large' END, (p.price + (s * 2.5))::NUMERIC, p.promotion_type, p.promotion_value, p.promotion_from_date, p.promotion_to_date
    FROM (SELECT id, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date FROM products WHERE has_sizes = true AND business_id = key_business_id) p, GENERATE_SERIES(1, 3) s;

    -- =====================================================
    -- PRODUCT STOCK (100 products + sizes)
    -- =====================================================
    RAISE NOTICE '📊 Progress: 55%% - Creating product stock...';
    INSERT INTO product_stock (id, business_id, product_id, product_size_id, quantity_on_hand, quantity_reserved, quantity_available, price_in, date_in, date_out, expiry_date, barcode, sku, location, status, is_expired, created_at, updated_at, created_by, updated_by)
    SELECT gen_random_uuid(), key_business_id, p.id, NULL, 100, 10, 90, (p.price - 5.00)::NUMERIC(19,4), t - INTERVAL '30 days', NULL, t + INTERVAL '180 days', 'BARCODE-' || p.id::TEXT, 'SKU-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 8, '0'), 'Warehouse A', 'ACTIVE', false, t, t, NULL, NULL
    FROM products p WHERE p.business_id = key_business_id;

    INSERT INTO product_stock (id, business_id, product_id, product_size_id, quantity_on_hand, quantity_reserved, quantity_available, price_in, date_in, date_out, expiry_date, barcode, sku, location, status, is_expired, created_at, updated_at, created_by, updated_by)
    SELECT gen_random_uuid(), key_business_id, ps.product_id, ps.id, 50, 5, 45, (p.price + 2.5 - 5.00)::NUMERIC(19,4), t - INTERVAL '30 days', NULL, t + INTERVAL '180 days', 'BARCODE-SIZE-' || ps.id::TEXT, 'SKU-SIZE-' || LPAD(ROW_NUMBER() OVER ()::TEXT, 8, '0'), 'Warehouse A', 'ACTIVE', false, t, t, NULL, NULL
    FROM product_sizes ps
    JOIN products p ON p.id = ps.product_id
    WHERE p.business_id = key_business_id;
    RAISE NOTICE 'Product stock created!';

    -- =====================================================
    -- DELIVERY OPTIONS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 60%% - Creating delivery options...';
    INSERT INTO delivery_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, image_url, price, status)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Standard Delivery', 'Standard delivery', photo1, 2.00, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Express Delivery', 'Fast delivery', photo2, 5.00, 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Pickup', 'Self pickup', photo1, 0.00, 'ACTIVE');

    -- =====================================================
    -- PAYMENT OPTIONS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 65%% - Creating payment options...';
    INSERT INTO payment_options (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, payment_option_type, status)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Cash', 'CASH', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Bank Transfer', 'BANK_TRANSFER', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Visa', 'CREDIT_CARD', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'MasterCard', 'CREDIT_CARD', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Wing Mobile', 'MOBILE_WALLET', 'ACTIVE');

    -- =====================================================
    -- BANNERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 70%% - Creating banners...';
    INSERT INTO banners (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, image_url, link_url, status)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, photo1, '/promo/1', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, photo2, '/promo/2', 'ACTIVE'),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, photo1, '/promo/3', 'ACTIVE');

    -- =====================================================
    -- CUSTOMER ADDRESSES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 75%% - Creating customer addresses...';
    INSERT INTO customer_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default)
    VALUES
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer_user_id, 'Village 1', 'Commune 1', 'District 1', 'Phnom Penh', 'Cambodia', 'Street 1', 'House 1', 'Address 1', 11.5564, 104.9282, true),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer_user_id, 'Village 2', 'Commune 2', 'District 2', 'Phnom Penh', 'Cambodia', 'Street 2', 'House 2', 'Address 2', 11.5600, 104.9320, false);

    -- =====================================================
    -- CARTS & ITEMS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 80%% - Creating carts and items...';
    INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, business_id)
    VALUES (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer_user_id, key_business_id);

    INSERT INTO cart_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, cart_id, product_id, product_size_id, quantity)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT id FROM carts WHERE user_id = customer_user_id LIMIT 1), (SELECT id FROM products WHERE business_id = key_business_id ORDER BY RANDOM() LIMIT 1), NULL, 2
    FROM GENERATE_SERIES(1, 5);

    INSERT INTO product_favorites (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_id, product_id)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, customer_user_id, (SELECT id FROM products WHERE business_id = key_business_id ORDER BY RANDOM() LIMIT 1)
    FROM GENERATE_SERIES(1, 5) ON CONFLICT DO NOTHING;

    -- =====================================================
    -- 200 ORDERS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 85%% - Creating 200 orders...';
    INSERT INTO orders (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, customer_id, order_number, order_status, delivery_address_snapshot, delivery_option_snapshot, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, confirmed_at, completed_at)
    SELECT gen_random_uuid(), 0, t - (RANDOM() * INTERVAL '30 days'), t, 'system', 'system', false, NULL, NULL, key_business_id, customer_user_id, 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(ord_n::TEXT, 6, '0'),
        CASE WHEN ord_n % 4 = 0 THEN 'PENDING'::VARCHAR WHEN ord_n % 4 = 1 THEN 'CONFIRMED' WHEN ord_n % 4 = 2 THEN 'COMPLETED' ELSE 'CANCELLED' END,
        '{"village":"Village 1"}', '{"name":"Standard"}', (50.00 + (ord_n % 100))::NUMERIC, 0, 2.00, 5.00, (55.00 + (ord_n % 100))::NUMERIC, 'CASH', 'PAID', 'Test order', 'Processing', t - (RANDOM() * INTERVAL '30 days'), CASE WHEN ord_n % 4 = 2 THEN t - INTERVAL '1 day' ELSE NULL END
    FROM GENERATE_SERIES(1, 200) ord_n;
    RAISE NOTICE 'Orders created!';

    -- =====================================================
    -- ORDER ITEMS
    -- =====================================================
    RAISE NOTICE '📊 Progress: 90%% - Creating order items...';
    INSERT INTO order_items (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, quantity, total_price, has_promotion)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT id FROM orders ORDER BY id OFFSET (oi_n - 1) LIMIT 1), (SELECT id FROM products WHERE business_id = key_business_id ORDER BY RANDOM() LIMIT 1), NULL, 'Item', photo1, 'Medium', 25.00, 25.00, 25.00, 2, 50.00, false
    FROM GENERATE_SERIES(1, 200) oi_n;

    -- =====================================================
    -- ORDER PAYMENTS
    -- =====================================================
    INSERT INTO order_payments (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, order_id, payment_reference, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, status, customer_payment_method)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, (SELECT id FROM orders ORDER BY id OFFSET (opay_n - 1) LIMIT 1), 'PAY-' || LPAD(opay_n::TEXT, 10, '0'), 100.00, 0, 2.00, 5.00, 107.00, 'CASH', 'COMPLETED', 'Cash'
    FROM GENERATE_SERIES(1, 200) opay_n;

    -- =====================================================
    -- ORDER STATUS HISTORY
    -- =====================================================
    RAISE NOTICE '📊 Progress: 95%% - Creating order status history...';
    INSERT INTO order_status_history (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, order_status, changed_by_user_id, changed_by_name, note)
    SELECT gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, (SELECT id FROM orders ORDER BY RANDOM() LIMIT 1), CASE WHEN osh % 2 = 0 THEN 'CONFIRMED'::VARCHAR ELSE 'COMPLETED' END, business_user_id, 'System', 'Status updated'
    FROM GENERATE_SERIES(1, 200) osh;

    -- =====================================================
    -- EXCHANGE RATES
    -- =====================================================
    RAISE NOTICE '📊 Progress: 97%% - Creating exchange rates...';
    INSERT INTO exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, usd_to_khr_rate, is_active, notes)
    VALUES (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, 4100.0, true, 'USD to KHR rate');

    INSERT INTO business_exchange_rates (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, usd_to_khr_rate, usd_to_thb_rate, usd_to_cny_rate, usd_to_vnd_rate, is_active, notes)
    VALUES (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 4105.0, 35.45, 7.25, 24500.0, true, 'Exchange rates');

    RAISE NOTICE '✅ 3 MAIN USERS CREATED:';
    RAISE NOTICE '   • phatmenghor19@gmail.com (Platform Admin/Owner)';
    RAISE NOTICE '   • phatmenghor20@gmail.com (Business Owner & Manager)';
    RAISE NOTICE '   • phatmenghor21@gmail.com (Customer)';
    RAISE NOTICE '✅ BUSINESS DATA (All under phatmenghor20):';
    RAISE NOTICE '   • 1 Business: Phatmenghor Business (owned by phatmenghor20)';
    RAISE NOTICE '   • 30 Business Roles';
    RAISE NOTICE '   • 2000 Business Users (staff under phatmenghor20''s business)';
    RAISE NOTICE '   • 500 Products with Sizes & Stock';
    RAISE NOTICE '   • 200 Orders with Items & Payments';
    RAISE NOTICE '   • 5 Delivery Options & 5 Payment Methods';
    RAISE NOTICE '📊 Progress: 100%% - COMPLETE! ✅';

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

SELECT '✅ ALL INDEXES CREATED!' as status;
SELECT '✅ Minimal test data ready!' as info;
