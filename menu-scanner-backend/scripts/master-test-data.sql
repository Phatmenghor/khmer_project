-- ============================================================================
-- MASTER TEST DATA SCRIPT - ALL-IN-ONE
-- ============================================================================
-- Complete end-to-end setup including:
-- - Stock management tables
-- - Core business data (users, roles, products)
-- - Full inventory management
-- - Orders and transactions
--
-- Run with: psql -h localhost -U postgres -d emenu_db -f master-test-data.sql
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET synchronous_commit TO OFF;

DO $$ DECLARE
    t TIMESTAMPTZ := NOW();
    photo1 TEXT := 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop';
    photo2 TEXT := 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop';

    -- Key IDs
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

    -- Product and category variables
    category_food UUID := gen_random_uuid();
    category_beverages UUID := gen_random_uuid();
    category_snacks UUID := gen_random_uuid();

    -- Sample product IDs
    product_coffee UUID := gen_random_uuid();
    product_tea UUID := gen_random_uuid();
    product_juice UUID := gen_random_uuid();
    product_burger UUID := gen_random_uuid();
    product_fries UUID := gen_random_uuid();

    product_size_small UUID := gen_random_uuid();
    product_size_medium UUID := gen_random_uuid();
    product_size_large UUID := gen_random_uuid();

    -- Order variables
    order_id UUID := gen_random_uuid();
    cart_id UUID := gen_random_uuid();

BEGIN
    RAISE NOTICE '🚀 MASTER TEST DATA GENERATION STARTED!';

    -- =====================================================
    -- PART 1: CREATE STOCK MANAGEMENT TABLES
    -- =====================================================
    RAISE NOTICE '📋 Creating stock management tables...';

    -- Create extensions
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- TABLE 1: PRODUCT_STOCK - Core inventory
    CREATE TABLE IF NOT EXISTS product_stock (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        product_size_id UUID REFERENCES product_sizes(id) ON DELETE CASCADE,

        -- Stock Quantities
        quantity_on_hand INT NOT NULL DEFAULT 0,
        quantity_reserved INT NOT NULL DEFAULT 0,
        quantity_available INT NOT NULL DEFAULT 0,

        -- Stock Thresholds
        minimum_stock_level INT NOT NULL DEFAULT 5,

        -- Pricing (Cost vs Selling)
        price_in DECIMAL(19, 4) NOT NULL DEFAULT 0.00,
        price_out DECIMAL(19, 4) NOT NULL DEFAULT 0.00,
        cost_per_unit DECIMAL(19, 4) NOT NULL DEFAULT 0.00,

        -- Dates & Tracking
        date_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_out TIMESTAMP,
        expiry_date DATE,

        -- Identifiers
        barcode VARCHAR(255) UNIQUE,
        sku VARCHAR(255),
        location VARCHAR(255),

        -- Status Flags
        is_active BOOLEAN NOT NULL DEFAULT true,
        is_expired BOOLEAN NOT NULL DEFAULT false,
        track_inventory BOOLEAN NOT NULL DEFAULT true,

        -- Audit
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,
        updated_by UUID,

        -- Constraints
        CONSTRAINT product_stock_unique_variant
            UNIQUE (product_id, product_size_id, business_id),
        CONSTRAINT price_validation
            CHECK (price_in >= 0 AND price_out >= 0),
        CONSTRAINT quantity_reserved_validation
            CHECK (quantity_reserved <= (quantity_on_hand + 999))
    );

    CREATE INDEX IF NOT EXISTS idx_product_stock_business_id ON product_stock(business_id);
    CREATE INDEX IF NOT EXISTS idx_product_stock_product_id ON product_stock(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_stock_barcode ON product_stock(barcode);
    CREATE INDEX IF NOT EXISTS idx_product_stock_is_expired ON product_stock(is_expired);

    -- TABLE 2: STOCK_MOVEMENTS - Audit trail
    CREATE TABLE IF NOT EXISTS stock_movements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        product_stock_id UUID NOT NULL REFERENCES product_stock(id) ON DELETE CASCADE,

        -- Movement Details
        movement_type VARCHAR(50) NOT NULL,
        quantity_change INT NOT NULL,
        previous_quantity INT NOT NULL,
        new_quantity INT NOT NULL,

        -- Reference Tracking
        reference_type VARCHAR(50),
        reference_id UUID,
        order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
        order_item_id UUID,

        -- Notes & People
        notes TEXT,
        initiated_by UUID,
        initiated_by_name VARCHAR(255),
        approved_by UUID,

        -- Financial Impact
        cost_impact DECIMAL(19, 4) DEFAULT 0.00,
        unit_price DECIMAL(19, 4) DEFAULT 0.00,

        -- Audit
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_stock_movements_business ON stock_movements(business_id);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_product_stock ON stock_movements(product_stock_id);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);

    -- TABLE 3: STOCK_ADJUSTMENTS - Manual adjustments
    CREATE TABLE IF NOT EXISTS stock_adjustments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        product_stock_id UUID NOT NULL REFERENCES product_stock(id) ON DELETE CASCADE,

        -- Adjustment Details
        adjustment_type VARCHAR(50) NOT NULL,
        previous_quantity INT NOT NULL,
        adjusted_quantity INT NOT NULL,
        quantity_difference INT NOT NULL,

        -- Approval Workflow
        requires_approval BOOLEAN NOT NULL DEFAULT false,
        approved BOOLEAN NOT NULL DEFAULT false,
        approved_by UUID,
        approved_at TIMESTAMP,

        -- Reason & Notes
        reason VARCHAR(255) NOT NULL,
        detail_notes TEXT,

        -- Audit
        adjusted_by UUID NOT NULL,
        adjusted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_stock_adjustments_business ON stock_adjustments(business_id);

    -- TABLE 4: STOCK_ALERTS - Alert management
    CREATE TABLE IF NOT EXISTS stock_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        product_stock_id UUID NOT NULL REFERENCES product_stock(id) ON DELETE CASCADE,

        -- Alert Details
        alert_type VARCHAR(50) NOT NULL,
        product_id UUID NOT NULL,
        product_size_id UUID,
        product_name VARCHAR(255),
        current_quantity INT,
        threshold INT,

        -- Expiry Info
        expiry_date DATE,
        days_until_expiry INT,

        -- Status & Handling
        status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
        acknowledged_by UUID,
        acknowledged_at TIMESTAMP,
        resolved_at TIMESTAMP,

        -- Notification Status
        notification_sent BOOLEAN NOT NULL DEFAULT false,
        notification_type VARCHAR(50) DEFAULT 'NONE',

        -- Audit
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_stock_alerts_business ON stock_alerts(business_id);
    CREATE INDEX IF NOT EXISTS idx_stock_alerts_status ON stock_alerts(status);

    -- TABLE 5: BARCODE_MAPPINGS - Scanner support
    CREATE TABLE IF NOT EXISTS barcode_mappings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        product_stock_id UUID NOT NULL REFERENCES product_stock(id) ON DELETE CASCADE,

        -- Barcode Details
        barcode VARCHAR(255) NOT NULL UNIQUE,
        barcode_format VARCHAR(50),
        barcode_image_url VARCHAR(500),

        -- Product Info (snapshot)
        product_id UUID NOT NULL,
        product_size_id UUID,
        product_name VARCHAR(255),

        -- Status
        active BOOLEAN NOT NULL DEFAULT true,

        -- Audit
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by UUID,

        CONSTRAINT barcode_unique_per_business
            UNIQUE (business_id, barcode)
    );

    CREATE INDEX IF NOT EXISTS idx_barcode_mappings_business ON barcode_mappings(business_id);
    CREATE INDEX IF NOT EXISTS idx_barcode_mappings_barcode ON barcode_mappings(barcode);

    -- Update existing tables with stock columns
    ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS stock_status VARCHAR(50) DEFAULT 'STOCK_NOT_CHECKED';
    ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS stock_notes TEXT;
    ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS require_stock_check BOOLEAN DEFAULT true;

    ALTER TABLE IF EXISTS order_items ADD COLUMN IF NOT EXISTS quantity_reserved INT DEFAULT 0;
    ALTER TABLE IF EXISTS order_items ADD COLUMN IF NOT EXISTS quantity_fulfilled INT DEFAULT 0;
    ALTER TABLE IF EXISTS order_items ADD COLUMN IF NOT EXISTS stock_check_passed BOOLEAN DEFAULT false;

    ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT true;
    ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS requires_expiry BOOLEAN DEFAULT false;
    ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS has_barcodes BOOLEAN DEFAULT false;
    ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS default_minimum_stock INT DEFAULT 5;

    ALTER TABLE IF EXISTS product_sizes ADD COLUMN IF NOT EXISTS barcode VARCHAR(255);
    ALTER TABLE IF EXISTS product_sizes ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN;

    RAISE NOTICE '✓ Stock tables created successfully!';

    -- =====================================================
    -- PART 2: CLEANUP AND INITIALIZE DATA
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
    TRUNCATE TABLE exchange_rates CASCADE;
    TRUNCATE TABLE reference_counters CASCADE;

    RAISE NOTICE '✓ Database cleaned!';

    -- =====================================================
    -- PART 3: CREATE CORE DATA
    -- =====================================================
    RAISE NOTICE '👤 Creating users and roles...';

    INSERT INTO roles (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, business_id, user_type)
    VALUES
        (role_admin, 0, t, t, 'system', 'system', false, NULL, NULL, 'PLATFORM_ADMIN', 'Platform Administrator', NULL, 'PLATFORM_USER'),
        (role_business, 0, t, t, 'system', 'system', false, NULL, NULL, 'BUSINESS_OWNER', 'Business Owner', NULL, 'BUSINESS_USER'),
        (role_customer, 0, t, t, 'system', 'system', false, NULL, NULL, 'CUSTOMER', 'Customer', NULL, 'CUSTOMER');

    INSERT INTO subscription_plans (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, name, description, price, duration_days, status)
    VALUES
        (plan1, 0, t, t, 'system', 'system', false, NULL, NULL, 'Basic Plan', 'Basic features', 99.99, 30, 'PUBLIC'),
        (plan2, 0, t, t, 'system', 'system', false, NULL, NULL, 'Pro Plan', 'Advanced features', 299.99, 365, 'PUBLIC'),
        (plan3, 0, t, t, 'system', 'system', false, NULL, NULL, 'Enterprise', 'Enterprise features', 999.99, 365, 'PUBLIC');

    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES (platform_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'admin@test.com', 'admin@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Admin', 'User', '+855 10 100 0001', photo1, 'PLATFORM_USER', 'ACTIVE', NULL, 'Platform Admin', 'Phnom Penh', 'System Administrator', t - INTERVAL '1 day', t, 1);

    INSERT INTO user_roles (user_id, role_id) VALUES (platform_user_id, role_admin);

    -- Business
    INSERT INTO businesses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, owner_id, name, email, phone, address, description, status, is_subscription_active)
    VALUES (key_business_id, 0, t, t, 'system', 'system', false, NULL, NULL, platform_user_id, 'Test Cafe & Restaurant', 'business@test.com', '+855 23 999 9999', 'Phnom Penh, Cambodia', 'Full-featured test business with complete inventory', 'ACTIVE', true);

    INSERT INTO business_settings (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, logo_url, banner_url, business_type, opening_time, closing_time, is_open_24_hours, working_days, timezone, currency, language, usd_to_khr_rate, contact_email, contact_phone, whatsapp_number, facebook_url, instagram_url, website_url, primary_color, secondary_color, email_notifications_enabled, sms_notifications_enabled, order_notifications_enabled, tax_rate, service_charge_percentage, min_order_amount, delivery_radius_km, estimated_delivery_time, terms_and_conditions, privacy_policy, refund_policy)
    VALUES (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, photo1, photo2, 'RESTAURANT', '06:00', '23:00', false, 'MONDAY-SUNDAY', 'Asia/Phnom_Penh', 'USD', 'en', 4100.0, 'business@test.com', '+855 23 999 9999', '+855 10 100 0001', photo1, photo2, photo1, '#FF6B6B', '#FFE66D', true, true, true, 0.0, 10.0, 5.0, 25.0, '30-45 minutes', 'Premium guarantee', 'Data protection', 'Full refund');

    INSERT INTO subscriptions (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, plan_id, start_date, end_date, auto_renew)
    VALUES (gen_random_uuid(), 0, t - INTERVAL '6 months', t, 'system', 'system', false, NULL, NULL, key_business_id, plan2, t - INTERVAL '6 months', t + INTERVAL '12 months', true);

    INSERT INTO users (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, last_login_at, last_active_at, active_sessions_count)
    VALUES
        (business_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'manager@test.com', 'manager@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Manager', 'User', '+855 10 200 0001', photo2, 'BUSINESS_USER', 'ACTIVE', key_business_id, 'Store Manager', 'Phnom Penh', 'Business Manager', t - INTERVAL '2 days', t, 1),
        (customer_user_id, 0, t, t, 'system', 'system', false, NULL, NULL, 'customer@test.com', 'customer@test.com', '$2a$12$hgZ6m7pwOA8AYv.r7YbuN.Yi8gHh.5NWqpEd2Jn6sgCRyu29a1DEK', 'Customer', 'User', '+855 10 300 0001', photo1, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh', 'Test Customer', t - INTERVAL '5 days', t, 1);

    INSERT INTO user_roles (user_id, role_id)
    SELECT business_user_id, role_business
    UNION ALL
    SELECT customer_user_id, role_customer;

    RAISE NOTICE '✓ Users and roles created!';

    -- =====================================================
    -- PART 4: CREATE PRODUCTS AND INVENTORY
    -- =====================================================
    RAISE NOTICE '📦 Creating products and inventory...';

    INSERT INTO categories (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, name, description, icon_url, image_url, display_order, is_active)
    VALUES
        (category_food, 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Food', 'Delicious food items', NULL, photo1, 1, true),
        (category_beverages, 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Beverages', 'Drinks and beverages', NULL, photo2, 2, true),
        (category_snacks, 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, 'Snacks', 'Light snacks', NULL, photo1, 3, true);

    INSERT INTO products (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, business_id, category_id, brand_id, name, description, image_url, price, discount_percentage, discount_price, is_active, is_top_seller, has_sizes, track_inventory, requires_expiry, has_barcodes, default_minimum_stock, is_available)
    VALUES
        (product_coffee, 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, category_beverages, NULL, 'Premium Coffee', 'Freshly brewed premium coffee', photo1, 3.50, 0, 3.50, true, true, true, true, false, true, 5, true),
        (product_tea, 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, category_beverages, NULL, 'Green Tea', 'Fresh green tea', photo2, 2.50, 10, 2.25, true, false, true, true, false, true, 5, true),
        (product_juice, 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, category_beverages, NULL, 'Fresh Orange Juice', 'Freshly squeezed orange juice', photo1, 4.00, 0, 4.00, true, true, true, true, false, true, 5, true),
        (product_burger, 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, category_food, NULL, 'Classic Burger', 'Juicy beef burger with lettuce and tomato', photo2, 6.50, 15, 5.53, true, true, false, true, false, false, 10, true),
        (product_fries, 0, t, t, 'system', 'system', false, NULL, NULL, key_business_id, category_snacks, NULL, 'Crispy Fries', 'Golden crispy french fries', photo1, 3.00, 0, 3.00, true, false, true, true, false, true, 10, true);

    INSERT INTO product_sizes (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, product_id, business_id, name, description, size_value, unit, price, barcode, image_url, display_order, is_active, track_inventory)
    VALUES
        (product_size_small, 0, t, t, 'system', 'system', false, NULL, NULL, product_coffee, key_business_id, 'Small', 'Small coffee cup', '8', 'oz', 3.50, '1234567890001', photo1, 1, true, true),
        (product_size_medium, 0, t, t, 'system', 'system', false, NULL, NULL, product_coffee, key_business_id, 'Medium', 'Medium coffee cup', '12', 'oz', 4.00, '1234567890002', photo2, 2, true, true),
        (product_size_large, 0, t, t, 'system', 'system', false, NULL, NULL, product_coffee, key_business_id, 'Large', 'Large coffee cup', '16', 'oz', 4.50, '1234567890003', photo1, 3, true, true),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, product_tea, key_business_id, 'Small', 'Small tea cup', '8', 'oz', 2.50, '1234567890004', photo2, 1, true, true),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, product_tea, key_business_id, 'Large', 'Large tea cup', '16', 'oz', 3.00, '1234567890005', photo1, 2, true, true),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, product_juice, key_business_id, 'Small', 'Small juice', '8', 'oz', 4.00, '1234567890006', photo2, 1, true, true),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, product_juice, key_business_id, 'Large', 'Large juice', '16', 'oz', 5.00, '1234567890007', photo1, 2, true, true),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, product_fries, key_business_id, 'Small', 'Small fries', 'S', 'portion', 3.00, '1234567890008', photo2, 1, true, true),
        (gen_random_uuid(), 0, t, t, 'system', 'system', false, NULL, NULL, product_fries, key_business_id, 'Large', 'Large fries', 'L', 'portion', 4.50, '1234567890009', photo1, 2, true, true);

    INSERT INTO product_stock (
        id, business_id, product_id, product_size_id,
        quantity_on_hand, quantity_reserved, quantity_available,
        minimum_stock_level, price_in, price_out, cost_per_unit,
        date_in, expiry_date, barcode, sku, location,
        is_active, is_expired, track_inventory,
        created_at, updated_at, created_by, updated_by
    )
    SELECT
        gen_random_uuid(), key_business_id, product_coffee, product_size_small,
        150, 10, 140, 5, 1.50, 3.50, 1.50,
        t, t + INTERVAL '180 days', '1234567890001', 'SKU-COFFEE-S', 'Shelf A',
        true, false, true, t, t, 'system', 'system'
    UNION ALL
    SELECT
        gen_random_uuid(), key_business_id, product_coffee, product_size_medium,
        200, 15, 185, 5, 2.00, 4.00, 2.00,
        t, t + INTERVAL '180 days', '1234567890002', 'SKU-COFFEE-M', 'Shelf A',
        true, false, true, t, t, 'system', 'system'
    UNION ALL
    SELECT
        gen_random_uuid(), key_business_id, product_coffee, product_size_large,
        100, 5, 95, 5, 2.50, 4.50, 2.50,
        t, t + INTERVAL '180 days', '1234567890003', 'SKU-COFFEE-L', 'Shelf A',
        true, false, true, t, t, 'system', 'system'
    UNION ALL
    SELECT
        gen_random_uuid(), key_business_id, product_tea, (SELECT id FROM product_sizes WHERE product_id = product_tea LIMIT 1),
        300, 20, 280, 5, 1.00, 2.50, 1.00,
        t, t + INTERVAL '180 days', '1234567890004', 'SKU-TEA-S', 'Shelf B',
        true, false, true, t, t, 'system', 'system'
    UNION ALL
    SELECT
        gen_random_uuid(), key_business_id, product_juice, (SELECT id FROM product_sizes WHERE product_id = product_juice LIMIT 1),
        250, 30, 220, 5, 2.00, 4.00, 2.00,
        t, t + INTERVAL '180 days', '1234567890006', 'SKU-JUICE-S', 'Shelf C',
        true, false, true, t, t, 'system', 'system'
    UNION ALL
    SELECT
        gen_random_uuid(), key_business_id, product_burger, NULL,
        75, 10, 65, 10, 3.50, 6.50, 3.50,
        t, t + INTERVAL '90 days', NULL, 'SKU-BURGER', 'Cooler',
        true, false, true, t, t, 'system', 'system'
    UNION ALL
    SELECT
        gen_random_uuid(), key_business_id, product_fries, (SELECT id FROM product_sizes WHERE product_id = product_fries LIMIT 1),
        400, 40, 360, 10, 1.25, 3.00, 1.25,
        t, t + INTERVAL '90 days', '1234567890008', 'SKU-FRIES-S', 'Freezer',
        true, false, true, t, t, 'system', 'system';

    RAISE NOTICE '✓ Products and stock initialized!';

    -- =====================================================
    -- PART 5: CREATE STOCK MOVEMENTS AND ADJUSTMENTS
    -- =====================================================
    RAISE NOTICE '📊 Creating stock movements and adjustments...';

    INSERT INTO stock_movements (
        id, business_id, product_stock_id,
        movement_type, quantity_change, previous_quantity, new_quantity,
        reference_type, reference_id, notes, initiated_by_name, cost_impact, unit_price,
        created_at, updated_at
    )
    SELECT
        gen_random_uuid(), key_business_id, ps.id,
        'STOCK_IN', 150, 0, 150,
        'INITIAL', NULL, 'Initial stock purchase', 'SYSTEM', 150 * ps.price_in, ps.price_in,
        t - INTERVAL '7 days', t - INTERVAL '7 days'
    FROM product_stock ps
    WHERE ps.business_id = key_business_id
    LIMIT 10;

    INSERT INTO stock_adjustments (
        id, business_id, product_stock_id,
        adjustment_type, previous_quantity, adjusted_quantity, quantity_difference,
        requires_approval, approved, approved_by, approved_at,
        reason, detail_notes,
        adjusted_by, adjusted_at, created_at, updated_at
    )
    SELECT
        gen_random_uuid(), key_business_id, ps.id,
        'STOCK_COUNT', ps.quantity_on_hand, ps.quantity_on_hand - 10, -10,
        false, true, business_user_id, t - INTERVAL '1 day',
        'Regular stock count adjustment', 'Damaged items removed',
        business_user_id, t - INTERVAL '1 day', t - INTERVAL '1 day', t - INTERVAL '1 day'
    FROM product_stock ps
    WHERE ps.business_id = key_business_id
    LIMIT 5;

    RAISE NOTICE '✓ Stock movements created!';

    -- =====================================================
    -- PART 6: CREATE BARCODE MAPPINGS AND ALERTS
    -- =====================================================
    RAISE NOTICE '📱 Creating barcode mappings and alerts...';

    INSERT INTO barcode_mappings (
        id, business_id, product_stock_id,
        barcode, barcode_format, product_id, product_size_id, product_name,
        active, created_at, created_by
    )
    SELECT
        gen_random_uuid(), key_business_id, ps.id,
        ps.barcode, 'CODE128', ps.product_id, ps.product_size_id,
        COALESCE(p.name || ' - ' || psz.name, p.name),
        true, t, business_user_id
    FROM product_stock ps
    JOIN products p ON ps.product_id = p.id
    LEFT JOIN product_sizes psz ON ps.product_size_id = psz.id
    WHERE ps.business_id = key_business_id AND ps.barcode IS NOT NULL;

    INSERT INTO stock_alerts (
        id, business_id, product_stock_id,
        alert_type, product_id, product_size_id, product_name,
        current_quantity, threshold, expiry_date, days_until_expiry,
        status, acknowledged_by, acknowledged_at, resolved_at,
        notification_sent, notification_type,
        created_at, updated_at
    )
    SELECT
        gen_random_uuid(), key_business_id, ps.id,
        CASE WHEN ps.quantity_on_hand <= ps.minimum_stock_level THEN 'LOW_STOCK' ELSE 'NORMAL' END,
        ps.product_id, ps.product_size_id, p.name,
        ps.quantity_on_hand, ps.minimum_stock_level,
        ps.expiry_date, EXTRACT(DAY FROM (ps.expiry_date - CURRENT_DATE))::INT,
        'ACTIVE', NULL, NULL, NULL,
        false, 'EMAIL',
        t, t
    FROM product_stock ps
    JOIN products p ON ps.product_id = p.id
    WHERE ps.business_id = key_business_id AND ps.quantity_on_hand <= 100;

    RAISE NOTICE '✓ Barcode mappings and alerts created!';

    -- =====================================================
    -- PART 7: CREATE ORDERS
    -- =====================================================
    RAISE NOTICE '🛒 Creating orders...';

    INSERT INTO carts (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, customer_id, business_id, status, total_amount, total_discount)
    VALUES (cart_id, 0, t, t, customer_user_id, customer_user_id, false, NULL, NULL, customer_user_id, key_business_id, 'ACTIVE', 0, 0);

    INSERT INTO orders (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        business_id, customer_id, order_code, order_status, payment_status, delivery_status,
        total_amount, subtotal_amount, discount_amount, tax_amount, service_charge_amount, delivery_fee,
        delivery_type, delivery_address, delivery_date, delivery_time,
        customer_notes, special_instructions, estimated_delivery_time,
        stock_status, stock_notes, require_stock_check
    )
    VALUES (
        order_id, 0, t - INTERVAL '2 days', t - INTERVAL '2 days', customer_user_id, customer_user_id, false, NULL, NULL,
        key_business_id, customer_user_id, 'ORD-' || TO_CHAR(t, 'YYYYMMDDHH24MISS'), 'PENDING', 'PENDING', 'PENDING',
        25.50, 23.00, 2.50, 0, 2.30, 2.20,
        'DELIVERY', 'Phnom Penh, Cambodia', t::DATE, '14:30',
        'Please ring the bell', 'Extra napkins please', '45 minutes',
        'STOCK_AVAILABLE', 'All items in stock', true
    );

    INSERT INTO order_items (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        order_id, product_id, product_size_id, business_id, quantity, unit_price, total_price,
        special_instructions, quantity_reserved, quantity_fulfilled, stock_check_passed
    )
    VALUES
        (gen_random_uuid(), 0, t - INTERVAL '2 days', t - INTERVAL '2 days', customer_user_id, customer_user_id, false, NULL, NULL,
         order_id, product_coffee, product_size_medium, key_business_id, 2, 4.00, 8.00,
         'Extra hot', 2, 2, true),
        (gen_random_uuid(), 0, t - INTERVAL '2 days', t - INTERVAL '2 days', customer_user_id, customer_user_id, false, NULL, NULL,
         order_id, product_burger, NULL, key_business_id, 1, 6.50, 6.50,
         'No onions', 1, 1, true),
        (gen_random_uuid(), 0, t - INTERVAL '2 days', t - INTERVAL '2 days', customer_user_id, customer_user_id, false, NULL, NULL,
         order_id, product_fries, (SELECT id FROM product_sizes WHERE product_id = product_fries LIMIT 1), key_business_id, 2, 3.00, 6.00,
         NULL, 2, 2, true);

    RAISE NOTICE '✓ Orders created!';

    -- =====================================================
    -- FINAL SUMMARY
    -- =====================================================
    RAISE NOTICE '✅ MASTER TEST DATA GENERATION COMPLETED!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT '═══════════════════════════════════════════════════════' as verification;
SELECT 'TEST DATA SUMMARY' as title;
SELECT '═══════════════════════════════════════════════════════' as divider;

SELECT 'Total Users: ' || COUNT(*)::TEXT FROM users;
SELECT 'Total Products: ' || COUNT(*)::TEXT FROM products;
SELECT 'Total Product Sizes: ' || COUNT(*)::TEXT FROM product_sizes;
SELECT 'Total Stock Records: ' || COUNT(*)::TEXT FROM product_stock;
SELECT 'Total Stock Movements: ' || COUNT(*)::TEXT FROM stock_movements;
SELECT 'Total Stock Adjustments: ' || COUNT(*)::TEXT FROM stock_adjustments;
SELECT 'Total Barcode Mappings: ' || COUNT(*)::TEXT FROM barcode_mappings;
SELECT 'Total Stock Alerts: ' || COUNT(*)::TEXT FROM stock_alerts;
SELECT 'Total Orders: ' || COUNT(*)::TEXT FROM orders;
SELECT 'Total Order Items: ' || COUNT(*)::TEXT FROM order_items;

SELECT '═══════════════════════════════════════════════════════' as complete;
SELECT '✅ All test data has been successfully created!' as final_message;
