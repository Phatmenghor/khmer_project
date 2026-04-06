-- ============================================================================
-- Emergency fix: Simple direct INSERT for order_delivery_addresses
-- Run this if comprehensive-test-data.sql doesn't populate delivery addresses
-- ============================================================================

-- First, clear existing empty records
DELETE FROM order_delivery_addresses WHERE location_id IS NULL AND village IS NULL;

-- Simple approach: Get first location and use for all orders that don't have delivery address yet
WITH first_location AS (
    SELECT id, village, commune, district, province, street_number, house_number, note, latitude, longitude
    FROM customer_addresses
    WHERE is_deleted = false
    ORDER BY id
    LIMIT 1
),
all_locations AS (
    SELECT
        id, village, commune, district, province, street_number, house_number, note, latitude, longitude,
        ROW_NUMBER() OVER (ORDER BY id) as loc_rn,
        COUNT(*) OVER() as total_locs
    FROM customer_addresses
    WHERE is_deleted = false
),
location_images_agg AS (
    SELECT location_id, json_agg(image_url ORDER BY created_at)::jsonb as images
    FROM location_images
    GROUP BY location_id
),
orders_to_fill AS (
    SELECT o.id, ROW_NUMBER() OVER (ORDER BY o.id) as order_rn
    FROM orders o
    WHERE NOT EXISTS (
        SELECT 1 FROM order_delivery_addresses oda WHERE oda.order_id = o.id
    )
)
INSERT INTO order_delivery_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, village, commune, district, province, street_number, house_number, note, latitude, longitude, location_id, location_images)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    al.village, al.commune, al.district, al.province, al.street_number, al.house_number, al.note, al.latitude, al.longitude,
    al.id,
    COALESCE(lia.images, '[]'::jsonb)
FROM orders_to_fill o
CROSS JOIN (SELECT COUNT(*) as total_locs FROM customer_addresses WHERE is_deleted = false) lc
JOIN all_locations al ON al.loc_rn = ((o.order_rn - 1) % al.total_locs) + 1
LEFT JOIN location_images_agg lia ON lia.location_id = al.id;

-- Verify
SELECT 'Delivery addresses inserted: ' || COUNT(*)::text as status FROM order_delivery_addresses;
SELECT 'Orders with delivery address: ' || COUNT(*)::text as status
FROM orders o
JOIN order_delivery_addresses oda ON o.id = oda.order_id;
