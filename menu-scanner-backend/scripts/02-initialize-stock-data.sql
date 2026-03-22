-- =====================================================
-- STOCK MANAGEMENT SYSTEM - INITIALIZE DATA
-- =====================================================
-- This script initializes stock records for all existing products
-- Run AFTER 01-create-stock-tables.sql

-- =====================================================
-- STEP 1: Initialize stock for products WITHOUT sizes
-- =====================================================
INSERT INTO product_stock (
    business_id,
    product_id,
    product_size_id,
    quantity_on_hand,
    quantity_reserved,
    quantity_available,
    minimum_stock_level,
    reorder_quantity,
    price_in,
    price_out,
    cost_per_unit,
    date_in,
    is_active,
    is_expired,
    track_inventory,
    created_at,
    updated_at
)
SELECT
    p.business_id,
    p.id,
    NULL as product_size_id,
    999 as quantity_on_hand,
    0 as quantity_reserved,
    999 as quantity_available,
    5 as minimum_stock_level,
    20 as reorder_quantity,
    0.00 as price_in,
    p.price as price_out,
    0.00 as cost_per_unit,
    CURRENT_TIMESTAMP as date_in,
    true as is_active,
    false as is_expired,
    false as track_inventory,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM products p
WHERE p.is_deleted = false
    AND p.business_id IS NOT NULL
    AND p.has_sizes = false
    AND NOT EXISTS (
        SELECT 1 FROM product_stock ps
        WHERE ps.product_id = p.id
            AND ps.product_size_id IS NULL
            AND ps.business_id = p.business_id
    )
ON CONFLICT (product_id, product_size_id, business_id) DO NOTHING;

SELECT 'Products WITHOUT sizes initialized: ' ||
    (SELECT COUNT(*) FROM product_stock WHERE product_size_id IS NULL AND track_inventory = false) ||
    ' records' as step1_result;

-- =====================================================
-- STEP 2: Initialize stock for each product size
-- =====================================================
INSERT INTO product_stock (
    business_id,
    product_id,
    product_size_id,
    quantity_on_hand,
    quantity_reserved,
    quantity_available,
    minimum_stock_level,
    reorder_quantity,
    price_in,
    price_out,
    cost_per_unit,
    barcode,
    date_in,
    is_active,
    is_expired,
    track_inventory,
    created_at,
    updated_at
)
SELECT
    p.business_id,
    p.id,
    psz.id as product_size_id,
    999 as quantity_on_hand,
    0 as quantity_reserved,
    999 as quantity_available,
    5 as minimum_stock_level,
    20 as reorder_quantity,
    0.00 as price_in,
    psz.price as price_out,
    0.00 as cost_per_unit,
    psz.barcode,
    CURRENT_TIMESTAMP as date_in,
    true as is_active,
    false as is_expired,
    false as track_inventory,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM products p
JOIN product_sizes psz ON p.id = psz.product_id
WHERE p.is_deleted = false
    AND p.business_id IS NOT NULL
    AND p.has_sizes = true
    AND NOT EXISTS (
        SELECT 1 FROM product_stock ps
        WHERE ps.product_id = p.id
            AND ps.product_size_id = psz.id
            AND ps.business_id = p.business_id
    )
ON CONFLICT (product_id, product_size_id, business_id) DO NOTHING;

SELECT 'Products WITH sizes initialized: ' ||
    (SELECT COUNT(*) FROM product_stock WHERE product_size_id IS NOT NULL AND track_inventory = false) ||
    ' records' as step2_result;

-- =====================================================
-- STEP 3: Initialize barcode mappings
-- =====================================================
INSERT INTO barcode_mappings (
    business_id,
    product_stock_id,
    barcode,
    barcode_format,
    product_id,
    product_size_id,
    product_name,
    active,
    created_at,
    created_by
)
SELECT
    ps.business_id,
    ps.id,
    ps.barcode,
    'CODE128' as barcode_format,
    ps.product_id,
    ps.product_size_id,
    COALESCE(p.name || ' - ' || psz.name, p.name) as product_name,
    true as active,
    CURRENT_TIMESTAMP as created_at,
    NULL as created_by
FROM product_stock ps
JOIN products p ON ps.product_id = p.id
LEFT JOIN product_sizes psz ON ps.product_size_id = psz.id
WHERE ps.barcode IS NOT NULL
    AND NOT EXISTS (
        SELECT 1 FROM barcode_mappings bm
        WHERE bm.barcode = ps.barcode
            AND bm.business_id = ps.business_id
    )
ON CONFLICT (barcode) DO NOTHING;

SELECT 'Barcode mappings created: ' ||
    (SELECT COUNT(*) FROM barcode_mappings) ||
    ' records' as step3_result;

-- =====================================================
-- STEP 4: Initialize business settings
-- =====================================================
UPDATE business_settings
SET
    enable_stock_tracking = false,
    stock_alert_threshold = 5,
    require_stock_before_order = true,
    auto_restock_alert = false,
    barcode_enabled = false,
    stock_history_retention_days = 365
WHERE enable_stock_tracking IS NULL;

SELECT 'Business settings updated: ' ||
    (SELECT COUNT(*) FROM business_settings WHERE enable_stock_tracking = false) ||
    ' businesses' as step4_result;

-- =====================================================
-- STEP 5: Create initial stock movements for tracking
-- =====================================================
INSERT INTO stock_movements (
    business_id,
    product_stock_id,
    movement_type,
    quantity_change,
    previous_quantity,
    new_quantity,
    reference_type,
    reference_id,
    notes,
    initiated_by_name,
    cost_impact,
    unit_price,
    created_at,
    updated_at
)
SELECT
    ps.business_id,
    ps.id,
    'STOCK_CHECK' as movement_type,
    ps.quantity_on_hand as quantity_change,
    0 as previous_quantity,
    ps.quantity_on_hand as new_quantity,
    'MIGRATION' as reference_type,
    NULL as reference_id,
    'Initial stock from data migration' as notes,
    'SYSTEM' as initiated_by_name,
    0.00 as cost_impact,
    ps.price_out as unit_price,
    CURRENT_TIMESTAMP as created_at,
    CURRENT_TIMESTAMP as updated_at
FROM product_stock ps
WHERE NOT EXISTS (
    SELECT 1 FROM stock_movements sm
    WHERE sm.product_stock_id = ps.id
        AND sm.movement_type = 'STOCK_CHECK'
        AND sm.notes LIKE '%Initial stock%'
)
LIMIT 10000; -- Batch insert to avoid overload

SELECT 'Initial stock movements created: ' ||
    (SELECT COUNT(*) FROM stock_movements WHERE notes LIKE '%Initial stock%') ||
    ' movements' as step5_result;

-- =====================================================
-- VERIFICATION REPORT
-- =====================================================
SELECT '==================== STOCK INITIALIZATION COMPLETE ====================' as title;

SELECT
    'TOTAL STOCK RECORDS' as metric,
    COUNT(*) as value
FROM product_stock;

SELECT
    'PRODUCTS TRACKED (track_inventory=true)' as metric,
    COUNT(*) as value
FROM product_stock
WHERE track_inventory = true;

SELECT
    'PRODUCTS NOT TRACKED (track_inventory=false)' as metric,
    COUNT(*) as value
FROM product_stock
WHERE track_inventory = false;

SELECT
    'BARCODE MAPPINGS' as metric,
    COUNT(*) as value
FROM barcode_mappings;

SELECT
    'LOW STOCK PRODUCTS' as metric,
    COUNT(*) as value
FROM v_low_stock_products;

SELECT
    'STOCK MOVEMENTS (INITIAL)' as metric,
    COUNT(*) as value
FROM stock_movements;

SELECT
    'BUSINESSES WITH SETTINGS' as metric,
    COUNT(*) as value
FROM business_settings
WHERE enable_stock_tracking IS NOT NULL;

-- Sample data to verify
SELECT '====================== SAMPLE DATA (First 5 Products) ========================' as title;

SELECT
    ps.id,
    p.name as product_name,
    psz.name as size_name,
    ps.quantity_on_hand,
    ps.minimum_stock_level,
    ps.price_out,
    ps.track_inventory,
    ps.created_at
FROM product_stock ps
JOIN products p ON ps.product_id = p.id
LEFT JOIN product_sizes psz ON ps.product_size_id = psz.id
LIMIT 5;

SELECT '===============================================================================' as complete;
SELECT 'Migration script execution completed successfully!' as status;
