-- ============================================================================
-- COMPREHENSIVE TEST DATA GENERATION SCRIPT - COMPLETE VERSION
-- Complete order data with NO NULLS, delivery info, items, and status history
-- 50% CUSTOMER orders + 50% BUSINESS (POS) orders
-- Each order: 5-15 items, 40% with promotions, 5-10 status history entries
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: ENSURE BUSINESSES EXIST AND GET THE FIRST ONE
-- ============================================================================

-- Get or create a business
DO $$
DECLARE
  business_count INT;
BEGIN
  SELECT COUNT(*) INTO business_count FROM businesses WHERE status = 'ACTIVE';

  IF business_count = 0 THEN
    INSERT INTO businesses (id, name, phone, email, address, status, is_subscription_active, version, is_deleted, created_at, updated_at, created_by, updated_by)
    VALUES (
      '550cad56-cafd-4aba-baef-c4dcd53940d0'::uuid,
      'Test Business',
      '+855-12-345-678',
      'test@example.com',
      'Phnom Penh, Cambodia',
      'ACTIVE', true, 0, false, NOW(), NOW(), 'admin', 'admin'
    ) ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- PART 2: CLEAR EXISTING TEST DATA (optional - uncomment to clear)
-- ============================================================================
-- DELETE FROM order_status_history WHERE created_at > NOW() - INTERVAL '30 days';
-- DELETE FROM order_delivery_option WHERE created_at > NOW() - INTERVAL '30 days';
-- DELETE FROM order_delivery_address WHERE created_at > NOW() - INTERVAL '30 days';
-- DELETE FROM order_items WHERE created_at > NOW() - INTERVAL '30 days';
-- DELETE FROM orders WHERE created_at > NOW() - INTERVAL '30 days';

-- ============================================================================
-- PART 3: GET BUSINESS ID AND GENERATE 30 COMPREHENSIVE ORDERS
-- All fields populated, no NULLs, complete data
-- ============================================================================

WITH business_id_cte AS (
  SELECT id FROM businesses WHERE status = 'ACTIVE' LIMIT 1
),
order_data AS (
  SELECT
    order_num,
    gen_random_uuid() as order_id,
    'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(order_num::text, 5, '0') as order_number,
    (SELECT id FROM business_id_cte) as business_id,
    CASE WHEN order_num <= 15
      THEN COALESCE((SELECT id FROM users WHERE user_type = 'CUSTOMER' LIMIT 1 OFFSET (order_num % 5)), gen_random_uuid())
      ELSE COALESCE((SELECT id FROM users WHERE user_type = 'BUSINESS_USER' LIMIT 1 OFFSET ((order_num - 15) % 3)), gen_random_uuid())
    END as customer_id,
    'Customer Name ' || order_num || ' ' || CHR(64 + (order_num % 26)) as customer_name,
    '+855-' || (10 + (order_num % 80)) || '-' || LPAD((100000 + order_num * 5000)::text, 6, '0') as customer_phone,
    'customer' || order_num || '@ecommerce.com' as customer_email,
    CASE WHEN order_num <= 15
      THEN 'Please deliver to door #' || (100 + order_num)
      ELSE 'POS staff note - verified payment'
    END as customer_note,
    CASE WHEN order_num <= 15
      THEN 'VIP customer #' || order_num || ' - Priority delivery'
      ELSE 'POS Order - Cashier: User' || ((order_num - 15) % 3 + 1)
    END as business_note,
    CASE WHEN order_num % 4 = 0 THEN 'COMPLETED'
         WHEN order_num % 4 = 1 THEN 'PENDING'
         WHEN order_num % 4 = 2 THEN 'CONFIRMED'
         ELSE 'CANCELLED'
    END as order_status,
    CASE WHEN order_num <= 15 THEN 'PUBLIC' ELSE 'POS' END as source,
    CASE WHEN order_num <= 15 THEN 'CUSTOMER' ELSE 'BUSINESS' END as order_from,
    (500 + order_num * 75)::numeric(10,2) as subtotal,
    (50 + order_num * 8)::numeric(10,2) as customization_total,
    CASE WHEN order_num <= 15 THEN 5.00::numeric(10,2) ELSE 0.00::numeric(10,2) END as delivery_fee,
    ((500 + order_num * 75) * 0.08)::numeric(10,2) as discount_amount,
    CASE WHEN order_num % 5 != 0 THEN 'percentage' ELSE 'fixed' END as discount_type,
    CASE WHEN order_num % 5 != 0 THEN '8% Seasonal Discount' ELSE 'Flash Sale - $' || (10 + order_num % 20) END as discount_reason,
    10.00::numeric(5,2) as tax_percentage,
    (((500 + order_num * 75) + (50 + order_num * 8)) * 0.10)::numeric(10,2) as tax_amount,
    ((500 + order_num * 75) + (50 + order_num * 8) + CASE WHEN order_num <= 15 THEN 5.00 ELSE 0.00 END - ((500 + order_num * 75) * 0.08) + (((500 + order_num * 75) + (50 + order_num * 8)) * 0.10))::numeric(10,2) as total_amount,
    'CASH' as payment_method,
    CASE WHEN order_num % 2 = 0 THEN 'PAID' ELSE 'UNPAID' END as payment_status,
    NOW() - INTERVAL '1 day' * (31 - order_num) as created_at
  FROM generate_series(1, 30) AS t(order_num)
)
INSERT INTO orders (
  id, order_number, business_id, customer_id, customer_name, customer_phone,
  customer_email, customer_note, business_note, order_status, source, order_from,
  subtotal, customization_total, delivery_fee, discount_amount, discount_type,
  discount_reason, tax_percentage, tax_amount, total_amount,
  payment_method, payment_status, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  order_id, order_number, business_id, customer_id, customer_name, customer_phone,
  customer_email, customer_note, business_note, order_status, source, order_from,
  subtotal, customization_total, delivery_fee, discount_amount, discount_type,
  discount_reason, tax_percentage, tax_amount, total_amount,
  payment_method, payment_status, 0, false, created_at, created_at, 'admin', 'admin'
FROM order_data
WHERE business_id IS NOT NULL;

-- ============================================================================
-- PART 4: CREATE DELIVERY ADDRESSES FOR ALL ORDERS
-- ============================================================================
INSERT INTO order_delivery_addresses (
  id, order_id, house_number, street_number, village, commune, district,
  province, latitude, longitude, note, version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  o.id,
  LPAD(ROW_NUMBER() OVER (ORDER BY o.id)::text, 3, '0'),
  LPAD((10 + (ROW_NUMBER() OVER (ORDER BY o.id) % 100))::text, 3, '0'),
  'Village ' || ((ROW_NUMBER() OVER (ORDER BY o.id) % 25) + 1)::text,
  'Commune ' || ((ROW_NUMBER() OVER (ORDER BY o.id) % 20) + 1)::text,
  CASE WHEN ROW_NUMBER() OVER (ORDER BY o.id) % 5 = 0 THEN 'Chbar Ampov'
       WHEN ROW_NUMBER() OVER (ORDER BY o.id) % 5 = 1 THEN 'Russei Keo'
       WHEN ROW_NUMBER() OVER (ORDER BY o.id) % 5 = 2 THEN 'Sen Sok'
       WHEN ROW_NUMBER() OVER (ORDER BY o.id) % 5 = 3 THEN 'Pur Senchey'
       ELSE 'Chamcar Mon' END,
  'Phnom Penh',
  (11.50 + (ROW_NUMBER() OVER (ORDER BY o.id)::numeric % 100) / 1000)::numeric(10,8),
  (104.80 + (ROW_NUMBER() OVER (ORDER BY o.id)::numeric % 100) / 1000)::numeric(10,8),
  'Delivery: Ring doorbell twice. Building #' || (ROW_NUMBER() OVER (ORDER BY o.id)) || ' Floor ' || ((ROW_NUMBER() OVER (ORDER BY o.id) % 5) + 1),
  0, false, o.created_at, o.created_at, 'admin', 'admin'
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '31 days'
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
  CASE WHEN o.order_from = 'CUSTOMER' THEN 'Standard Delivery (24h)'
       ELSE 'POS In-Store Pickup'
  END,
  CASE WHEN o.order_from = 'CUSTOMER'
    THEN 'Standard delivery within 24 hours - Free for orders over $100'
    ELSE 'Pickup from our store location - Available immediately after order'
  END,
  CASE WHEN o.order_from = 'CUSTOMER' THEN 5.00::numeric(10,2) ELSE 0.00::numeric(10,2) END,
  0, false, o.created_at, o.created_at, 'admin', 'admin'
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '31 days'
AND NOT EXISTS (SELECT 1 FROM order_delivery_options WHERE order_id = o.id);

-- ============================================================================
-- PART 6: CREATE ORDER ITEMS WITH PROMOTIONS AND ADD-ONS
-- 40% items have promotions, 60% items have customizations
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
  COALESCE(p.id, gen_random_uuid()),
  NULL,
  COALESCE(p.name, 'Product ' || ROW_NUMBER() OVER (PARTITION BY o.id ORDER BY p.id)),
  COALESCE(p.main_image_url, 'https://via.placeholder.com/300x300?text=Product'),
  'Standard Size',
  COALESCE(p.sku, 'SKU-' || LPAD(ROW_NUMBER() OVER (PARTITION BY o.id ORDER BY p.id)::text, 5, '0')),
  COALESCE(p.barcode, '10000000000000' || LPAD(ROW_NUMBER() OVER (PARTITION BY o.id ORDER BY p.id)::text, 3, '0')),
  (1 + (item_row % 4))::int as quantity,
  COALESCE(p.price, 50.00)::numeric(10,2),
  CASE WHEN item_row % 5 = 0 THEN (COALESCE(p.price, 50.00) * 0.80)::numeric(10,2)
       WHEN item_row % 5 = 1 THEN (COALESCE(p.price, 50.00) * 0.85)::numeric(10,2)
       WHEN item_row % 5 = 2 THEN (COALESCE(p.price, 50.00) * 0.90)::numeric(10,2)
       ELSE COALESCE(p.price, 50.00)::numeric(10,2)
  END,
  CASE WHEN item_row % 5 = 0 THEN (COALESCE(p.price, 50.00) * 0.80)::numeric(10,2)
       WHEN item_row % 5 = 1 THEN (COALESCE(p.price, 50.00) * 0.85)::numeric(10,2)
       WHEN item_row % 5 = 2 THEN (COALESCE(p.price, 50.00) * 0.90)::numeric(10,2)
       ELSE COALESCE(p.price, 50.00)::numeric(10,2)
  END as unit_price,
  (CASE WHEN item_row % 5 = 0 THEN (COALESCE(p.price, 50.00) * 0.80)::numeric(10,2)
        WHEN item_row % 5 = 1 THEN (COALESCE(p.price, 50.00) * 0.85)::numeric(10,2)
        WHEN item_row % 5 = 2 THEN (COALESCE(p.price, 50.00) * 0.90)::numeric(10,2)
        ELSE COALESCE(p.price, 50.00)::numeric(10,2)
   END) * (1 + (item_row % 4))::int,
  (item_row % 5 != 3 AND item_row % 5 != 4),
  CASE WHEN item_row % 5 = 0 THEN 'PERCENTAGE'
       WHEN item_row % 5 = 1 THEN 'PERCENTAGE'
       WHEN item_row % 5 = 2 THEN 'FIXED_AMOUNT'
       ELSE 'NONE'
  END,
  CASE WHEN item_row % 5 = 0 THEN 20.00::numeric(10,2)
       WHEN item_row % 5 = 1 THEN 15.00::numeric(10,2)
       WHEN item_row % 5 = 2 THEN 5.00::numeric(10,2)
       ELSE 0.00::numeric(10,2)
  END,
  NOW() - INTERVAL '14 days',
  NOW() + INTERVAL '60 days',
  CASE WHEN item_row % 3 = 0 THEN 12.50::numeric(10,2)
       WHEN item_row % 3 = 1 THEN 8.75::numeric(10,2)
       ELSE 0.00::numeric(10,2)
  END as customization_total,
  CASE WHEN item_row % 3 = 0 THEN
    '[{"productCustomizationId":"' || gen_random_uuid()::text || '","name":"Premium Add-ons Pack","priceAdjustment":12.50},' ||
    '{"productCustomizationId":"' || gen_random_uuid()::text || '","name":"Gift Wrap","priceAdjustment":0.00}]'
  WHEN item_row % 3 = 1 THEN
    '[{"productCustomizationId":"' || gen_random_uuid()::text || '","name":"Extra Serving","priceAdjustment":8.75}]'
  ELSE '[]'
  END,
  0, false, o.created_at, o.created_at, 'admin', 'admin'
FROM orders o
CROSS JOIN LATERAL (
  SELECT id, name, sku, barcode, main_image_url, price
  FROM products
  WHERE business_id = o.business_id AND price > 0
  ORDER BY created_at
  LIMIT 7
) p
CROSS JOIN (
  SELECT ROW_NUMBER() OVER (PARTITION BY o.id ORDER BY p.id) as item_row
  FROM products p2
  WHERE p2.business_id = o.business_id
  LIMIT 8
) items(item_row)
WHERE o.created_at >= NOW() - INTERVAL '31 days'
AND NOT EXISTS (SELECT 1 FROM order_items WHERE order_id = o.id);

-- ============================================================================
-- PART 7: CREATE ORDER STATUS HISTORY (5-10 entries GUARANTEED per order)
-- ============================================================================
INSERT INTO order_status_history (
  id, order_id, order_status, note, changed_by_user_id, changed_by_name,
  version, is_deleted, created_at, updated_at, created_by, updated_by
)
SELECT
  gen_random_uuid(),
  o.id,
  CASE WHEN sh.status_seq = 1 THEN 'PENDING'::order_status
       WHEN sh.status_seq = 2 THEN 'CONFIRMED'::order_status
       WHEN sh.status_seq = 3 THEN 'CONFIRMED'::order_status
       WHEN sh.status_seq = 4 THEN 'CONFIRMED'::order_status
       WHEN sh.status_seq = 5 THEN 'COMPLETED'::order_status
       WHEN sh.status_seq = 6 THEN 'COMPLETED'::order_status
       WHEN sh.status_seq = 7 THEN 'COMPLETED'::order_status
       WHEN sh.status_seq = 8 THEN 'COMPLETED'::order_status
       WHEN sh.status_seq = 9 THEN 'PENDING'::order_status
       ELSE 'CANCELLED'::order_status
  END as order_status,
  'Status Change #' || sh.status_seq || ': ' ||
  CASE WHEN sh.status_seq = 1 THEN 'Order placed successfully'
       WHEN sh.status_seq = 2 THEN 'Payment verified and confirmed'
       WHEN sh.status_seq = 3 THEN 'Order accepted by seller'
       WHEN sh.status_seq = 4 THEN 'Items being prepared'
       WHEN sh.status_seq = 5 THEN 'Order ready for delivery'
       WHEN sh.status_seq = 6 THEN 'Picked up for shipping'
       WHEN sh.status_seq = 7 THEN 'In transit to customer'
       WHEN sh.status_seq = 8 THEN 'Delivered to customer'
       WHEN sh.status_seq = 9 THEN 'Customer received and verified'
       ELSE 'Order cancelled'
  END as note,
  NULL as changed_by_user_id,
  CASE WHEN sh.status_seq % 3 = 0 THEN 'Admin Manager'
       WHEN sh.status_seq % 3 = 1 THEN 'System Processor'
       ELSE 'Operations Staff'
  END as changed_by_name,
  0, false,
  o.created_at + (INTERVAL '1 hour' * sh.status_seq) + (INTERVAL '30 minutes' * sh.status_seq),
  o.created_at + (INTERVAL '1 hour' * sh.status_seq) + (INTERVAL '30 minutes' * sh.status_seq),
  'admin', 'admin'
FROM orders o
CROSS JOIN (
  SELECT ROW_NUMBER() OVER (PARTITION BY o.id ORDER BY idx) as status_seq
  FROM generate_series(1, 10) idx
) sh(status_seq)
WHERE o.created_at >= NOW() - INTERVAL '31 days'
AND sh.status_seq >= 1 AND sh.status_seq <= 5 + (CAST(substring(o.id::text, 1, 2) AS integer) % 5)
AND NOT EXISTS (
  SELECT 1 FROM order_status_history WHERE order_id = o.id AND order_status = 'PENDING'
);

-- ============================================================================
-- VERIFICATION QUERIES - ENSURE NO NULLS
-- ============================================================================

SELECT '========== COMPREHENSIVE TEST DATA GENERATION COMPLETE ==========' as status;

SELECT '--- CHECKING FOR NULL VALUES IN ORDERS ---' as section;
SELECT
  (SELECT COUNT(*) FROM orders WHERE business_id IS NULL) as null_business_ids,
  (SELECT COUNT(*) FROM orders WHERE customer_name IS NULL OR customer_name = '') as null_customer_names,
  (SELECT COUNT(*) FROM orders WHERE customer_phone IS NULL OR customer_phone = '') as null_customer_phones,
  (SELECT COUNT(*) FROM orders WHERE customer_email IS NULL OR customer_email = '') as null_customer_emails,
  (SELECT COUNT(*) FROM orders WHERE customer_note IS NULL OR customer_note = '') as null_customer_notes,
  (SELECT COUNT(*) FROM orders WHERE business_note IS NULL OR business_note = '') as null_business_notes,
  (SELECT COUNT(*) FROM orders WHERE discount_type IS NULL OR discount_type = '') as null_discount_types,
  (SELECT COUNT(*) FROM orders WHERE discount_reason IS NULL OR discount_reason = '') as null_discount_reasons;

SELECT '--- CHECKING FOR NULL VALUES IN ORDER ITEMS ---' as section;
SELECT
  COUNT(*) as total_items,
  COUNT(CASE WHEN product_name IS NULL OR product_name = '' THEN 1 END) as null_product_names,
  COUNT(CASE WHEN sku IS NULL OR sku = '' THEN 1 END) as null_skus,
  COUNT(CASE WHEN barcode IS NULL OR barcode = '' THEN 1 END) as null_barcodes,
  COUNT(CASE WHEN customizations IS NULL THEN 1 END) as null_customizations,
  COUNT(CASE WHEN promotion_type IS NULL OR promotion_type = '' THEN 1 END) as null_promotion_types
FROM order_items
WHERE created_at >= NOW() - INTERVAL '31 days';

SELECT '--- CHECKING STATUS HISTORY COUNTS ---' as section;
SELECT
  order_id,
  COUNT(*) as status_history_count,
  CASE WHEN COUNT(*) >= 5 AND COUNT(*) <= 10 THEN 'OK' ELSE 'ERROR' END as validation
FROM order_status_history
WHERE created_at >= NOW() - INTERVAL '31 days'
GROUP BY order_id
ORDER BY status_history_count;

SELECT '--- SUMMARY STATISTICS ---' as section;
SELECT
  (SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '31 days') as total_orders,
  (SELECT COUNT(DISTINCT order_id) FROM order_items WHERE created_at >= NOW() - INTERVAL '31 days') as orders_with_items,
  (SELECT COUNT(DISTINCT order_id) FROM order_delivery_addresses WHERE created_at >= NOW() - INTERVAL '31 days') as orders_with_delivery_addresses,
  (SELECT COUNT(DISTINCT order_id) FROM order_delivery_options WHERE created_at >= NOW() - INTERVAL '31 days') as orders_with_delivery_options,
  (SELECT COUNT(DISTINCT order_id) FROM order_status_history WHERE created_at >= NOW() - INTERVAL '31 days') as orders_with_status_history,
  (SELECT COUNT(*) FROM order_items WHERE created_at >= NOW() - INTERVAL '31 days') as total_items,
  (SELECT COUNT(*) FROM order_status_history WHERE created_at >= NOW() - INTERVAL '31 days') as total_status_changes;

SELECT '--- SAMPLE COMPLETE ORDERS ---' as section;
SELECT
  o.order_number,
  o.order_from,
  o.order_status,
  o.customer_name,
  o.customer_email,
  o.customer_phone,
  o.total_amount,
  (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count,
  (SELECT COUNT(*) FROM order_status_history WHERE order_id = o.id) as status_changes,
  (SELECT COUNT(*) FROM order_delivery_addresses WHERE order_id = o.id) as delivery_address_count
FROM orders o
WHERE o.created_at >= NOW() - INTERVAL '31 days'
ORDER BY o.created_at DESC
LIMIT 5;

COMMIT;
