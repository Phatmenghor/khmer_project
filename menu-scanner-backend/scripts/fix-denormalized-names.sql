-- IMMEDIATE FIX: Populate denormalized names for all existing products
-- Run this directly in pgAdmin to populate categoryName, brandName, businessName

-- Step 1: Update with JOIN to category and brand
UPDATE products p SET
    category_name = c.name,
    brand_name = COALESCE(b.name, 'Unknown Brand'),
    business_name = 'Phatmenghor Business'
FROM categories c
LEFT JOIN brands b ON p.brand_id = b.id
WHERE p.category_id = c.id
  AND p.is_deleted = false;

-- Step 2: Verify all products have names populated
SELECT 'Verification Results:' as status;
SELECT
    COUNT(*) as total_products,
    COUNT(CASE WHEN category_name IS NOT NULL THEN 1 END) as with_category,
    COUNT(CASE WHEN brand_name IS NOT NULL THEN 1 END) as with_brand,
    COUNT(CASE WHEN business_name IS NOT NULL THEN 1 END) as with_business
FROM products
WHERE is_deleted = false;

-- Step 3: Show sample products
SELECT id, name, category_name, brand_name, business_name
FROM products
WHERE is_deleted = false
LIMIT 10;

-- If any products still have NULL names, run this:
-- UPDATE products SET business_name = 'Phatmenghor Business' WHERE business_name IS NULL AND is_deleted = false;
