-- ============================================================================
-- DIAGNOSTIC SCRIPT: Verify Order Data Population
-- This script helps identify why deliveryAddress might be null in order responses
-- ============================================================================

-- 1. Check how many orders exist
SELECT 'ORDERS COUNT' as check_name, COUNT(*) as count FROM orders;

-- 2. Check how many customer addresses exist
SELECT 'CUSTOMER ADDRESSES COUNT' as check_name, COUNT(*) as count FROM customer_addresses WHERE is_deleted = false;

-- 3. Check how many location images exist
SELECT 'LOCATION IMAGES COUNT' as check_name, COUNT(*) as count FROM location_images WHERE is_deleted = false;

-- 4. Check how many order_delivery_addresses exist
SELECT 'ORDER DELIVERY ADDRESSES COUNT' as check_name, COUNT(*) as count FROM order_delivery_addresses WHERE is_deleted = false;

-- 5. Show sample of orders and their delivery addresses
SELECT '===== ORDERS WITH DELIVERY ADDRESSES =====' as separator;
SELECT
    COUNT(o.id) as orders_with_delivery,
    COUNT(oda.id) as delivery_addresses_found,
    COUNT(CASE WHEN oda.id IS NULL THEN 1 END) as orders_without_delivery
FROM orders o
LEFT JOIN order_delivery_addresses oda ON o.id = oda.order_id;

-- 6. Show first 5 orders with their delivery address data
SELECT '===== FIRST 5 ORDERS WITH DELIVERY ADDRESS DATA =====' as separator;
SELECT
    o.id,
    o.order_number,
    CASE WHEN oda.id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_delivery_address,
    COALESCE(oda.village, 'NULL') as village,
    COALESCE(oda.commune, 'NULL') as commune,
    COALESCE(oda.location_id::text, 'NULL') as location_id,
    COALESCE(oda.location_images::text, '[]') as location_images
FROM orders o
LEFT JOIN order_delivery_addresses oda ON o.id = oda.order_id
LIMIT 5;

-- 7. Check if any customer addresses have null fields
SELECT '===== CUSTOMER ADDRESSES WITH NULL FIELDS =====' as separator;
SELECT
    id,
    village,
    commune,
    district,
    province,
    street_number,
    house_number,
    note
FROM customer_addresses
WHERE is_deleted = false
LIMIT 5;

-- 8. Check location_images for first address
SELECT '===== LOCATION IMAGES FOR FIRST ADDRESS =====' as separator;
SELECT
    ca.id as location_id,
    ca.village,
    COUNT(li.id) as image_count
FROM customer_addresses ca
LEFT JOIN location_images li ON ca.id = li.location_id AND li.is_deleted = false
WHERE ca.is_deleted = false
GROUP BY ca.id, ca.village
LIMIT 5;

-- ============================================================================
-- If orders don't have delivery addresses, run this to populate them:
-- ============================================================================

-- Step 1: Ensure customer addresses exist
INSERT INTO customer_addresses (
    id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    user_id, village, commune, district, province, country, street_number, house_number, note, latitude, longitude, is_default
)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    u.id, 'Delivery Village', 'Chamkarmon', 'Chamkarmon', 'Phnom Penh', 'Cambodia',
    '123', 'House 1', 'Primary delivery address', 11.5564, 104.9282, true
FROM (SELECT DISTINCT id FROM users WHERE user_type = 'CUSTOMER' LIMIT 1) u
WHERE NOT EXISTS (
    SELECT 1 FROM customer_addresses ca WHERE ca.is_deleted = false LIMIT 1
);

-- Step 2: Create location images for all addresses
INSERT INTO location_images (
    id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    location_id, image_url
)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    ca.id,
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=400'
FROM customer_addresses ca
CROSS JOIN (SELECT generate_series(1, 4) as img_num)
WHERE ca.is_deleted = false
  AND NOT EXISTS (
    SELECT 1 FROM location_images li WHERE li.location_id = ca.id AND li.is_deleted = false
  );

-- Step 3: Create order_delivery_addresses for all orders that don't have them
INSERT INTO order_delivery_addresses (
    id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by,
    order_id, village, commune, district, province, street_number, house_number, note, latitude, longitude,
    location_id, location_images
)
SELECT
    gen_random_uuid(),
    0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    COALESCE(ca.village, 'Delivery Village'),
    COALESCE(ca.commune, 'Chamkarmon'),
    COALESCE(ca.district, 'Chamkarmon'),
    COALESCE(ca.province, 'Phnom Penh'),
    COALESCE(ca.street_number, '123'),
    COALESCE(ca.house_number, 'House 1'),
    COALESCE(ca.note, 'Delivery address'),
    COALESCE(ca.latitude::numeric, 11.5564),
    COALESCE(ca.longitude::numeric, 104.9282),
    ca.id,
    COALESCE(
        (SELECT json_agg(image_url ORDER BY created_at)::jsonb
         FROM location_images li
         WHERE li.location_id = ca.id AND li.is_deleted = false),
        '[]'::jsonb
    )
FROM orders o
CROSS JOIN (
    SELECT id, village, commune, district, province, street_number, house_number, note, latitude, longitude
    FROM customer_addresses
    WHERE is_deleted = false
    ORDER BY created_at ASC
    LIMIT 1
) ca
WHERE NOT EXISTS (
    SELECT 1 FROM order_delivery_addresses oda WHERE oda.order_id = o.id
);

-- ============================================================================
-- Final verification
-- ============================================================================

SELECT '===== FINAL VERIFICATION =====' as separator;
SELECT
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM order_delivery_addresses WHERE is_deleted = false) as delivery_addresses,
    CASE
        WHEN (SELECT COUNT(*) FROM orders) = (SELECT COUNT(*) FROM order_delivery_addresses WHERE is_deleted = false)
        THEN 'SUCCESS: All orders have delivery addresses!'
        ELSE 'ISSUE: Mismatch in order and delivery address counts'
    END as status;
