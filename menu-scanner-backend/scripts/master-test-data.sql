-- ============================================================================
-- MASTER TEST DATA SCRIPT - DATA ONLY (No table creation)
-- ============================================================================
-- Pure test data generation - tables already exist from JPA/Hibernate
-- Just truncates and populates test data
--
-- Run with: psql -h localhost -U postgres -d emenu_db -f master-test-data.sql
-- ============================================================================

SET synchronous_commit TO OFF;

DO $$ DECLARE
    v_now TIMESTAMPTZ := NOW();
    v_photo1 TEXT := 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop';
    v_photo2 TEXT := 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop';

    -- IDs
    v_role_admin UUID := gen_random_uuid();
    v_role_business UUID := gen_random_uuid();
    v_role_customer UUID := gen_random_uuid();
    v_plan1 UUID := gen_random_uuid();
    v_plan2 UUID := gen_random_uuid();
    v_plan3 UUID := gen_random_uuid();
    v_admin_user UUID := gen_random_uuid();
    v_business_user UUID := gen_random_uuid();
    v_customer_user UUID := gen_random_uuid();
    v_business_id UUID := gen_random_uuid();

    -- Categories
    v_cat_food UUID := gen_random_uuid();
    v_cat_beverages UUID := gen_random_uuid();
    v_cat_snacks UUID := gen_random_uuid();

    -- Products
    v_prod_coffee UUID := gen_random_uuid();
    v_prod_tea UUID := gen_random_uuid();
    v_prod_juice UUID := gen_random_uuid();
    v_prod_burger UUID := gen_random_uuid();
    v_prod_fries UUID := gen_random_uuid();

    -- Sizes
    v_size_coffee_s UUID := gen_random_uuid();
    v_size_coffee_m UUID := gen_random_uuid();
    v_size_coffee_l UUID := gen_random_uuid();
    v_size_tea_s UUID := gen_random_uuid();
    v_size_tea_l UUID := gen_random_uuid();
    v_size_juice_s UUID := gen_random_uuid();
    v_size_juice_l UUID := gen_random_uuid();
    v_size_fries_s UUID := gen_random_uuid();
    v_size_fries_l UUID := gen_random_uuid();

    -- Orders
    v_order_id UUID := gen_random_uuid();
    v_cart_id UUID := gen_random_uuid();

BEGIN
    RAISE NOTICE '🚀 TEST DATA GENERATION STARTED AT %', v_now;

    -- =====================================================
    -- CLEANUP - TRUNCATE ALL TABLES
    -- =====================================================
    RAISE NOTICE '🧹 Cleaning database...';

    TRUNCATE TABLE stock_alerts CASCADE;
    TRUNCATE TABLE barcode_mappings CASCADE;
    TRUNCATE TABLE stock_adjustments CASCADE;
    TRUNCATE TABLE stock_movements CASCADE;
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

    RAISE NOTICE '✓ Database cleaned!';

    -- =====================================================
    -- PART 1: CORE DATA - ROLES & USERS
    -- =====================================================
    RAISE NOTICE '👤 Creating users and roles...';

    INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, name, description, business_id, user_type)
    VALUES
        (v_role_admin, 0, v_now, v_now, 'system', 'system', false, 'PLATFORM_ADMIN', 'Platform Administrator', NULL, 'PLATFORM_USER'),
        (v_role_business, 0, v_now, v_now, 'system', 'system', false, 'BUSINESS_OWNER', 'Business Owner', NULL, 'BUSINESS_USER'),
        (v_role_customer, 0, v_now, v_now, 'system', 'system', false, 'CUSTOMER', 'Customer', NULL, 'CUSTOMER');

    INSERT INTO subscription_plans (id, version, created_at, updated_at, created_by, updated_by, is_deleted, name, description, price, duration_days, status)
    VALUES
        (v_plan1, 0, v_now, v_now, 'system', 'system', false, 'Basic Plan', 'Basic features', 99.99, 30, 'PUBLIC'),
        (v_plan2, 0, v_now, v_now, 'system', 'system', false, 'Pro Plan', 'Advanced features', 299.99, 365, 'PUBLIC'),
        (v_plan3, 0, v_now, v_now, 'system', 'system', false, 'Enterprise', 'Enterprise features', 999.99, 365, 'PUBLIC');

    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES (v_admin_user, 0, v_now, v_now, 'system', 'system', false, 'admin@test.com', 'admin@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Admin', 'User', '+855 10 100 0001', v_photo1, 'PLATFORM_USER', 'ACTIVE', NULL, 'Platform Admin', 'Phnom Penh', 'System Administrator', v_now - INTERVAL '1 day', v_now, 1);

    INSERT INTO user_roles (user_id, role_id) VALUES (v_admin_user, v_role_admin);

    -- Business & Business Settings
    INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, owner_id, name, email, phone, address, description, status, is_subscription_active)
    VALUES (v_business_id, 0, v_now, v_now, 'system', 'system', false, v_admin_user, 'Test Cafe & Restaurant', 'business@test.com', '+855 23 999 9999', 'Phnom Penh, Cambodia', 'Full-featured test business', 'ACTIVE', true);

    INSERT INTO business_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, business_id, logo_url, banner_url, business_type, opening_time, closing_time, is_open_24_hours, working_days, timezone, currency, language, usd_to_khr_rate, contact_email, contact_phone, whatsapp_number, facebook_url, instagram_url, website_url, primary_color, secondary_color, email_notifications_enabled, sms_notifications_enabled, order_notifications_enabled, tax_rate, service_charge_percentage, min_order_amount, delivery_radius_km, estimated_delivery_time, terms_and_conditions, privacy_policy, refund_policy)
    VALUES (gen_random_uuid(), 0, v_now, v_now, 'system', 'system', false, v_business_id, v_photo1, v_photo2, 'RESTAURANT', '06:00', '23:00', false, 'MONDAY-SUNDAY', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, 'business@test.com', '+855 23 999 9999', '+855 10 100 0001', v_photo1, v_photo2, v_photo1, '#FF6B6B', '#FFE66D', true, true, true, 0.0, 10.0, 5.0, 25.0, '30-45 minutes', 'Premium guarantee', 'Data protection', 'Full refund');

    INSERT INTO subscriptions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, business_id, plan_id, start_date, end_date, auto_renew)
    VALUES (gen_random_uuid(), 0, v_now - INTERVAL '6 months', v_now, 'system', 'system', false, v_business_id, v_plan2, v_now - INTERVAL '6 months', v_now + INTERVAL '12 months', true);

    -- Business User & Customer User
    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES
        (v_business_user, 0, v_now, v_now, 'system', 'system', false, 'manager@test.com', 'manager@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Manager', 'User', '+855 10 200 0001', v_photo2, 'BUSINESS_USER', 'ACTIVE', v_business_id, 'Store Manager', 'Phnom Penh', 'Business Manager', v_now - INTERVAL '2 days', v_now, 1),
        (v_customer_user, 0, v_now, v_now, 'system', 'system', false, 'customer@test.com', 'customer@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Customer', 'User', '+855 10 300 0001', v_photo1, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh', 'Test Customer', v_now - INTERVAL '5 days', v_now, 1);

    INSERT INTO user_roles (user_id, role_id)
    SELECT v_business_user, v_role_business
    UNION ALL
    SELECT v_customer_user, v_role_customer;

    RAISE NOTICE '✓ Users and roles created!';

    -- =====================================================
    -- PART 2: PRODUCTS & SIZES WITH PROMOTIONS
    -- =====================================================
    RAISE NOTICE '📦 Creating products and inventory...';

    INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, business_id, name, image_url, status)
    VALUES
        (v_cat_food, 0, v_now, v_now, 'system', 'system', false, v_business_id, 'Food', v_photo1, 'ACTIVE'),
        (v_cat_beverages, 0, v_now, v_now, 'system', 'system', false, v_business_id, 'Beverages', v_photo2, 'ACTIVE'),
        (v_cat_snacks, 0, v_now, v_now, 'system', 'system', false, v_business_id, 'Snacks', v_photo1, 'ACTIVE');

    -- Products with ALL required fields
    INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, business_id, category_id, brand_id, name, description, main_image_url, price, has_sizes, minimum_stock_level, status, has_active_promotion, view_count, favorite_count, promotion_type, promotion_value, promotion_from_date, promotion_to_date, display_price, display_origin_price, display_promotion_type, display_promotion_value, display_promotion_from_date, display_promotion_to_date)
    VALUES
        (v_prod_coffee, 0, v_now, v_now, 'system', 'system', false, v_business_id, v_cat_beverages, NULL, 'Premium Coffee', 'Freshly brewed premium coffee', v_photo1, 3.50, true, 5, 'ACTIVE', false, 0, 0, NULL, NULL, NULL, NULL, 3.50, 3.50, NULL, NULL, NULL, NULL),
        (v_prod_tea, 0, v_now, v_now, 'system', 'system', false, v_business_id, v_cat_beverages, NULL, 'Green Tea', 'Fresh green tea', v_photo2, 2.50, true, 5, 'ACTIVE', false, 0, 0, NULL, NULL, NULL, NULL, 2.50, 2.50, NULL, NULL, NULL, NULL),
        (v_prod_juice, 0, v_now, v_now, 'system', 'system', false, v_business_id, v_cat_beverages, NULL, 'Fresh Orange Juice', 'Freshly squeezed', v_photo1, 4.00, true, 5, 'ACTIVE', false, 0, 0, NULL, NULL, NULL, NULL, 4.00, 4.00, NULL, NULL, NULL, NULL),
        (v_prod_burger, 0, v_now, v_now, 'system', 'system', false, v_business_id, v_cat_food, NULL, 'Classic Burger', 'Juicy beef burger', v_photo2, 6.50, false, 10, 'ACTIVE', false, 0, 0, NULL, NULL, NULL, NULL, 6.50, 6.50, NULL, NULL, NULL, NULL),
        (v_prod_fries, 0, v_now, v_now, 'system', 'system', false, v_business_id, v_cat_snacks, NULL, 'Crispy Fries', 'Golden crispy fries', v_photo1, 3.00, true, 10, 'ACTIVE', false, 0, 0, NULL, NULL, NULL, NULL, 3.00, 3.00, NULL, NULL, NULL, NULL);

    -- Product Sizes with promotions
    INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, product_id, name, price, minimum_stock_level, promotion_type, promotion_value, promotion_from_date, promotion_to_date)
    VALUES
        (v_size_coffee_s, 0, v_now, v_now, 'system', 'system', false, v_prod_coffee, 'Small', 3.50, 5, NULL, NULL, NULL, NULL),
        (v_size_coffee_m, 0, v_now, v_now, 'system', 'system', false, v_prod_coffee, 'Medium', 4.00, 5, NULL, NULL, NULL, NULL),
        (v_size_coffee_l, 0, v_now, v_now, 'system', 'system', false, v_prod_coffee, 'Large', 4.50, 5, NULL, NULL, NULL, NULL),
        (v_size_tea_s, 0, v_now, v_now, 'system', 'system', false, v_prod_tea, 'Small', 2.50, 5, NULL, NULL, NULL, NULL),
        (v_size_tea_l, 0, v_now, v_now, 'system', 'system', false, v_prod_tea, 'Large', 3.00, 5, NULL, NULL, NULL, NULL),
        (v_size_juice_s, 0, v_now, v_now, 'system', 'system', false, v_prod_juice, 'Small', 4.00, 5, NULL, NULL, NULL, NULL),
        (v_size_juice_l, 0, v_now, v_now, 'system', 'system', false, v_prod_juice, 'Large', 5.00, 5, NULL, NULL, NULL, NULL),
        (v_size_fries_s, 0, v_now, v_now, 'system', 'system', false, v_prod_fries, 'Small', 3.00, 10, NULL, NULL, NULL, NULL),
        (v_size_fries_l, 0, v_now, v_now, 'system', 'system', false, v_prod_fries, 'Large', 4.50, 10, NULL, NULL, NULL, NULL);

    -- Product Stock
    INSERT INTO product_stock (business_id, product_id, product_size_id, quantity_on_hand, quantity_reserved, quantity_available, price_in, price_out, cost_per_unit, date_in, expiry_date, barcode, sku, location, is_active, is_expired, track_inventory, created_at, updated_at, created_by, updated_by)
    VALUES
        (v_business_id, v_prod_coffee, v_size_coffee_s, 150, 10, 140, 1.50, 3.50, 1.50, v_now, v_now + INTERVAL '180 days', '1234567890001', 'SKU-COFFEE-S', 'Shelf A', true, false, true, v_now, v_now, 'system', 'system'),
        (v_business_id, v_prod_coffee, v_size_coffee_m, 200, 15, 185, 2.00, 4.00, 2.00, v_now, v_now + INTERVAL '180 days', '1234567890002', 'SKU-COFFEE-M', 'Shelf A', true, false, true, v_now, v_now, 'system', 'system'),
        (v_business_id, v_prod_coffee, v_size_coffee_l, 100, 5, 95, 2.50, 4.50, 2.50, v_now, v_now + INTERVAL '180 days', '1234567890003', 'SKU-COFFEE-L', 'Shelf A', true, false, true, v_now, v_now, 'system', 'system'),
        (v_business_id, v_prod_tea, v_size_tea_s, 300, 20, 280, 1.00, 2.50, 1.00, v_now, v_now + INTERVAL '180 days', '1234567890004', 'SKU-TEA-S', 'Shelf B', true, false, true, v_now, v_now, 'system', 'system'),
        (v_business_id, v_prod_juice, v_size_juice_s, 250, 30, 220, 2.00, 4.00, 2.00, v_now, v_now + INTERVAL '180 days', '1234567890006', 'SKU-JUICE-S', 'Shelf C', true, false, true, v_now, v_now, 'system', 'system'),
        (v_business_id, v_prod_burger, NULL, 75, 10, 65, 3.50, 6.50, 3.50, v_now, v_now + INTERVAL '90 days', NULL, 'SKU-BURGER', 'Cooler', true, false, true, v_now, v_now, 'system', 'system'),
        (v_business_id, v_prod_fries, v_size_fries_s, 400, 40, 360, 1.25, 3.00, 1.25, v_now, v_now + INTERVAL '90 days', '1234567890008', 'SKU-FRIES-S', 'Freezer', true, false, true, v_now, v_now, 'system', 'system');

    RAISE NOTICE '✓ Products and stock created!';

    -- =====================================================
    -- PART 3: STOCK OPERATIONS
    -- =====================================================
    RAISE NOTICE '📊 Creating stock movements...';

    INSERT INTO stock_movements (business_id, product_stock_id, movement_type, quantity_change, previous_quantity, new_quantity, reference_type, notes, initiated_by_name, cost_impact, unit_price, created_at, updated_at)
    SELECT
        v_business_id, ps.id,
        'STOCK_IN', 150, 0, 150,
        'INITIAL', 'Initial stock purchase', 'SYSTEM', 150 * ps.price_in, ps.price_in,
        v_now - INTERVAL '7 days', v_now - INTERVAL '7 days'
    FROM product_stock ps
    WHERE ps.business_id = v_business_id
    LIMIT 5;

    INSERT INTO stock_adjustments (business_id, product_stock_id, adjustment_type, previous_quantity, adjusted_quantity, quantity_difference, requires_approval, approved, approved_by, approved_at, reason, adjusted_by, adjusted_at, created_at, updated_at)
    SELECT
        v_business_id, ps.id,
        'STOCK_COUNT', ps.quantity_on_hand, ps.quantity_on_hand - 10, -10,
        false, true, v_business_user, v_now - INTERVAL '1 day',
        'Regular adjustment', v_business_user, v_now - INTERVAL '1 day', v_now - INTERVAL '1 day', v_now - INTERVAL '1 day'
    FROM product_stock ps
    WHERE ps.business_id = v_business_id
    LIMIT 3;

    RAISE NOTICE '✓ Stock operations created!';

    -- =====================================================
    -- PART 4: BARCODE & ALERTS
    -- =====================================================
    RAISE NOTICE '📱 Creating barcodes and alerts...';

    INSERT INTO barcode_mappings (business_id, product_stock_id, barcode, barcode_format, product_id, product_size_id, product_name, active, created_at, created_by)
    SELECT
        v_business_id, ps.id,
        ps.barcode, 'CODE128', ps.product_id, ps.product_size_id,
        COALESCE(p.name || ' - ' || psz.name, p.name),
        true, v_now, v_business_user
    FROM product_stock ps
    JOIN products p ON ps.product_id = p.id
    LEFT JOIN product_sizes psz ON ps.product_size_id = psz.id
    WHERE ps.business_id = v_business_id AND ps.barcode IS NOT NULL;

    INSERT INTO stock_alerts (business_id, product_stock_id, alert_type, product_id, product_size_id, product_name, current_quantity, threshold, expiry_date, days_until_expiry, status, notification_sent, notification_type, created_at, updated_at)
    SELECT
        v_business_id, ps.id,
        CASE WHEN ps.quantity_on_hand <= 50 THEN 'LOW_STOCK' ELSE 'NORMAL' END,
        ps.product_id, ps.product_size_id, p.name,
        ps.quantity_on_hand, 50,
        ps.expiry_date, EXTRACT(DAY FROM (ps.expiry_date - CURRENT_DATE))::INT,
        'ACTIVE', false, 'EMAIL',
        v_now, v_now
    FROM product_stock ps
    JOIN products p ON ps.product_id = p.id
    WHERE ps.business_id = v_business_id;

    RAISE NOTICE '✓ Barcodes and alerts created!';

    -- =====================================================
    -- PART 5: ORDERS & ITEMS
    -- =====================================================
    RAISE NOTICE '🛒 Creating orders...';

    INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, customer_id, business_id, status, total_amount, total_discount)
    VALUES (v_cart_id, 0, v_now, v_now, v_customer_user, v_customer_user, false, v_customer_user, v_business_id, 'ACTIVE', 0, 0);

    INSERT INTO orders (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted,
        business_id, customer_id, order_number, order_status, payment_status, payment_method,
        subtotal, discount_amount, delivery_fee, tax_amount, total_amount,
        customer_note, business_note, confirmed_at, completed_at
    )
    VALUES (
        v_order_id, 0, v_now - INTERVAL '2 days', v_now - INTERVAL '2 days', v_customer_user, v_customer_user, false,
        v_business_id, v_customer_user, 'ORD-' || TO_CHAR(v_now, 'YYYYMMDDHH24MISS'), 'PENDING', 'UNPAID', 'CASH',
        23.00, 2.50, 2.20, 0.00, 25.50,
        'Please ring the bell', NULL, NULL, NULL
    );

    -- Order Items
    INSERT INTO order_items (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted,
        order_id, product_id, product_size_id, product_name, product_image_url, size_name,
        current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date,
        quantity, total_price, special_instructions
    )
    VALUES
        (gen_random_uuid(), 0, v_now - INTERVAL '2 days', v_now - INTERVAL '2 days', v_customer_user, v_customer_user, false,
         v_order_id, v_prod_coffee, v_size_coffee_m, 'Premium Coffee', v_photo1, 'Medium',
         4.00, 4.00, 4.00, false, NULL, NULL, NULL, NULL,
         2, 8.00, 'Extra hot'),
        (gen_random_uuid(), 0, v_now - INTERVAL '2 days', v_now - INTERVAL '2 days', v_customer_user, v_customer_user, false,
         v_order_id, v_prod_burger, NULL, 'Classic Burger', v_photo2, 'Standard',
         6.50, 6.50, 6.50, false, NULL, NULL, NULL, NULL,
         1, 6.50, 'No onions'),
        (gen_random_uuid(), 0, v_now - INTERVAL '2 days', v_now - INTERVAL '2 days', v_customer_user, v_customer_user, false,
         v_order_id, v_prod_fries, v_size_fries_s, 'Crispy Fries', v_photo1, 'Small',
         3.00, 3.00, 3.00, false, NULL, NULL, NULL, NULL,
         2, 6.00, NULL);

    RAISE NOTICE '✓ Orders created!';

    -- =====================================================
    -- COMPLETION
    -- =====================================================
    RAISE NOTICE '✅ ALL TEST DATA GENERATED SUCCESSFULLY!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════' as verification;
SELECT 'COMPREHENSIVE TEST DATA SUMMARY' as section;
SELECT '═══════════════════════════════════════════════════════' as divider;

SELECT 'Users: ' || COUNT(*)::TEXT as stat FROM users;
SELECT 'Roles: ' || COUNT(*)::TEXT as stat FROM roles;
SELECT 'Businesses: ' || COUNT(*)::TEXT as stat FROM businesses;
SELECT 'Business Settings: ' || COUNT(*)::TEXT as stat FROM business_settings;
SELECT 'Subscriptions: ' || COUNT(*)::TEXT as stat FROM subscriptions;
SELECT 'Categories: ' || COUNT(*)::TEXT as stat FROM categories;
SELECT 'Products: ' || COUNT(*)::TEXT as stat FROM products;
SELECT 'Product Sizes: ' || COUNT(*)::TEXT as stat FROM product_sizes;
SELECT 'Product Stock: ' || COUNT(*)::TEXT as stat FROM product_stock;
SELECT 'Stock Movements: ' || COUNT(*)::TEXT as stat FROM stock_movements;
SELECT 'Stock Adjustments: ' || COUNT(*)::TEXT as stat FROM stock_adjustments;
SELECT 'Barcode Mappings: ' || COUNT(*)::TEXT as stat FROM barcode_mappings;
SELECT 'Stock Alerts: ' || COUNT(*)::TEXT as stat FROM stock_alerts;
SELECT 'Carts: ' || COUNT(*)::TEXT as stat FROM carts;
SELECT 'Orders: ' || COUNT(*)::TEXT as stat FROM orders;
SELECT 'Order Items: ' || COUNT(*)::TEXT as stat FROM order_items;

SELECT '═══════════════════════════════════════════════════════' as complete;
SELECT '✅ TEST DATA READY - All tables populated with verified data!' as final;
