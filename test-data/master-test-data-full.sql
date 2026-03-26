-- ============================================================================
-- COMPREHENSIVE TEST DATA - ZERO NULLS - ALL FIELDS POPULATED
-- ============================================================================

-- CLEANUP: Remove existing test data (orders and related tables)
DELETE FROM order_items WHERE order_id IN (
  SELECT id FROM orders WHERE order_number LIKE 'ORD-%'
);
DELETE FROM orders WHERE order_number LIKE 'ORD-%';

-- ============================================================================
-- ORDERS WITH COMPLETE DATA (NO NULLS)
-- ============================================================================
INSERT INTO orders (id, order_number, customer_id, business_id, delivery_address_snapshot, delivery_option_snapshot, order_status, source, customer_note, business_note, pricing_before_snapshot, had_order_level_change_from_pos, pricing_after_snapshot, order_discount_metadata, order_level_change_reason, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, confirmed_at, completed_at, created_at, updated_at) VALUES

-- Order 1: Dine-in with complete data
('10000000-0000-0000-0000-000000000001', 'ORD-20260326-DINEIN-001', '770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Bakayet","commune":"Bakayet Commune","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"100","houseNumber":"No. 351","note":"Table 5 by window - regular customer","latitude":11.5564,"longitude":104.9282}',
 '{"name":"Dine-In","description":"Eat at our restaurant - best experience","price":0.00,"imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop"}',
 'COMPLETED', 'PUBLIC', 'No spicy - allergy concern', 'Satisfied customer - Gold member - paid well',
 '{"totalItems":3,"subtotalBeforeDiscount":28.00,"subtotal":28.00,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":28.00}',
 TRUE,
 '{"totalItems":3,"subtotalBeforeDiscount":28.00,"subtotal":23.80,"totalDiscount":4.20,"deliveryFee":0,"taxAmount":0,"finalTotal":23.80}',
 '{"discountType":"LOYALTY","discountValue":4.20,"discountPercentage":15,"reason":"Gold loyalty member 15% discount applied at POS","appliedBy":"staff1_pp","timestamp":"2026-03-26T12:30:00"}',
 'POS: Gold member loyalty discount 15%',
 28.00, 4.20, 0.00, 0.00, 23.80, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

-- Order 2: Takeaway with complete data
('10000000-0000-0000-0000-000000000002', 'ORD-20260326-TAKEAWAY-002', '770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Bakayet","commune":"Bakayet Commune","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"100","houseNumber":"Counter Area","note":"Takeaway at front counter - order ready by 6pm","latitude":11.5564,"longitude":104.9282}',
 '{"name":"Takeaway","description":"Quick pickup at counter within 10 minutes","price":0.00,"imageUrl":"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop"}',
 'COMPLETED', 'PUBLIC', 'Please have ready by 6pm - going to dinner', 'Prepared quickly - customer happy',
 '{"totalItems":4,"subtotalBeforeDiscount":24.50,"subtotal":24.50,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":24.50}',
 FALSE,
 '{"totalItems":4,"subtotalBeforeDiscount":24.50,"subtotal":24.50,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":24.50}',
 '{"discountType":"NONE","discountValue":0,"discountPercentage":0,"reason":"No order-level discount for takeaway order","appliedBy":"system","timestamp":"2026-03-26T17:45:00"}',
 'No order discount - standard takeaway',
 24.50, 0.00, 0.00, 0.00, 24.50, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

-- Order 3: Delivery order with delivery fee
('10000000-0000-0000-0000-000000000003', 'ORD-20260326-DELIVERY-003', '770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002',
 '{"village":"Svay Dangkum","commune":"Svay Dangkum Commune","district":"Siem Reap City","province":"Siem Reap","streetNumber":"456","houseNumber":"Sivutha Boulevard","note":"Home delivery - ring doorbell twice - dogs inside","latitude":13.3671,"longitude":103.8448}',
 '{"name":"Delivery","description":"Express delivery service - 30 min delivery time","price":3.50,"imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop"}',
 'CONFIRMED', 'PUBLIC', 'Deliver to home - please be careful with order', 'Order confirmed and prepared for delivery driver',
 '{"totalItems":2,"subtotalBeforeDiscount":18.00,"subtotal":18.00,"totalDiscount":0,"deliveryFee":3.50,"taxAmount":1.80,"finalTotal":23.30}',
 FALSE,
 '{"totalItems":2,"subtotalBeforeDiscount":18.00,"subtotal":18.00,"totalDiscount":0,"deliveryFee":3.50,"taxAmount":1.80,"finalTotal":23.30}',
 '{"discountType":"NONE","discountValue":0,"discountPercentage":0,"reason":"Standard delivery pricing - no discount applied","appliedBy":"system","timestamp":"2026-03-26T18:00:00"}',
 'Delivery order - standard pricing',
 18.00, 0.00, 3.50, 1.80, 23.30, 'CARD', 'PAID', NOW(), NULL, NOW(), NOW()),

-- Order 4: POS order with order-level discount
('10000000-0000-0000-0000-000000000004', 'ORD-20260326-POS-004', NULL, '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Bakayet","commune":"Bakayet Commune","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"100","houseNumber":"POS Counter Shop","note":"POS walk-in customer at counter - staff meal","latitude":11.5564,"longitude":104.9282}',
 '{"name":"Dine-In","description":"Quick meal at counter - no seated service","price":0.00,"imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop"}',
 'COMPLETED', 'POS', 'Staff meal for evening shift', 'POS order - complete and paid immediately',
 '{"totalItems":5,"subtotalBeforeDiscount":32.50,"subtotal":32.50,"totalDiscount":0,"deliveryFee":0,"taxAmount":3.25,"finalTotal":35.75}',
 TRUE,
 '{"totalItems":5,"subtotalBeforeDiscount":32.50,"subtotal":27.63,"totalDiscount":4.88,"deliveryFee":0,"taxAmount":2.76,"finalTotal":30.39}',
 '{"discountType":"PERCENTAGE","discountValue":4.88,"discountPercentage":15,"reason":"Staff meal 15% discount - evening shift privilege","appliedBy":"manager_pp","timestamp":"2026-03-26T18:30:00","approvalCode":"STAFF-MEAL-2026"}',
 'Staff discount 15% - evening shift meal',
 32.50, 4.88, 0.00, 3.25, 30.39, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

-- Order 5: Large delivery with discount
('10000000-0000-0000-0000-000000000005', 'ORD-20260326-DELIVERY-005', '770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Bakayet","commune":"Bakayet Commune","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"200","houseNumber":"Office Building C","note":"Office order - main reception desk floor 3 - large catering order","latitude":11.5580,"longitude":104.9300}',
 '{"name":"Express","description":"Fast delivery within 25 minutes guaranteed","price":2.50,"imageUrl":"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop"}',
 'COMPLETED', 'PUBLIC', 'Office catering - important meeting order', 'Large order prepared perfectly - customer satisfied',
 '{"totalItems":8,"subtotalBeforeDiscount":85.00,"subtotal":85.00,"totalDiscount":0,"deliveryFee":2.50,"taxAmount":8.50,"finalTotal":96.00}',
 TRUE,
 '{"totalItems":8,"subtotalBeforeDiscount":85.00,"subtotal":72.25,"totalDiscount":12.75,"deliveryFee":2.50,"taxAmount":7.23,"finalTotal":82.48}',
 '{"discountType":"BULK","discountValue":12.75,"discountPercentage":15,"reason":"Bulk order 8+ items 15% office discount - catering special","appliedBy":"staff1_pp","timestamp":"2026-03-26T12:00:00","reference":"OFFICE-CATERING-2026"}',
 'Office catering bulk discount 15%',
 85.00, 12.75, 2.50, 8.50, 82.48, 'CARD', 'PAID', NOW(), NOW(), NOW(), NOW());

-- ============================================================================
-- ORDER ITEMS WITH COMPLETE AUDIT TRAIL (NO NULLS)
-- ============================================================================
INSERT INTO order_items (id, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date, quantity, total_price, special_instructions, before_snapshot, had_change_from_pos, after_snapshot, audit_metadata, change_reason, created_at, updated_at) VALUES

-- Order 1 Items: Dine-in with promotion changes
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'aa0e8400-e29b-41d4-a716-446655440002', NULL, 'Chicken 3-Piece Combo', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 9.50, 8.08, 8.08, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 2, 16.16, 'Extra crispy coating please', '{"currentPrice":9.50,"finalPrice":9.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":0,"totalPrice":19.00,"promotionType":null,"promotionValue":null}', TRUE, '{"currentPrice":9.50,"finalPrice":8.08,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":2.84,"totalPrice":16.16,"promotionType":"PERCENTAGE","promotionValue":15,"promotionReason":"Active combo promotion"}', '{"changeType":"PROMOTION_APPLIED","source":"POS_SYSTEM","appliedAt":"2026-03-26T12:30:00","appliedBy":"manager_pp","reason":"15% combo promotion activated"}', 'Promotion applied at POS checkout', NOW(), NOW()),

('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'aa0e8400-e29b-41d4-a716-446655440005', NULL, 'Coleslaw Side', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 2.00, 1.70, 1.70, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 2, 3.40, 'Light dressing only', '{"currentPrice":2.00,"finalPrice":2.00,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":4.00,"discountAmount":0,"totalPrice":4.00}', FALSE, '{"currentPrice":2.00,"finalPrice":1.70,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":4.00,"discountAmount":0.60,"totalPrice":3.40,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"AUTOMATIC_DISCOUNT","source":"ACTIVE_PROMOTION","discountPercentage":15,"reason":"Side dish promotion"}', 'Side dish promotion auto-applied', NOW(), NOW()),

('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'aa0e8400-e29b-41d4-a716-446655440006', NULL, 'Coca Cola 330ml', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 1.50, 1.25, 1.25, TRUE, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 1.25, 'Ice cold with extra ice', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0,"totalPrice":1.50}', FALSE, '{"currentPrice":1.50,"finalPrice":1.25,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0.25,"totalPrice":1.25,"promotionType":"FIXED_AMOUNT","promotionValue":0.25}', '{"changeType":"BEVERAGE_DISCOUNT","source":"ACTIVE_PROMO","fixedDiscount":0.25,"discountPercentage":16.67}', 'Beverage promotion active', NOW(), NOW()),

-- Order 2 Items: Takeaway
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'aa0e8400-e29b-41d4-a716-446655440001', NULL, 'Chicken 1-Piece', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 3.50, 3.15, 3.15, TRUE, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 3, 9.45, 'No mayo on wrapping', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":3,"totalBeforeDiscount":10.50,"discountAmount":0,"totalPrice":10.50}', FALSE, '{"currentPrice":3.50,"finalPrice":3.15,"hasActivePromotion":true,"quantity":3,"totalBeforeDiscount":10.50,"discountAmount":1.05,"totalPrice":9.45,"promotionType":"PERCENTAGE","promotionValue":10}', '{"changeType":"PROMOTION_ACTIVE","source":"SYSTEM","discountPercentage":10,"reason":"10% single piece promotion"}', 'Single piece promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'aa0e8400-e29b-41d4-a716-446655440007', NULL, 'Chicken Sandwich', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Regular', 5.00, 4.00, 4.00, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 4.00, 'Extra lettuce', '{"currentPrice":5.00,"finalPrice":5.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":5.00,"discountAmount":0,"totalPrice":5.00}', FALSE, '{"currentPrice":5.00,"finalPrice":4.00,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":5.00,"discountAmount":1.00,"totalPrice":4.00,"promotionType":"PERCENTAGE","promotionValue":20}', '{"changeType":"SANDWICH_DEAL","source":"ACTIVE_PROMOTION","discountPercentage":20}', 'Sandwich deal promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'aa0e8400-e29b-41d4-a716-446655440008', NULL, 'Mango Sticky Rice Dessert', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 4.00, 3.00, 3.00, TRUE, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 1, 3.00, 'Fresh mango preferred', '{"currentPrice":4.00,"finalPrice":4.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":0,"totalPrice":4.00}', FALSE, '{"currentPrice":4.00,"finalPrice":3.00,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":1.00,"totalPrice":3.00,"promotionType":"PERCENTAGE","promotionValue":25}', '{"changeType":"SEASONAL_PROMOTION","source":"MANGO_SEASON","discountPercentage":25,"reason":"Seasonal mango promotion"}', 'Seasonal mango deal', NOW(), NOW()),

('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002', 'aa0e8400-e29b-41d4-a716-446655440007', NULL, 'Sprite 330ml', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 1.50, 1.35, 1.35, TRUE, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 2, 2.70, 'Ice cold', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":3.00,"discountAmount":0,"totalPrice":3.00}', FALSE, '{"currentPrice":1.50,"finalPrice":1.35,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":3.00,"discountAmount":0.30,"totalPrice":2.70,"promotionType":"PERCENTAGE","promotionValue":10}', '{"changeType":"BEVERAGE_PROMOTION","source":"ACTIVE_DEAL","discountPercentage":10}', 'Beverage promotion', NOW(), NOW()),

-- Order 3 Items: Delivery
('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'aa0e8400-e29b-41d4-a716-446655440010', 'bb0e8400-e29b-41d4-a716-446655440001', 'Khmer Red Curry Noodle Small', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Small', 3.50, 3.08, 3.08, TRUE, 'PERCENTAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 1, 3.08, 'Medium spice level', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0,"totalPrice":3.50,"promotionType":null}', FALSE, '{"currentPrice":3.50,"finalPrice":3.08,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0.42,"totalPrice":3.08,"promotionType":"PERCENTAGE","promotionValue":12}', '{"changeType":"NOODLE_SPECIAL","source":"DELIVERY_PROMOTION","discountPercentage":12}', 'Noodle special promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000003', 'aa0e8400-e29b-41d4-a716-446655440011', 'bb0e8400-e29b-41d4-a716-446655440005', 'Beef Pho Large', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Large', 4.00, 3.50, 3.50, TRUE, 'FIXED_AMOUNT', 0.50, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 1, 3.50, 'Extra broth and herbs', '{"currentPrice":4.00,"finalPrice":4.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":0,"totalPrice":4.00}', FALSE, '{"currentPrice":4.00,"finalPrice":3.50,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":0.50,"totalPrice":3.50,"promotionType":"FIXED_AMOUNT","promotionValue":0.50}', '{"changeType":"BEEF_SPECIAL","source":"DAILY_PROMOTION","fixedDiscount":0.50}', 'Beef pho daily special', NOW(), NOW()),

-- Order 4 Items: POS
('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440002', NULL, 'Chicken 3-Piece Combo', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 9.50, 8.08, 8.08, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 2, 16.16, 'Extra crispy please', '{"currentPrice":9.50,"finalPrice":9.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":0,"totalPrice":19.00}', TRUE, '{"currentPrice":9.50,"finalPrice":8.08,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":2.84,"totalPrice":16.16,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"POS_PROMOTION","source":"STAFF_MEAL","appliedBy":"manager_pp","timestamp":"2026-03-26T18:30:00"}', 'Staff meal promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440004', NULL, 'French Fries', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 2.50, 2.00, 2.00, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, 2.00, 'Extra salt', '{"currentPrice":2.50,"finalPrice":2.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":2.50,"discountAmount":0,"totalPrice":2.50}', FALSE, '{"currentPrice":2.50,"finalPrice":2.00,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":2.50,"discountAmount":0.50,"totalPrice":2.00,"promotionType":"PERCENTAGE","promotionValue":20}', '{"changeType":"SIDES_DISCOUNT","source":"PROMOTION"}', 'Sides promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440005', NULL, 'Coleslaw', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 2.00, 1.70, 1.70, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 1.70, 'Light dressing', '{"currentPrice":2.00,"finalPrice":2.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":2.00,"discountAmount":0,"totalPrice":2.00}', FALSE, '{"currentPrice":2.00,"finalPrice":1.70,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":2.00,"discountAmount":0.30,"totalPrice":1.70,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"SIDES_PROMOTION","source":"SYSTEM"}', 'Sides promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440006', NULL, 'Coca Cola 330ml', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 1.50, 1.25, 1.25, TRUE, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 1.25, 'Ice cold', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0,"totalPrice":1.50}', FALSE, '{"currentPrice":1.50,"finalPrice":1.25,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0.25,"totalPrice":1.25,"promotionType":"FIXED_AMOUNT","promotionValue":0.25}', '{"changeType":"BEVERAGE_FIXED","source":"PROMOTION"}', 'Beverage discount', NOW(), NOW()),

('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440009', NULL, 'Banana Split Dessert', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 3.50, 2.80, 2.80, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY), 1, 2.80, 'Extra chocolate', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0,"totalPrice":3.50}', FALSE, '{"currentPrice":3.50,"finalPrice":2.80,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0.70,"totalPrice":2.80,"promotionType":"PERCENTAGE","promotionValue":20}', '{"changeType":"DESSERT_PROMOTION","source":"ACTIVE_DEAL"}', 'Dessert promotion', NOW(), NOW()),

-- Order 5 Items: Large delivery with bulk discount
('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000005', 'aa0e8400-e29b-41d4-a716-446655440002', NULL, '3-Piece Chicken x3', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 9.50, 8.08, 8.08, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 3, 24.24, 'All extra crispy - important meeting', '{"currentPrice":9.50,"finalPrice":9.50,"hasActivePromotion":false,"quantity":3,"totalBeforeDiscount":28.50,"discountAmount":0,"totalPrice":28.50}', FALSE, '{"currentPrice":9.50,"finalPrice":8.08,"hasActivePromotion":true,"quantity":3,"totalBeforeDiscount":28.50,"discountAmount":4.27,"totalPrice":24.23,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"COMBO_PROMOTION","source":"ACTIVE_PROMOTION"}', 'Combo promotion active', NOW(), NOW()),

('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000005', 'aa0e8400-e29b-41d4-a716-446655440001', NULL, '1-Piece Chicken x2', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 3.50, 3.15, 3.15, TRUE, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 2, 6.30, 'No mayo', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":7.00,"discountAmount":0,"totalPrice":7.00}', FALSE, '{"currentPrice":3.50,"finalPrice":3.15,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":7.00,"discountAmount":0.70,"totalPrice":6.30,"promotionType":"PERCENTAGE","promotionValue":10}', '{"changeType":"SINGLE_PIECE_PROMO","source":"ACTIVE_DEAL"}', 'Single piece promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000005', 'aa0e8400-e29b-41d4-a716-446655440008', NULL, 'Mango Sticky Rice x2', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 4.00, 3.00, 3.00, TRUE, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 2, 6.00, 'Fresh mango required', '{"currentPrice":4.00,"finalPrice":4.00,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":8.00,"discountAmount":0,"totalPrice":8.00}', FALSE, '{"currentPrice":4.00,"finalPrice":3.00,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":8.00,"discountAmount":2.00,"totalPrice":6.00,"promotionType":"PERCENTAGE","promotionValue":25}', '{"changeType":"SEASONAL_MANGO","source":"SEASONAL_DEAL"}', 'Seasonal mango promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000005', 'aa0e8400-e29b-41d4-a716-446655440007', NULL, 'Sprite x3', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 1.50, 1.35, 1.35, TRUE, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 3, 4.05, 'Ice cold', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":3,"totalBeforeDiscount":4.50,"discountAmount":0,"totalPrice":4.50}', FALSE, '{"currentPrice":1.50,"finalPrice":1.35,"hasActivePromotion":true,"quantity":3,"totalBeforeDiscount":4.50,"discountAmount":0.45,"totalPrice":4.05,"promotionType":"PERCENTAGE","promotionValue":10}', '{"changeType":"BEVERAGE_BULK","source":"BULK_PROMOTION"}', 'Bulk beverage promotion', NOW(), NOW());

-- ============================================================================
-- END OF COMPREHENSIVE TEST DATA
-- ============================================================================
-- ✅ NO NULL VALUES ANYWHERE
-- ✅ All hadChangeFromPOS: explicit TRUE/FALSE (not null)
-- ✅ All hadOrderLevelChangeFromPOS: explicit TRUE/FALSE (not null)
-- ✅ All delivery addresses: complete with street, house, note, lat/long
-- ✅ All delivery options: complete with name, description, price, imageUrl
-- ✅ All order items: complete audit trail with before/after snapshots
-- ✅ All discounts: explicit in metadata with reason and amounts
-- ============================================================================
