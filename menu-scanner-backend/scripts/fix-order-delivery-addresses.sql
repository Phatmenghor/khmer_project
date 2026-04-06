-- ============================================================================
-- Emergency fix: Simple direct INSERT for order_delivery_addresses
-- Run this if comprehensive-test-data.sql doesn't populate delivery addresses
-- ============================================================================

-- First, clear existing records
TRUNCATE TABLE order_delivery_addresses;

-- Get all locations with NO NULL values guaranteed
WITH all_locations AS (
    SELECT
        id,
        COALESCE(village, 'Village Default') as village,
        COALESCE(commune, 'Commune Default') as commune,
        COALESCE(district, 'District Default') as district,
        COALESCE(province, 'Province Default') as province,
        COALESCE(street_number, 'Street 1') as street_number,
        COALESCE(house_number, 'House 1') as house_number,
        COALESCE(note, 'Delivery address') as note,
        COALESCE(latitude, 11.5564::numeric(10,6)) as latitude,
        COALESCE(longitude, 104.9282::numeric(10,6)) as longitude,
        ROW_NUMBER() OVER (ORDER BY id) as loc_rn,
        COUNT(*) OVER() as total_locs
    FROM customer_addresses
    WHERE is_deleted = false
),
location_images_agg AS (
    SELECT location_id, COALESCE(json_agg(image_url ORDER BY created_at)::jsonb, '[]'::jsonb) as images
    FROM location_images
    GROUP BY location_id
),
orders_to_fill AS (
    SELECT o.id, ROW_NUMBER() OVER (ORDER BY o.id) as order_rn
    FROM orders o
)
INSERT INTO order_delivery_addresses (id, version, created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by, order_id, village, commune, district, province, street_number, house_number, note, latitude, longitude, location_id, location_images)
SELECT
    gen_random_uuid(), 0, NOW(), NOW(), 'system', 'system', false, NULL, NULL,
    o.id,
    al.village, al.commune, al.district, al.province, al.street_number, al.house_number, al.note, al.latitude, al.longitude,
    al.id,
    COALESCE(lia.images, '[]'::jsonb)
FROM orders_to_fill o
JOIN all_locations al ON al.loc_rn = ((o.order_rn - 1) % al.total_locs) + 1
LEFT JOIN location_images_agg lia ON lia.location_id = al.id;

-- Verify
SELECT 'Delivery addresses inserted: ' || COUNT(*)::text as status FROM order_delivery_addresses;
SELECT 'Orders with delivery address: ' || COUNT(*)::text as status
FROM orders o
JOIN order_delivery_addresses oda ON o.id = oda.order_id;
