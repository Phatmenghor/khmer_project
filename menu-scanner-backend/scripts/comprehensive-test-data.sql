-- ============================================================================
-- COMPREHENSIVE TEST DATA GENERATION SCRIPT
-- Complete order data with delivery info, items, and status history
-- 50% CUSTOMER orders + 50% BUSINESS (POS) orders
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: CLEAR EXISTING TEST DATA (optional - comment out if keeping data)
-- ============================================================================
-- DELETE FROM order_status_history;
-- DELETE FROM order_delivery_option;
-- DELETE FROM order_delivery_address;
-- DELETE FROM order_items;
-- DELETE FROM orders;

-- ============================================================================
-- PART 2: ENSURE ORDERS TABLE HAS REQUIRED COLUMNS
-- ============================================================================
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(10,2) DEFAULT 0;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS customization_total NUMERIC(10,2) DEFAULT 0;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20);
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_reason TEXT;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_percentage NUMERIC(5,2) DEFAULT 0;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;

-- ============================================================================
-- PART 3: GENERATE 20 COMPREHENSIVE ORDERS
-- 10 CUSTOMER Orders + 10 BUSINESS (POS) Orders
-- Each with 5-15 items, promotions, add-ons, delivery info, status history
-- ============================================================================

-- Get business ID for lookups
WITH businesses AS (
  SELECT id, name FROM businesses WHERE status = 'ACTIVE' LIMIT 1
),
business_users AS (
  SELECT u.id, u.business_id, up.first_name, up.last_name, up.email
  FROM users u
  LEFT JOIN user_profiles up ON u.id = up.user_id
  WHERE u.business_id IN (SELECT id FROM businesses)
  AND u.user_type = 'BUSINESS_USER'
  LIMIT 5
),
customer_users AS (
  SELECT id, user_identifier FROM users WHERE user_type = 'CUSTOMER' LIMIT 10
),
products AS (
  SELECT id, name, sku, barcode, main_image_url, price
  FROM products
  WHERE business_id IN (SELECT id FROM businesses)
  AND price > 0
  LIMIT 20
)

-- Create 20 test orders
INSERT INTO orders (
  id, order_number, business_id, customer_id, customer_name, customer_phone,
  customer_email, customer_note, business_note, order_status, source, order_from,
  subtotal, customization_total, delivery_fee, discount_amount, discount_type,
  discount_reason, tax_percentage, tax_amount, total_amount,
  payment_method, payment_status, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(order_num::text, 5, '0'),
  b.id,
  CASE WHEN order_num <= 10 THEN (SELECT id FROM customer_users LIMIT 1 OFFSET (order_num % 10))
       ELSE NULL END,
  CASE WHEN order_num <= 10 THEN 'Customer ' || order_num
       ELSE 'POS User ' || order_num END,
  '+855-' || (87 + (order_num % 12)) || '-' || LPAD((100000 + order_num * 1000)::text, 6, '0'),
  CASE WHEN order_num <= 10 THEN 'customer' || order_num || '@example.com'
       ELSE 'pos' || order_num || '@example.com' END,
  CASE WHEN order_num <= 10 THEN 'Please deliver carefully' ELSE NULL END,
  CASE WHEN order_num > 10 THEN 'POS Order - Staff: User' || (order_num - 10) ELSE 'VIP customer - priority' END,
  CASE WHEN order_num % 4 = 0 THEN 'COMPLETED'
       WHEN order_num % 4 = 1 THEN 'PENDING'
       WHEN order_num % 4 = 2 THEN 'CONFIRMED'
       ELSE 'CANCELLED' END,
  CASE WHEN order_num <= 10 THEN 'PUBLIC' ELSE 'POS' END,
  CASE WHEN order_num <= 10 THEN 'CUSTOMER' ELSE 'BUSINESS' END,
  (500 + order_num * 50)::numeric(10,2),
  CASE WHEN order_num % 3 = 0 THEN (50 + order_num * 5)::numeric(10,2) ELSE 0 END,
  CASE WHEN order_num % 2 = 0 THEN 5.00::numeric(10,2) ELSE 0 END,
  CASE WHEN order_num % 5 = 0 THEN ((500 + order_num * 50) * 0.1)::numeric(10,2) ELSE 0 END,
  CASE WHEN order_num % 5 = 0 THEN 'percentage' ELSE NULL END,
  CASE WHEN order_num % 5 = 0 THEN '10% Special Promotion' ELSE NULL END,
  0.00,
  0.00,
  ((500 + order_num * 50)
   + CASE WHEN order_num % 3 = 0 THEN (50 + order_num * 5) ELSE 0 END
   + CASE WHEN order_num % 2 = 0 THEN 5.00 ELSE 0 END
   - CASE WHEN order_num % 5 = 0 THEN ((500 + order_num * 50) * 0.1) ELSE 0 END
  )::numeric(10,2),
  CASE WHEN order_num % 3 = 0 THEN 'CREDIT_CARD'
       WHEN order_num % 3 = 1 THEN 'CASH'
       ELSE 'MOBILE_MONEY' END,
  CASE WHEN order_num % 2 = 0 THEN 'PAID' ELSE 'UNPAID' END,
  0, false,
  NOW() - INTERVAL '1 day' * (21 - order_num),
  NOW() - INTERVAL '1 day' * (21 - order_num),
  'admin', 'admin'
FROM generate_series(1, 20) AS t(order_num)
CROSS JOIN (SELECT id FROM businesses LIMIT 1) b;

-- ============================================================================
-- PART 4: CREATE DELIVERY ADDRESSES FOR CUSTOMER ORDERS
-- ============================================================================
INSERT INTO order_delivery_addresses (
  id, order_id, house_number, street_number, village, commune, district,
  province, latitude, longitude, note, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  o.id,
  LPAD((100 + addr.seq)::text, 3, '0'),
  LPAD((10 + (addr.seq % 50))::text, 3, '0'),
  'Village ' || ((addr.seq % 20) + 1)::text,
  'Commune ' || ((addr.seq % 15) + 1)::text,
  CASE WHEN addr.seq % 5 = 0 THEN 'Chbar Ampov'
       WHEN addr.seq % 5 = 1 THEN 'Russei Keo'
       WHEN addr.seq % 5 = 2 THEN 'Sen Sok'
       WHEN addr.seq % 5 = 3 THEN 'Pur Senchey'
       ELSE 'Chamcar Mon' END,
  'Phnom Penh',
  (11.5 + (addr.seq::numeric % 100) / 1000)::numeric(10,8),
  (104.8 + (addr.seq::numeric % 100) / 1000)::numeric(10,8),
  'Delivery instruction: Ring doorbell twice, building ' || addr.seq,
  0, false, o.created_at, o.updated_at, 'admin', 'admin'
FROM orders o
CROSS JOIN generate_series(1, 1) AS addr(seq)
WHERE o.order_from = 'CUSTOMER'
AND NOT EXISTS (SELECT 1 FROM order_delivery_addresses WHERE order_id = o.id);

-- ============================================================================
-- PART 5: CREATE DELIVERY OPTIONS FOR ALL ORDERS
-- ============================================================================
INSERT INTO order_delivery_options (
  id, order_id, name, description, price, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  o.id,
  CASE WHEN o.order_from = 'CUSTOMER' THEN 'Standard Delivery'
       ELSE 'POS Pickup' END,
  CASE WHEN o.order_from = 'CUSTOMER' THEN 'Standard delivery within 24 hours'
       ELSE 'Pickup from store' END,
  CASE WHEN o.order_from = 'CUSTOMER' THEN 5.00::numeric(10,2) ELSE 0.00::numeric(10,2) END,
  0, false, o.created_at, o.updated_at, 'admin', 'admin'
FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM order_delivery_options WHERE order_id = o.id);

-- ============================================================================
-- PART 6: CREATE ORDER ITEMS WITH PROMOTIONS AND ADD-ONS
-- ============================================================================
INSERT INTO order_items (
  id, order_id, product_id, product_size_id, product_name, product_image_url,
  size_name, sku, barcode, quantity, current_price, final_price, unit_price,
  total_price, has_promotion, promotion_type, promotion_value,
  promotion_from_date, promotion_to_date, customization_total,
  customizations, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  o.id,
  p.id,
  NULL,
  p.name,
  p.main_image_url,
  NULL,
  p.sku,
  p.barcode,
  (1 + (item.seq % 3))::int,
  COALESCE(p.price, 50)::numeric(10,2),
  CASE WHEN item.seq % 4 = 0 THEN (COALESCE(p.price, 50) * 0.85)::numeric(10,2)
       WHEN item.seq % 4 = 1 THEN (COALESCE(p.price, 50) * 0.90)::numeric(10,2)
       ELSE COALESCE(p.price, 50)::numeric(10,2) END,
  CASE WHEN item.seq % 4 = 0 THEN (COALESCE(p.price, 50) * 0.85)::numeric(10,2)
       WHEN item.seq % 4 = 1 THEN (COALESCE(p.price, 50) * 0.90)::numeric(10,2)
       ELSE COALESCE(p.price, 50)::numeric(10,2) END,
  (CASE WHEN item.seq % 4 = 0 THEN (COALESCE(p.price, 50) * 0.85)::numeric(10,2)
        WHEN item.seq % 4 = 1 THEN (COALESCE(p.price, 50) * 0.90)::numeric(10,2)
        ELSE COALESCE(p.price, 50)::numeric(10,2) END) * (1 + (item.seq % 3))::int,
  (item.seq % 4 != 3),
  CASE WHEN item.seq % 4 = 0 THEN 'PERCENTAGE'
       WHEN item.seq % 4 = 1 THEN 'PERCENTAGE'
       ELSE NULL END,
  CASE WHEN item.seq % 4 = 0 THEN 15.00::numeric(10,2)
       WHEN item.seq % 4 = 1 THEN 10.00::numeric(10,2)
       ELSE NULL END,
  NOW() - INTERVAL '7 days',
  NOW() + INTERVAL '30 days',
  CASE WHEN item.seq % 5 = 0 THEN 10.00::numeric(10,2) ELSE 0 END,
  CASE WHEN item.seq % 5 = 0 THEN
    '[{"productCustomizationId": "' || gen_random_uuid()::text || '", "name": "Extra Toppings", "priceAdjustment": 10.00}]'
  ELSE NULL END,
  0, false, o.created_at, o.updated_at, 'admin', 'admin'
FROM orders o
CROSS JOIN LATERAL (SELECT id, name, sku, barcode, main_image_url, price FROM products LIMIT 5) p
CROSS JOIN generate_series(1, 5 + (o.id::text::bigint % 10)) AS item(seq)
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = o.id);

-- ============================================================================
-- PART 7: CREATE ORDER STATUS HISTORY (7-10 entries per order)
-- ============================================================================
INSERT INTO order_status_history (
  id, order_id, order_status, note, changed_by_user_id, changed_by_name,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  o.id,
  CASE WHEN status.seq = 1 THEN 'PENDING'
       WHEN status.seq = 2 THEN 'CONFIRMED'
       WHEN status.seq = 3 THEN 'COMPLETED'
       WHEN status.seq = 4 THEN 'CANCELLED'
       WHEN status.seq = 5 THEN 'CONFIRMED'
       WHEN status.seq = 6 THEN 'COMPLETED'
       WHEN status.seq = 7 THEN 'PENDING'
       WHEN status.seq = 8 THEN 'CONFIRMED'
       WHEN status.seq = 9 THEN 'COMPLETED'
       ELSE 'CANCELLED' END::order_status,
  'Status change ' || status.seq::text || ' - Order processing',
  NULL,
  'Admin User',
  0, false,
  o.created_at + INTERVAL '1 hour' * status.seq,
  o.created_at + INTERVAL '1 hour' * status.seq,
  'admin', 'admin'
FROM orders o
CROSS JOIN generate_series(1, 7 + (o.id::text::bigint % 4)) AS status(seq)
WHERE NOT EXISTS (
  SELECT 1 FROM order_status_history WHERE order_id = o.id AND order_status = 'PENDING'
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT '========== TEST DATA GENERATION COMPLETE ==========' as status;

SELECT '--- ORDERS COUNT BY TYPE ---' as section;
SELECT
  order_from,
  COUNT(*) as total,
  COUNT(CASE WHEN order_status = 'COMPLETED' THEN 1 END) as completed,
  COUNT(CASE WHEN order_status = 'PENDING' THEN 1 END) as pending,
  COUNT(CASE WHEN order_status = 'CONFIRMED' THEN 1 END) as confirmed,
  COUNT(CASE WHEN order_status = 'CANCELLED' THEN 1 END) as cancelled
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY order_from;

SELECT '--- ITEMS WITH PROMOTIONS ---' as section;
SELECT
  COUNT(*) as total_items,
  COUNT(CASE WHEN has_promotion THEN 1 END) as with_promotion,
  ROUND(COUNT(CASE WHEN has_promotion THEN 1 END)::numeric / COUNT(*) * 100, 2) as promotion_percentage
FROM order_items
WHERE created_at >= NOW() - INTERVAL '30 days';

SELECT '--- DELIVERY INFORMATION ---' as section;
SELECT
  COUNT(DISTINCT oda.order_id) as orders_with_delivery_address,
  COUNT(DISTINCT odo.order_id) as orders_with_delivery_option
FROM order_delivery_addresses oda
FULL OUTER JOIN order_delivery_options odo ON oda.order_id = odo.order_id
WHERE oda.created_at >= NOW() - INTERVAL '30 days'
   OR odo.created_at >= NOW() - INTERVAL '30 days';

SELECT '--- STATUS HISTORY SAMPLE ---' as section;
SELECT
  COUNT(*) as total_status_changes,
  COUNT(DISTINCT order_id) as orders_with_history,
  ROUND(COUNT(*)::numeric / COUNT(DISTINCT order_id), 2) as avg_changes_per_order
FROM order_status_history
WHERE created_at >= NOW() - INTERVAL '30 days';

SELECT '--- SAMPLE ORDER DATA ---' as section;
SELECT
  o.order_number,
  o.order_from,
  o.order_status,
  o.customer_name,
  o.customer_phone,
  o.customer_email,
  o.total_amount,
  (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
  (SELECT COUNT(*) FROM order_status_history WHERE order_id = o.id) as status_changes
FROM orders o
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY o.created_at DESC
LIMIT 5;

COMMIT;
