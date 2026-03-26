-- ============================================================================
-- ENHANCED POS TEST DATA - REAL-WORLD SCENARIOS WITH AUDIT TRAILS
-- ============================================================================
-- This script adds realistic POS orders showing:
-- 1. Price overrides (admin changes item prices)
-- 2. Item-level discounts/promotions
-- 3. Order-level discounts (fixed and percentage)
-- 4. Complete audit trails in business notes
-- ============================================================================

DO $$ DECLARE
    t TIMESTAMPTZ := NOW();
    business_id UUID;
    business_user_id UUID;
    customer_user_id UUID;
    product1_id UUID;
    product2_id UUID;
    product3_id UUID;
    order_id_1 UUID;
    order_id_2 UUID;
    order_id_3 UUID;
    order_id_4 UUID;
    order_id_5 UUID;

BEGIN
    RAISE NOTICE '🚀 ENHANCED POS TEST DATA GENERATION STARTED!';

    -- Get IDs from existing test data
    SELECT id INTO business_id FROM businesses LIMIT 1;
    SELECT id INTO business_user_id FROM users WHERE user_identifier = 'phatmenghor20@gmail.com' LIMIT 1;
    SELECT id INTO customer_user_id FROM users WHERE user_identifier = 'phatmenghor21@gmail.com' LIMIT 1;
    SELECT id INTO product1_id FROM products LIMIT 1;
    SELECT id INTO product2_id FROM products LIMIT 1 OFFSET 1;
    SELECT id INTO product3_id FROM products LIMIT 1 OFFSET 2;

    -- =====================================================
    -- SCENARIO 1: PRICE OVERRIDE (Original $5 → Override $4.25)
    -- Business reduced price for employee purchase
    -- =====================================================
    RAISE NOTICE '📝 Creating Scenario 1: Price Override (Employee Discount)...';

    order_id_1 := gen_random_uuid();
    INSERT INTO orders (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        business_id, customer_id, order_number, order_status, source,
        delivery_address_snapshot, delivery_option_snapshot,
        subtotal, discount_amount, delivery_fee, tax_amount, total_amount,
        payment_method, payment_status, customer_note, business_note,
        confirmed_at, completed_at
    ) VALUES (
        order_id_1, 0, t - INTERVAL '2 days', t - INTERVAL '2 days', business_user_id, business_user_id,
        false, NULL, NULL, business_id, customer_user_id, 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-AUDIT001',
        'COMPLETED', 'POS',
        '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh"}',
        '{"name":"Pickup"}',
        8.50, 0.75, 0.00, 0.00, 7.75,
        'CASH', 'PAID', 'Employee coffee',
        'AUDIT TRAIL: Admin Override Applied | Original Price: $5.00 × 1 = $5.00 → Overridden to: $4.25 × 1 = $4.25 | Reason: Employee 15% discount | No Promotion Applied | Final Total: $7.75',
        t - INTERVAL '2 days', t - INTERVAL '2 days'
    );

    -- Add items for scenario 1
    INSERT INTO order_items (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        order_id, product_id, product_size_id, product_name, product_image_url, size_name,
        current_price, final_price, unit_price, quantity, total_price, has_promotion,
        promotion_type, promotion_value, special_instructions
    ) VALUES (
        gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
        order_id_1, product1_id, NULL, 'Cappuccino', 'https://example.com/cappuccino.jpg', 'Medium',
        4.25, 4.25, 4.25, 1, 4.25, false,
        NULL, NULL, 'Override: $5.00 → $4.25 (15% employee discount)'
    );
    INSERT INTO order_items (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        order_id, product_id, product_size_id, product_name, product_image_url, size_name,
        current_price, final_price, unit_price, quantity, total_price, has_promotion
    ) VALUES (
        gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
        order_id_1, product2_id, NULL, 'Pastry', 'https://example.com/pastry.jpg', 'Standard',
        4.25, 4.25, 4.25, 1, 4.25, false
    );

    -- =====================================================
    -- SCENARIO 2: PROMOTION APPLIED (Product has 20% OFF)
    -- Customer ordered during promotion period
    -- =====================================================
    RAISE NOTICE '📝 Creating Scenario 2: Promotion Applied...';

    order_id_2 := gen_random_uuid();
    INSERT INTO orders (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        business_id, customer_id, order_number, order_status, source,
        delivery_address_snapshot, delivery_option_snapshot,
        subtotal, discount_amount, delivery_fee, tax_amount, total_amount,
        payment_method, payment_status, customer_note, business_note,
        confirmed_at, completed_at
    ) VALUES (
        order_id_2, 0, t - INTERVAL '3 days', t - INTERVAL '3 days', business_user_id, business_user_id,
        false, NULL, NULL, business_id, customer_user_id, 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-AUDIT002',
        'COMPLETED', 'POS',
        '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh"}',
        '{"name":"Pickup"}',
        20.00, 4.00, 0.00, 0.00, 16.00,
        'CASH', 'PAID', 'Promotion special',
        'AUDIT TRAIL: Auto Promotion Applied | Original Price: $10.00 × 2 = $20.00 | Promotion: 20% OFF (PERCENTAGE) = $4.00 discount | Final Price After Promotion: $8.00 × 2 = $16.00 | No Admin Override',
        t - INTERVAL '3 days', t - INTERVAL '3 days'
    );

    -- Add items for scenario 2
    INSERT INTO order_items (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        order_id, product_id, product_size_id, product_name, product_image_url, size_name,
        current_price, final_price, unit_price, quantity, total_price, has_promotion,
        promotion_type, promotion_value, promotion_from_date, promotion_to_date
    ) VALUES (
        gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
        order_id_2, product1_id, NULL, 'Latte', 'https://example.com/latte.jpg', 'Large',
        10.00, 8.00, 8.00, 2, 16.00, true,
        'PERCENTAGE', 20.00, NOW() - INTERVAL '7 days', NOW() + INTERVAL '7 days'
    );

    -- =====================================================
    -- SCENARIO 3: PRICE OVERRIDE + PROMOTION (Stacked discounts)
    -- Admin set custom price first, then promotion also applied
    -- =====================================================
    RAISE NOTICE '📝 Creating Scenario 3: Price Override + Promotion (Stacked)...';

    order_id_3 := gen_random_uuid();
    INSERT INTO orders (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        business_id, customer_id, order_number, order_status, source,
        delivery_address_snapshot, delivery_option_snapshot,
        subtotal, discount_amount, delivery_fee, tax_amount, total_amount,
        payment_method, payment_status, customer_note, business_note,
        confirmed_at, completed_at
    ) VALUES (
        order_id_3, 0, t - INTERVAL '1 day', t - INTERVAL '1 day', business_user_id, business_user_id,
        false, NULL, NULL, business_id, customer_user_id, 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-AUDIT003',
        'COMPLETED', 'POS',
        '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh"}',
        '{"name":"Pickup"}',
        12.50, 3.75, 0.00, 0.00, 8.75,
        'CASH', 'PAID', 'Bulk order special',
        'AUDIT TRAIL: Admin Override + Promotion Applied | Original Price: $6.25 × 2 = $12.50 | Admin Override: $5.00/each → $4.00 total reduction | Auto Promotion Applied: 30% OFF items (PERCENTAGE) = $3.75 discount | Final Price: $3.13 × 2 = $6.25 → Order Total: $8.75 (after rounding)',
        t - INTERVAL '1 day', t - INTERVAL '1 day'
    );

    -- Add items for scenario 3
    INSERT INTO order_items (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        order_id, product_id, product_size_id, product_name, product_image_url, size_name,
        current_price, final_price, unit_price, quantity, total_price, has_promotion,
        promotion_type, promotion_value, special_instructions
    ) VALUES (
        gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
        order_id_3, product2_id, NULL, 'Espresso', 'https://example.com/espresso.jpg', 'Single',
        4.00, 2.80, 2.80, 2, 5.60, true,
        'PERCENTAGE', 30.00, 'Override: $6.25 → $5.00 | Promotion: 30% OFF'
    );
    INSERT INTO order_items (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        order_id, product_id, product_size_id, product_name, product_image_url, size_name,
        current_price, final_price, unit_price, quantity, total_price, has_promotion
    ) VALUES (
        gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
        order_id_3, product3_id, NULL, 'Muffin', 'https://example.com/muffin.jpg', 'Standard',
        2.50, 2.50, 2.50, 1, 2.50, false
    );

    -- =====================================================
    -- SCENARIO 4: ORDER-LEVEL FIXED DISCOUNT ($5 off entire order)
    -- VIP customer loyalty discount applied at checkout
    -- =====================================================
    RAISE NOTICE '📝 Creating Scenario 4: Order-Level Fixed Discount (VIP)...';

    order_id_4 := gen_random_uuid();
    INSERT INTO orders (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        business_id, customer_id, order_number, order_status, source,
        delivery_address_snapshot, delivery_option_snapshot,
        subtotal, discount_amount, delivery_fee, tax_amount, total_amount,
        payment_method, payment_status, customer_note, business_note,
        confirmed_at, completed_at
    ) VALUES (
        order_id_4, 0, NOW(), NOW(), business_user_id, business_user_id,
        false, NULL, NULL, business_id, customer_user_id, 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-AUDIT004',
        'COMPLETED', 'POS',
        '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh"}',
        '{"name":"Pickup"}',
        28.00, 5.00, 0.00, 0.00, 23.00,
        'CASH', 'PAID', 'Regular customer here',
        'AUDIT TRAIL: Order-Level Discount Applied | Subtotal Before Discount: $28.00 | Order-Level Discount: FIXED $5.00 (Type: fixed_amount) | Reason: VIP Customer Loyalty Discount | Final Total: $23.00 | Items: No individual overrides',
        NOW(), NOW()
    );

    -- Add items for scenario 4
    INSERT INTO order_items (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        order_id, product_id, product_size_id, product_name, product_image_url, size_name,
        current_price, final_price, unit_price, quantity, total_price, has_promotion
    ) VALUES
        (gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
         order_id_4, product1_id, NULL, 'Cappuccino', 'https://example.com/cappuccino.jpg', 'Medium',
         5.50, 5.50, 5.50, 2, 11.00, false),
        (gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
         order_id_4, product2_id, NULL, 'Croissant', 'https://example.com/croissant.jpg', 'Standard',
         4.00, 4.00, 4.00, 2, 8.00, false),
        (gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
         order_id_4, product3_id, NULL, 'Tea', 'https://example.com/tea.jpg', 'Medium',
         3.50, 3.50, 3.50, 1, 3.50, false),
        (gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
         order_id_4, product1_id, NULL, 'Cake', 'https://example.com/cake.jpg', 'Slice',
         5.50, 5.50, 5.50, 1, 5.50, false);

    -- =====================================================
    -- SCENARIO 5: ORDER-LEVEL PERCENTAGE DISCOUNT (15% off entire order)
    -- Bulk order discount - customer ordered 5+ items
    -- =====================================================
    RAISE NOTICE '📝 Creating Scenario 5: Order-Level Percentage Discount (Bulk)...';

    order_id_5 := gen_random_uuid();
    INSERT INTO orders (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        business_id, customer_id, order_number, order_status, source,
        delivery_address_snapshot, delivery_option_snapshot,
        subtotal, discount_amount, delivery_fee, tax_amount, total_amount,
        payment_method, payment_status, customer_note, business_note,
        confirmed_at, completed_at
    ) VALUES (
        order_id_5, 0, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours', business_user_id, business_user_id,
        false, NULL, NULL, business_id, customer_user_id, 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-AUDIT005',
        'COMPLETED', 'POS',
        '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh"}',
        '{"name":"Pickup"}',
        50.00, 7.50, 0.00, 0.00, 42.50,
        'CASH', 'PAID', 'Office catering order',
        'AUDIT TRAIL: Order-Level Percentage Discount Applied | Subtotal Before Discount: $50.00 | Order-Level Discount: 15% (Type: percentage) = $7.50 discount | Reason: Bulk Order Discount (5+ items) | Final Total: $42.50 | Items: Standard pricing',
        NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'
    );

    -- Add items for scenario 5
    INSERT INTO order_items (
        id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
        order_id, product_id, product_size_id, product_name, product_image_url, size_name,
        current_price, final_price, unit_price, quantity, total_price, has_promotion
    ) VALUES
        (gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
         order_id_5, product1_id, NULL, 'Cappuccino', 'https://example.com/cappuccino.jpg', 'Medium',
         6.00, 6.00, 6.00, 3, 18.00, false),
        (gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
         order_id_5, product2_id, NULL, 'Latte', 'https://example.com/latte.jpg', 'Large',
         6.50, 6.50, 6.50, 2, 13.00, false),
        (gen_random_uuid(), 0, t, t, business_user_id, business_user_id, false, NULL, NULL,
         order_id_5, product3_id, NULL, 'Biscuits Box', 'https://example.com/biscuits.jpg', 'Box',
         9.50, 9.50, 9.50, 2, 19.00, false);

    RAISE NOTICE '✅ Enhanced POS Test Data Created Successfully!';
    RAISE NOTICE '📊 Added 5 Real-World Scenarios:';
    RAISE NOTICE '   1. Price Override (Employee 15%% discount)';
    RAISE NOTICE '   2. Auto Promotion (20%% OFF)';
    RAISE NOTICE '   3. Price Override + Promotion (Stacked)';
    RAISE NOTICE '   4. Order-Level Fixed Discount ($5 VIP)';
    RAISE NOTICE '   5. Order-Level Percentage Discount (15%% Bulk)';
    RAISE NOTICE '✅ All orders include complete audit trails in business_note field!';

END $$;

-- Verification queries
SELECT '📋 VERIFICATION - Enhanced POS Orders:' as section;
SELECT COUNT(*) as "Total POS Orders",
       COUNT(DISTINCT customer_id) as "Unique Customers",
       SUM(discount_amount) as "Total Discounts Applied",
       SUM(total_amount) as "Total Revenue"
FROM orders WHERE source = 'POS' AND business_note LIKE '%AUDIT TRAIL%';

SELECT '📝 AUDIT TRAIL EXAMPLES:' as section;
SELECT order_number, customer_note, business_note
FROM orders
WHERE source = 'POS' AND business_note LIKE '%AUDIT TRAIL%'
ORDER BY created_at DESC LIMIT 5;

SELECT '✅ Setup Complete - Enhanced test data ready for review!' as status;
