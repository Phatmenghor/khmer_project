-- ============================================================================
-- Manually populate order_delivery_addresses from existing orders and locations
-- Run this after comprehensive-test-data.sql if order_delivery_addresses is empty
-- ============================================================================

-- Clear existing data first (optional - comment out if you want to keep existing)
-- TRUNCATE TABLE order_delivery_addresses CASCADE;

-- Get all locations
WITH location_list AS (
    SELECT
        id, village, commune, district, province, street_number, house_number, note, latitude, longitude,
        ROW_NUMBER() OVER (ORDER BY id) as loc_idx
    FROM customer_addresses
    WHERE is_deleted = false
),
location_count AS (
    SELECT COUNT(*) as total_locations FROM location_list
),
location_images_json AS (
    SELECT location_id, json_agg(image_url ORDER BY created_at) as images
    FROM location_images
    GROUP BY location_id
),
order_list AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY id) as order_idx
    FROM orders
)
INSERT INTO order_delivery_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, village, commune, district, province, street_number, house_number, note, latitude, longitude, location_id, location_images)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    l.village, l.commune, l.district, l.province, l.street_number, l.house_number, l.note, l.latitude, l.longitude,
    l.id,
    COALESCE(lij.images, '[]'::json)
FROM order_list o
CROSS JOIN location_count lc
JOIN location_list l ON l.loc_idx = ((o.order_idx - 1) % lc.total_locations) + 1
LEFT JOIN location_images_json lij ON lij.location_id = l.id
WHERE NOT EXISTS (
    SELECT 1 FROM order_delivery_addresses WHERE order_id = o.id
);

-- Verify the insertion
SELECT 'Order Delivery Addresses inserted:' as status, COUNT(*) as count FROM order_delivery_addresses;
SELECT 'Sample delivery address:' as status;
SELECT oda.id, oda.order_id, oda.village, oda.location_id, jsonb_array_length(oda.location_images) as image_count
FROM order_delivery_addresses oda
LIMIT 3;
