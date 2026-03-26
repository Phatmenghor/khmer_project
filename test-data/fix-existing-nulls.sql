-- ============================================================================
-- FIX ALL NULL VALUES IN EXISTING ORDERS
-- ============================================================================

-- 1. Fix hadChangeFromPOS nulls - set to FALSE for all existing orders
UPDATE order_items
SET had_change_from_pos = FALSE
WHERE had_change_from_pos IS NULL;

-- 2. Fix hadOrderLevelChangeFromPOS nulls - set to FALSE for all existing orders
UPDATE orders
SET had_order_level_change_from_pos = FALSE
WHERE had_order_level_change_from_pos IS NULL;

-- 3. Fix orderLevelChangeReason nulls - set default reason
UPDATE orders
SET order_level_change_reason = 'No order-level changes applied'
WHERE order_level_change_reason IS NULL AND had_order_level_change_from_pos = FALSE;

-- 4. Fix delivery address nulls - update all with complete data
UPDATE orders
SET delivery_address_snapshot = JSON_SET(
  delivery_address_snapshot,
  '$.note', 'Standard delivery location',
  '$.latitude', 11.5564,
  '$.longitude', 104.9282
)
WHERE delivery_address_snapshot IS NOT NULL
  AND (JSON_EXTRACT(delivery_address_snapshot, '$.note') IS NULL
       OR JSON_EXTRACT(delivery_address_snapshot, '$.latitude') IS NULL
       OR JSON_EXTRACT(delivery_address_snapshot, '$.longitude') IS NULL);

-- 5. For any delivery addresses missing streetNumber or houseNumber, add defaults
UPDATE orders
SET delivery_address_snapshot = JSON_SET(
  delivery_address_snapshot,
  '$.streetNumber', COALESCE(JSON_EXTRACT(delivery_address_snapshot, '$.streetNumber'), '1'),
  '$.houseNumber', COALESCE(JSON_EXTRACT(delivery_address_snapshot, '$.houseNumber'), 'Main'),
  '$.note', COALESCE(JSON_EXTRACT(delivery_address_snapshot, '$.note'), 'Standard delivery location')
)
WHERE delivery_address_snapshot IS NOT NULL;

-- 6. Fix delivery option nulls - add description and imageUrl where missing
UPDATE orders
SET delivery_option_snapshot = JSON_SET(
  delivery_option_snapshot,
  '$.description', COALESCE(
    JSON_EXTRACT(delivery_option_snapshot, '$.description'),
    CASE
      WHEN JSON_EXTRACT(delivery_option_snapshot, '$.name') = 'Dine-In' THEN 'Eat at our restaurant for best experience'
      WHEN JSON_EXTRACT(delivery_option_snapshot, '$.name') = 'Pickup' THEN 'Quick pickup at counter within 10 minutes'
      WHEN JSON_EXTRACT(delivery_option_snapshot, '$.name') = 'Delivery' THEN 'Home delivery service available'
      WHEN JSON_EXTRACT(delivery_option_snapshot, '$.name') = 'Express' THEN 'Fast delivery within 25 minutes guaranteed'
      WHEN JSON_EXTRACT(delivery_option_snapshot, '$.name') = 'Takeaway' THEN 'Quick pickup at counter for on-the-go'
      ELSE 'Standard delivery option'
    END
  ),
  '$.imageUrl', COALESCE(
    JSON_EXTRACT(delivery_option_snapshot, '$.imageUrl'),
    'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop'
  ),
  '$.price', COALESCE(JSON_EXTRACT(delivery_option_snapshot, '$.price'), 0)
)
WHERE delivery_option_snapshot IS NOT NULL;

-- 7. Fix order_discount_metadata nulls
UPDATE orders
SET order_discount_metadata = JSON_OBJECT(
  'discountType', 'NONE',
  'discountValue', 0,
  'discountPercentage', 0,
  'reason', 'No order-level discount applied'
)
WHERE order_discount_metadata IS NULL AND discount_amount = 0;

-- 8. Fix before/after snapshots in order_items - if null, use current data
UPDATE order_items
SET before_snapshot = JSON_OBJECT(
  'currentPrice', current_price,
  'finalPrice', final_price,
  'hasActivePromotion', COALESCE(has_promotion, FALSE),
  'quantity', quantity,
  'totalBeforeDiscount', (current_price * quantity),
  'discountAmount', 0,
  'totalPrice', (current_price * quantity),
  'promotionType', promotion_type,
  'promotionValue', promotion_value
)
WHERE before_snapshot IS NULL;

-- 9. Fix after snapshots in order_items
UPDATE order_items
SET after_snapshot = JSON_OBJECT(
  'currentPrice', current_price,
  'finalPrice', final_price,
  'hasActivePromotion', COALESCE(has_promotion, FALSE),
  'quantity', quantity,
  'totalBeforeDiscount', (current_price * quantity),
  'discountAmount', (current_price - final_price) * quantity,
  'totalPrice', (final_price * quantity),
  'promotionType', promotion_type,
  'promotionValue', promotion_value
)
WHERE after_snapshot IS NULL;

-- 10. Verify results
SELECT COUNT(*) as total_orders,
       SUM(CASE WHEN had_order_level_change_from_pos IS NULL THEN 1 ELSE 0 END) as null_order_change_count,
       SUM(CASE WHEN order_level_change_reason IS NULL THEN 1 ELSE 0 END) as null_order_reason_count,
       SUM(CASE WHEN JSON_EXTRACT(delivery_address_snapshot, '$.note') IS NULL THEN 1 ELSE 0 END) as null_note_count,
       SUM(CASE WHEN JSON_EXTRACT(delivery_option_snapshot, '$.description') IS NULL THEN 1 ELSE 0 END) as null_description_count
FROM orders;

SELECT COUNT(*) as total_items,
       SUM(CASE WHEN had_change_from_pos IS NULL THEN 1 ELSE 0 END) as null_hadchange_count,
       SUM(CASE WHEN before_snapshot IS NULL THEN 1 ELSE 0 END) as null_before_count,
       SUM(CASE WHEN after_snapshot IS NULL THEN 1 ELSE 0 END) as null_after_count
FROM order_items;

-- ============================================================================
-- Summary: All NULL values should now be fixed with proper defaults
-- ============================================================================
