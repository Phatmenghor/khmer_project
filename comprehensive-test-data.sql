-- ============================================================================
-- COMPREHENSIVE TEST DATA GENERATION
-- Purpose: Generate complete test dataset with new pricing schema
-- - 200 orders (100 customer + 100 POS)
-- - 1000 order items with proper pricing snapshots
-- - Complete audit trail with before/after snapshots
-- - All items with active promotions and discount structures
-- ============================================================================

-- ============================================================================
-- PART 1: CLEANUP - Remove old test data
-- ============================================================================
DELETE FROM order_status_history;
DELETE FROM order_item_pricing_snapshots;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM order_counters;

-- Reset sequences
ALTER SEQUENCE order_counters_id_seq RESTART WITH 1;

-- ============================================================================
-- PART 2: INITIALIZE ORDER COUNTERS FOR BUSINESSES
-- ============================================================================
-- per-business sequences for order numbering
INSERT INTO order_counters (id, business_id, counter_date, counter_value) VALUES
(gen_random_uuid(), '550cad56-cafd-4aba-baef-c4dcd53940d0', CURRENT_DATE, 200),
(gen_random_uuid(), '550cad56-cafd-4aba-baef-c4dcd53940d1', CURRENT_DATE, 0);

-- ============================================================================
-- PART 3: GENERATE 100 CUSTOMER ORDERS (WEB CHECKOUT)
-- ============================================================================
-- Orders placed by customers via public checkout
-- Pattern: Orders with various statuses, payment methods, and discount combinations
INSERT INTO orders (
  id, version, created_at, updated_at, created_by, updated_by,
  is_deleted, deleted_at, deleted_by, business_id, customer_id,
  order_number, order_status, source, order_from,
  subtotal, discount_amount, discount_type, delivery_fee, tax_amount, total_amount,
  payment_method, payment_status,
  customer_name, customer_phone, customer_email, customer_note, business_note,
  had_order_level_change_from_pos, order_level_change_reason,
  confirmed_at, completed_at
)
SELECT
    gen_random_uuid(), 0,
    NOW() - (random() * 90)::int * INTERVAL '1 day',
    NOW() - (random() * 90)::int * INTERVAL '1 day',
    'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
    '550e8400-e29b-41d4-a716-446655550002'::uuid,
    'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(i::text, 3, '0'),
    CASE
      WHEN (i % 5) = 0 THEN 'PENDING'
      WHEN (i % 5) = 1 THEN 'CONFIRMED'
      WHEN (i % 5) = 2 THEN 'PREPARING'
      WHEN (i % 5) = 3 THEN 'COMPLETED'
      ELSE 'CANCELLED'
    END,
    'PUBLIC', 'CUSTOMER',
    (45 + (i % 100))::numeric, 0, NULL, 2, 5,
    (45 + (i % 100))::numeric + 2 + 5,
    'CASH',
    CASE WHEN (i % 2) = 0 THEN 'PAID' ELSE 'UNPAID' END,
    'Customer ' || i,
    '555-000' || LPAD(i::text, 4, '0'),
    'customer' || i || '@email.com', NULL, NULL,
    false, NULL,
    NOW() - (random() * 90)::int * INTERVAL '1 day',
    CASE WHEN (i % 5) = 3 THEN NOW() - (random() * 90)::int * INTERVAL '1 day' ELSE NULL END
FROM generate_series(1, 100) AS t(i);

-- ============================================================================
-- PART 4: GENERATE 100 POS ORDERS (BUSINESS CHECKOUT)
-- ============================================================================
-- Orders created via POS system with possible order-level discounts
-- Pattern: 33% have order-level discount applied (for audit trail)
INSERT INTO orders (
  id, version, created_at, updated_at, created_by, updated_by,
  is_deleted, deleted_at, deleted_by, business_id, customer_id,
  order_number, order_status, source, order_from,
  subtotal, discount_amount, discount_type, delivery_fee, tax_amount, total_amount,
  payment_method, payment_status,
  customer_name, customer_phone, customer_email, customer_note, business_note,
  had_order_level_change_from_pos, order_level_change_reason,
  confirmed_at, completed_at
)
SELECT
    gen_random_uuid(), 0,
    NOW() - (random() * 90)::int * INTERVAL '1 day',
    NOW() - (random() * 90)::int * INTERVAL '1 day',
    'system', 'system', false, NULL, NULL,
    '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
    CASE WHEN (i % 3) = 0 THEN '550e8400-e29b-41d4-a716-446655550002'::uuid ELSE NULL END,
    'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD((100 + i)::text, 3, '0'),
    'COMPLETED', 'POS', 'BUSINESS',
    (45 + (i % 100))::numeric,
    CASE WHEN (i % 4) = 0 THEN 5 WHEN (i % 4) = 1 THEN 3 ELSE 0 END,
    CASE WHEN (i % 4) = 0 THEN 'FIXED_AMOUNT' WHEN (i % 4) = 1 THEN 'FIXED_AMOUNT' ELSE NULL END,
    2, 5,
    (45 + (i % 100))::numeric - CASE WHEN (i % 4) = 0 THEN 5 WHEN (i % 4) = 1 THEN 3 ELSE 0 END + 2 + 5,
    'CASH', 'PAID',
    CASE WHEN (i % 2) = 0 THEN 'POS Order ' || i ELSE 'Walk-in' END,
    CASE WHEN (i % 2) = 0 THEN '555-100' || LPAD(i::text, 4, '0') ELSE NULL END,
    NULL, NULL, 'POS Entry',
    CASE WHEN (i % 3) = 0 THEN true ELSE false END,
    CASE WHEN (i % 3) = 0 THEN 'Manager discount applied' ELSE NULL END,
    NOW() - (random() * 90)::int * INTERVAL '1 day',
    NOW() - (random() * 90)::int * INTERVAL '1 day'
FROM generate_series(1, 100) AS t(i);

-- ============================================================================
-- PART 5: GENERATE 1000 ORDER ITEMS (5 PER ORDER × 200 ORDERS)
-- ============================================================================
-- Each item has:
-- - Active promotion (100% of items have promotions for realistic test data)
-- - Before/after snapshots (25% of items have POS modifications)
-- - Varied discount types: PERCENTAGE and FIXED_AMOUNT
INSERT INTO order_items (
  id, version, created_at, updated_at, created_by, updated_by,
  is_deleted, deleted_at, deleted_by,
  order_id, product_id, product_size_id,
  product_name, product_image_url, size_name, barcode, sku,
  current_price, final_price, unit_price,
  has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date,
  quantity, total_price, special_instructions,
  had_change_from_pos, change_reason
)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    p.id,
    ps.id,
    p.name,
    p.main_image_url,
    ps.size_name,
    p.product_barcode,
    p.product_sku,
    p.price,
    -- Final price with discount applied
    CASE WHEN (t.item_num % 3) = 0 THEN ROUND(p.price * 0.85, 2)    -- 15% discount
         WHEN (t.item_num % 3) = 1 THEN ROUND(p.price * 0.95, 2)    -- 5% discount (matches $5 fixed amount better)
         ELSE ROUND(p.price * 0.90, 2) END,                          -- 10% discount
    p.price,
    true,  -- All items have active promotions
    -- Varied promotion types: 15% PERCENTAGE, ~5% FIXED_AMOUNT, 10% PERCENTAGE
    CASE WHEN (t.item_num % 3) = 0 THEN 'PERCENTAGE'
         WHEN (t.item_num % 3) = 1 THEN 'FIXED_AMOUNT'
         ELSE 'PERCENTAGE' END,
    CASE WHEN (t.item_num % 3) = 0 THEN 15                           -- 15%
         WHEN (t.item_num % 3) = 1 THEN 5                            -- $5 fixed
         ELSE 10 END,                                                 -- 10%
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '25 days',
    -- Quantity: 1, 2, or 3
    CASE WHEN (t.item_num % 3) = 0 THEN 3
         WHEN (t.item_num % 3) = 1 THEN 2
         ELSE 1 END,
    -- Total price calculation
    CASE WHEN (t.item_num % 3) = 0 THEN ROUND(p.price * 0.85 * CASE WHEN (t.item_num % 3) = 0 THEN 3 WHEN (t.item_num % 3) = 1 THEN 2 ELSE 1 END, 2)
         WHEN (t.item_num % 3) = 1 THEN ROUND(p.price * 0.95 * CASE WHEN (t.item_num % 3) = 0 THEN 3 WHEN (t.item_num % 3) = 1 THEN 2 ELSE 1 END, 2)
         ELSE ROUND(p.price * 0.90 * CASE WHEN (t.item_num % 3) = 0 THEN 3 WHEN (t.item_num % 3) = 1 THEN 2 ELSE 1 END, 2) END,
    'Special preparation: ' || CASE WHEN (t.item_num % 4) = 0 THEN 'No onions, extra spicy'
                                     WHEN (t.item_num % 4) = 1 THEN 'Light salt, no MSG'
                                     WHEN (t.item_num % 4) = 2 THEN 'Well done, extra sauce'
                                     ELSE 'Quick service requested' END,
    -- Only 25% of items have POS changes (for realistic audit trail)
    CASE WHEN (o.rn % 4) = 0 THEN true ELSE false END,
    CASE WHEN (o.rn % 4) = 0 THEN CASE WHEN (o.rn % 6) = 0 THEN 'Out of stock, substituted'
                                         WHEN (o.rn % 6) = 1 THEN 'Price adjustment'
                                         WHEN (o.rn % 6) = 2 THEN 'Customer change'
                                         WHEN (o.rn % 6) = 3 THEN 'Item upgraded'
                                         WHEN (o.rn % 6) = 4 THEN 'Special adjustment'
                                         ELSE 'Kitchen recommendation' END
                                   ELSE NULL END
FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn FROM orders) o
CROSS JOIN (SELECT 1 as item_num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) t
JOIN LATERAL (
    SELECT id, name, main_image_url, price, has_sizes, sku as product_sku, barcode as product_barcode
    FROM products
    WHERE status = 'ACTIVE'
    ORDER BY id
    LIMIT 1 OFFSET ((o.rn + t.item_num) % 100)
) p ON true
JOIN LATERAL (
    SELECT id, name as size_name, sku, barcode
    FROM product_sizes
    WHERE product_id = p.id
    AND name = CASE WHEN (t.item_num % 4) = 0 THEN 'Small'
                    WHEN (t.item_num % 4) = 1 THEN 'Medium'
                    WHEN (t.item_num % 4) = 2 THEN 'Large'
                    ELSE 'Medium' END
    LIMIT 1
) ps ON true;

-- ============================================================================
-- PART 6: CREATE ORDER ITEM PRICING SNAPSHOTS
-- ============================================================================
-- Before/after snapshots for each item
-- - BEFORE: Original product pricing with item-level promotions
-- - AFTER: Modified pricing if hadChangeFromPOS = true
INSERT INTO order_item_pricing_snapshots (
  id, version, created_at, updated_at, created_by, updated_by,
  is_deleted, deleted_at, deleted_by,
  order_item_id,
  before_current_price, before_final_price, before_has_active_promotion,
  before_discount_amount, before_total_price, before_promotion_type, before_promotion_value,
  before_promotion_from_date, before_promotion_to_date,
  after_current_price, after_final_price, after_has_active_promotion,
  after_discount_amount, after_total_price, after_promotion_type, after_promotion_value,
  after_promotion_from_date, after_promotion_to_date
)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    oi.id,
    -- ===== BEFORE SNAPSHOT (Original product pricing) =====
    oi.current_price,
    oi.final_price,
    oi.has_promotion,
    ROUND(((oi.current_price - oi.final_price) * oi.quantity)::numeric, 2),  -- Total discount for quantity
    oi.total_price,
    oi.promotion_type,
    oi.promotion_value,
    oi.promotion_from_date,
    oi.promotion_to_date,
    -- ===== AFTER SNAPSHOT (With POS modifications if any) =====
    -- If hadChangeFromPOS = true, simulate 10% price increase
    CASE WHEN oi.had_change_from_pos THEN ROUND(oi.current_price * 1.1, 2)
         ELSE oi.current_price END,
    -- Preserve promotion discount on new price
    CASE WHEN oi.had_change_from_pos THEN ROUND(ROUND(oi.current_price * 1.1, 2) *
                                                   (oi.final_price / NULLIF(oi.current_price, 0)), 2)
         ELSE oi.final_price END,
    oi.has_promotion,
    -- Discount amount on new price (including quantity)
    CASE WHEN oi.had_change_from_pos
         THEN ROUND(((ROUND(oi.current_price * 1.1, 2) -
                      ROUND(ROUND(oi.current_price * 1.1, 2) * (oi.final_price / NULLIF(oi.current_price, 0)), 2)) * oi.quantity)::numeric, 2)
         ELSE ROUND(((oi.current_price - oi.final_price) * oi.quantity)::numeric, 2) END,
    -- Total price on new price
    CASE WHEN oi.had_change_from_pos
         THEN ROUND(ROUND(ROUND(oi.current_price * 1.1, 2) * (oi.final_price / NULLIF(oi.current_price, 0)), 2) * oi.quantity, 2)
         ELSE oi.total_price END,
    oi.promotion_type,
    oi.promotion_value,
    oi.promotion_from_date,
    oi.promotion_to_date
FROM order_items oi;

-- ============================================================================
-- PART 7: CREATE ORDER STATUS HISTORY
-- ============================================================================
-- Complete status progression for each order
-- Simulates realistic order lifecycle with proper timestamps
INSERT INTO order_status_history (
  id, version, created_at, updated_at, created_by, updated_by,
  is_deleted, deleted_at, deleted_by,
  order_id, order_status, changed_by_user_id, changed_by_name, note
)
WITH status_sequence AS (
  SELECT o.id as order_id,
         o.created_at,
         o.order_status,
         o.rn,
         -- Status flow based on order type
         CASE WHEN (o.rn % 3) = 0 THEN ARRAY['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED']
              WHEN (o.rn % 3) = 1 THEN ARRAY['PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED']
              ELSE ARRAY['PENDING', 'CONFIRMED', 'CANCELLED'] END as status_flow,
         CASE WHEN (o.rn % 3) = 0 THEN 4
              WHEN (o.rn % 3) = 1 THEN 4
              ELSE 3 END as flow_length
  FROM (SELECT id, created_at, order_status, ROW_NUMBER() OVER (ORDER BY id) as rn FROM orders) o
),
expanded_statuses AS (
  SELECT order_id, created_at, order_status, rn, flow_length, status_flow,
         generate_subscripts(status_flow, 1) as status_idx
  FROM status_sequence
)
SELECT
    gen_random_uuid(), 0,
    created_at + (status_idx - 1) * INTERVAL '2 hours' + (rn % 30) * INTERVAL '5 minutes',
    created_at + (status_idx - 1) * INTERVAL '2 hours' + (rn % 30) * INTERVAL '5 minutes',
    'system', 'system', false, NULL, NULL,
    order_id,
    status_flow[status_idx],
    CASE WHEN (rn % 5) = 0 THEN '550e8400-e29b-41d4-a716-446655550001'::uuid
         ELSE '550e8400-e29b-41d4-a716-446655550000'::uuid END,
    CASE WHEN (rn % 5) = 0 THEN 'Admin User' ELSE 'System' END,
    'Order status updated to ' || status_flow[status_idx]
FROM expanded_statuses;

-- ============================================================================
-- PART 8: SUMMARY STATISTICS
-- ============================================================================
SELECT
  'Test Data Generation Summary' as title,
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(DISTINCT customer_id) FROM orders WHERE customer_id IS NOT NULL) as unique_customers,
  (SELECT COUNT(*) FROM order_items) as total_items,
  (SELECT COUNT(*) FROM order_item_pricing_snapshots) as item_pricing_snapshots,
  (SELECT COUNT(*) FROM order_status_history) as status_history_entries,
  (SELECT COUNT(*) FROM order_counters) as business_counters
;
