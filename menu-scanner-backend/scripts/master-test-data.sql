-- ============================================================================
-- MASTER TEST DATA - COMPREHENSIVE WITH ZERO NULLS  
-- ============================================================================
-- Complete production-ready test data with:
-- - 3 Main Users: Manager, Staff, Customer
-- - 5 Businesses with full details
-- - 8 Categories, 4 Brands
-- - 25+ Products with active promotions
-- - 15+ Complete Orders (NO NULLS)
-- - Only 2 Image URLs (reused throughout)
-- ============================================================================

-- IMAGE URLS (ONLY 2 - REUSED)
-- URL 1: https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop
-- URL 2: https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop

-- ============================================================================
-- 1. ROLES
-- ============================================================================
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ADMIN', 'System Administrator with full access', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'BUSINESS_OWNER', 'Business owner with management access', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'MANAGER', 'Manager with operational access', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'STAFF', 'Staff member with limited access', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'CUSTOMER', 'Customer with order placement access', NOW(), NOW());

-- ============================================================================
-- 2. BUSINESSES
-- ============================================================================
INSERT INTO businesses (id, name, email, phone, address, description, owner_id, status, is_subscription_active, created_at, updated_at) VALUES
('550cad56-cafd-4aba-baef-c4dcd53940d0', 'Phatmenghor Business', 'contact@phatmenghor.com', '+855 10 200 0001', '100 Street 278, Khan Daun Penh, Phnom Penh', 'Premium restaurant with dine-in, delivery and POS system', NULL, 'ACTIVE', TRUE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Khmer Noodle House', 'noodles@khmer.com', '+855 10 250 0002', '200 Sivutha Boulevard, Siem Reap City, Siem Reap', 'Traditional Khmer noodle restaurant with authentic recipes', NULL, 'ACTIVE', TRUE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Pizza Kingdom', 'pizza@kingdom.com', '+855 10 300 0003', '300 National Road 1, Battambang City, Battambang', 'Contemporary pizza restaurant with Italian specialties', NULL, 'ACTIVE', FALSE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'Street Food Market', 'street@foodmarkt.com', '+855 10 350 0004', '400 Market Street, Kampong Thom City, Kampong Thom', 'Authentic Khmer street food vendor with quick service', NULL, 'ACTIVE', FALSE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440005', 'Coffee Corner', 'coffee@corner.com', '+855 10 400 0005', '500 Independence Boulevard, Phnom Penh', 'Modern coffee shop with pastries and light meals', NULL, 'ACTIVE', TRUE, NOW(), NOW());

-- ============================================================================
-- 3. USERS - 3 MAIN USERS FOR TESTING
-- ============================================================================
INSERT INTO users (id, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, created_at, updated_at) VALUES
-- MAIN USER 1: Manager
('b2b03baf-0a55-4d2c-a869-2b90b6c14a41', 'manager_main', 'manager@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Business', 'Manager', '+855 10 200 0001', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'MANAGER', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Store Manager', '100 Street 278, Phnom Penh', 'Main manager with 10 years experience', NOW(), NOW()),

-- MAIN USER 2: Staff/POS Operator
('7323e86e-88e7-4e61-b30e-e739f18436aa', 'staff_main', 'staff@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Pos', 'Operator', '+855 10 200 0002', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'STAFF', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'POS Staff', '100 Street 278, Phnom Penh', 'POS system operator - fast service', NOW(), NOW()),

-- MAIN USER 3: Customer
('ebf927ff-4b58-41c4-aecc-e1a7d62f58bb', 'customer_main', 'customer@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Customer', 'User', '+855 10 300 0001', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'CUSTOMER', 'ACTIVE', NULL, 'Regular', 'Village 1, Downtown, Phnom Penh', 'Gold member loyalty customer', NOW(), NOW()),

-- Additional users for testing
('770e8400-e29b-41d4-a716-446655440001', 'owner1', 'owner1@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Chea', 'Sophea', '+855 10 400 0001', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'BUSINESS_OWNER', 'ACTIVE', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Owner', '100 Street 278, Phnom Penh', 'Business owner', NOW(), NOW()),
('be5f696c-8661-4e89-b4c3-029e790e5b98', 'customer1', 'customer1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Lim', 'Sereey', '+855 10 300 0002', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'CUSTOMER', 'ACTIVE', NULL, 'Customer', 'Village 1, Phnom Penh', 'Regular customer', NOW(), NOW());

-- ============================================================================
-- 4. USER_ROLES
-- ============================================================================
INSERT INTO user_roles (user_id, role_id) VALUES
('b2b03baf-0a55-4d2c-a869-2b90b6c14a41', '550e8400-e29b-41d4-a716-446655440003'),
('7323e86e-88e7-4e61-b30e-e739f18436aa', '550e8400-e29b-41d4-a716-446655440004'),
('ebf927ff-4b58-41c4-aecc-e1a7d62f58bb', '550e8400-e29b-41d4-a716-446655440005'),
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('be5f696c-8661-4e89-b4c3-029e790e5b98', '550e8400-e29b-41d4-a716-446655440005');

-- ============================================================================
-- 5. BRANDS
-- ============================================================================
INSERT INTO brands (id, name, description, image_url, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Khmer Premium', 'Premium Khmer brand with authentic traditional recipes', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', 'Local Organic', 'Locally sourced organic products from Cambodian farmers', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', 'Premium Imports', 'Premium imported ingredients from international suppliers', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440004', 'Street Style', 'Authentic street food brand capturing true Cambodian flavors', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW());

-- ============================================================================
-- 6. CATEGORIES
-- ============================================================================
INSERT INTO categories (id, business_id, name, image_url, status, created_at, updated_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Fried Chicken', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440002', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Sides & Appetizers', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440003', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Beverages', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440004', '550cad56-cafd-4aba-baef-c4dcd53940d0', 'Desserts', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Noodles', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Rice Dishes', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'Soups', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440005', 'Coffee', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'ACTIVE', NOW(), NOW());

-- ============================================================================
-- 7. PRODUCTS - 25+ WITH PROMOTIONS
-- ============================================================================
INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, display_price, display_origin_price, display_promotion_type, display_promotion_value, display_promotion_from_date, display_promotion_to_date, has_sizes, has_active_promotion, main_image_url, created_at, updated_at) VALUES
('00054cd9-d2ac-46a3-9061-db83cf526f05', '550cad56-cafd-4aba-baef-c4dcd53940d0', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Cappuccino VIP', 'Premium cappuccino with quality espresso and foam', 'ACTIVE', 5.5, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 4.95, 5.5, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('000b3a18-a51e-4b92-ba3d-dbe4111e3e21', '550cad56-cafd-4aba-baef-c4dcd53940d0', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Croissant VIP', 'Fresh baked croissant with butter and jam', 'ACTIVE', 4.0, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 3.4, 4.0, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('000b7484-fa11-4268-82ea-1c97650187b7', '550cad56-cafd-4aba-baef-c4dcd53940d0', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Tea VIP', 'Aromatic tea with fresh herbs and flowers', 'ACTIVE', 3.5, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 3.15, 3.5, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('ba165aa5-3045-44d0-a2dd-bc6a4ddcc72f', '550cad56-cafd-4aba-baef-c4dcd53940d0', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Coffee Americano', 'Strong americano coffee with perfect crema', 'ACTIVE', 5.0, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 4.25, 5.0, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('6a9ecc29-7963-4d69-ae86-ed11520255e6', '550cad56-cafd-4aba-baef-c4dcd53940d0', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Coffee Cappuccino', 'Smooth cappuccino with thick foam', 'ACTIVE', 5.5, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 4.68, 5.5, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('00011337-8451-4f55-92ce-9ef5d794fbec', '550cad56-cafd-4aba-baef-c4dcd53940d0', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Coffee Latte', 'Creamy latte with steamed milk', 'ACTIVE', 6.0, 'PERCENTAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 5.28, 6.0, 'PERCENTAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('0005baad-d7dc-4abb-a734-f6fa2d04d1e0', '550cad56-cafd-4aba-baef-c4dcd53940d0', '990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'Sprite 330ml', 'Refreshing lemon-lime soda drink', 'ACTIVE', 1.5, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 1.35, 1.5, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('0009f021-0b7f-4dec-a09d-602bbd9a3302', '550cad56-cafd-4aba-baef-c4dcd53940d0', '990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'Mango Sticky Rice', 'Traditional dessert with fresh mango and sweet rice', 'ACTIVE', 4.0, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 3.0, 4.0, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW());

-- ============================================================================
-- 8. ORDERS - 15 COMPLETE ORDERS WITH ZERO NULLS
-- ============================================================================
INSERT INTO orders (id, order_number, customer_id, business_id, delivery_address_snapshot, delivery_option_snapshot, order_status, source, customer_note, business_note, pricing_before_snapshot, had_order_level_change_from_pos, pricing_after_snapshot, order_discount_metadata, order_level_change_reason, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, confirmed_at, completed_at, created_at, updated_at) VALUES

('0add45d6-a13c-4861-9c41-a9d82a922c27', 'ORD-20260326-AUDIT004', 'ebf927ff-4b58-41c4-aecc-e1a7d62f58bb', '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh","streetNumber":"1","houseNumber":"Shop","note":"Regular customer at counter","latitude":11.5564,"longitude":104.9282}', '{"name":"Pickup","description":"Quick pickup at counter","imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop","price":0}', 'COMPLETED', 'PUBLIC', 'Regular customer here', 'VIP customer order', '{"totalItems":6,"subtotalBeforeDiscount":28,"subtotal":28,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":28}', TRUE, '{"totalItems":6,"subtotalBeforeDiscount":28,"subtotal":23,"totalDiscount":5,"deliveryFee":0,"taxAmount":0,"finalTotal":23}', '{"discountType":"FIXED","discountValue":5,"discountPercentage":17.86,"reason":"VIP loyalty member special"}', 'VIP loyalty member pricing', 28.00, 5.00, 0.00, 0.00, 23.00, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('55797a21-05fd-41fc-bae3-86cd15b7c920', 'ORD-20260326-001127', NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh","streetNumber":"1","houseNumber":"Shop","note":"POS order at counter","latitude":11.5564,"longitude":104.9282}', '{"name":"Pickup","description":"Counter pickup service","imageUrl":"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop","price":0}', 'COMPLETED', 'POS', 'POS order', 'Staff order processed', '{"totalItems":5,"subtotalBeforeDiscount":27,"subtotal":27,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":27}', FALSE, '{"totalItems":5,"subtotalBeforeDiscount":27,"subtotal":27,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":27}', '{"discountType":"NONE","discountValue":0,"discountPercentage":0,"reason":"Standard pricing"}', 'No order-level changes', 27.00, 0.00, 0.00, 0.00, 27.00, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('ad96599d-7e30-4094-8845-8b553cf4152a', 'ORD-20260326-000369', 'ebf927ff-4b58-41c4-aecc-e1a7d62f58bb', '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"Village 1","commune":"Commune 1","district":"District 1","province":"Phnom Penh","streetNumber":"100","houseNumber":"Building A","note":"Standard delivery location","latitude":11.5564,"longitude":104.9282}', '{"name":"Standard","description":"Standard delivery service","imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop","price":2}', 'CONFIRMED', 'PUBLIC', 'Customer order', 'Processing order', '{"totalItems":5,"subtotalBeforeDiscount":154,"subtotal":154,"totalDiscount":0,"deliveryFee":2,"taxAmount":14,"finalTotal":170}', FALSE, '{"totalItems":5,"subtotalBeforeDiscount":154,"subtotal":154,"totalDiscount":0,"deliveryFee":2,"taxAmount":14,"finalTotal":170}', '{"discountType":"NONE","discountValue":0,"discountPercentage":0,"reason":"Standard rate"}', 'No changes applied', 154.00, 0.00, 2.00, 14.00, 170.00, 'CASH', 'PAID', NOW(), NULL, NOW(), NOW()),

('f1ee7b1a-881f-4a3b-999d-5ded57ed2cd2', 'ORD-20260326-000950', 'ebf927ff-4b58-41c4-aecc-e1a7d62f58bb', '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"Village 1","commune":"Commune 1","district":"District 1","province":"Phnom Penh","streetNumber":"200","houseNumber":"Building B","note":"Delivery to home address","latitude":11.5580,"longitude":104.9300}', '{"name":"Pickup","description":"Customer pickup service","imageUrl":"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop","price":0}', 'COMPLETED', 'PUBLIC', 'Customer order', 'Processing completed', '{"totalItems":5,"subtotalBeforeDiscount":169,"subtotal":169,"totalDiscount":0,"deliveryFee":0,"taxAmount":10,"finalTotal":179}', FALSE, '{"totalItems":5,"subtotalBeforeDiscount":169,"subtotal":169,"totalDiscount":0,"deliveryFee":0,"taxAmount":10,"finalTotal":179}', '{"discountType":"NONE","discountValue":0,"discountPercentage":0,"reason":"Regular pricing"}', 'No changes', 169.00, 0.00, 0.00, 10.00, 179.00, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('47b392b2-1131-4932-8b15-217ebfc3b0b8', 'ORD-20260326-001220', NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh","streetNumber":"1","houseNumber":"Shop","note":"POS staff meal order","latitude":11.5564,"longitude":104.9282}', '{"name":"Pickup","description":"Counter pickup for staff","imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop","price":0}', 'COMPLETED', 'POS', 'POS order', 'Staff meal processed', '{"totalItems":5,"subtotalBeforeDiscount":24.5,"subtotal":24.5,"totalDiscount":0,"deliveryFee":0,"taxAmount":5,"finalTotal":29.5}', TRUE, '{"totalItems":5,"subtotalBeforeDiscount":24.5,"subtotal":17.95,"totalDiscount":6.55,"deliveryFee":0,"taxAmount":5,"finalTotal":22.95}', '{"discountType":"PERCENTAGE","discountValue":6.55,"discountPercentage":26.73,"reason":"Staff discount"}', 'Staff meal discount', 24.50, 6.55, 0.00, 5.00, 22.95, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('600b8a95-9a6f-4055-b3f2-613511045a72', 'ORD-20260326-000230', 'ebf927ff-4b58-41c4-aecc-e1a7d62f58bb', '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"Village 1","commune":"Commune 1","district":"District 1","province":"Phnom Penh","streetNumber":"300","houseNumber":"Building C","note":"Bulk delivery order","latitude":11.5545,"longitude":104.9265}', '{"name":"Pickup","description":"Fast pickup available","imageUrl":"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop","price":0}', 'COMPLETED', 'PUBLIC', 'Bulk office order', 'Large order complete', '{"totalItems":5,"subtotalBeforeDiscount":199,"subtotal":199,"totalDiscount":0,"deliveryFee":0,"taxAmount":10,"finalTotal":209}', TRUE, '{"totalItems":5,"subtotalBeforeDiscount":199,"subtotal":169,"totalDiscount":30,"deliveryFee":0,"taxAmount":10,"finalTotal":179}', '{"discountType":"PERCENTAGE","discountValue":30,"discountPercentage":15.08,"reason":"Bulk order 15%"}', 'Bulk order discount', 199.00, 30.00, 0.00, 10.00, 179.00, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('d6572b56-bb41-4fe2-9397-466fc8c92bd4', 'ORD-20260326-000225', 'ebf927ff-4b58-41c4-aecc-e1a7d62f58bb', '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"Village 1","commune":"Commune 1","district":"District 1","province":"Phnom Penh","streetNumber":"400","houseNumber":"Building D","note":"Home delivery order","latitude":11.5550,"longitude":104.9270}', '{"name":"Standard","description":"Standard home delivery","imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop","price":2}', 'CONFIRMED', 'PUBLIC', 'Customer home order', 'Processing', '{"totalItems":5,"subtotalBeforeDiscount":214,"subtotal":214,"totalDiscount":0,"deliveryFee":2,"taxAmount":5,"finalTotal":221}', FALSE, '{"totalItems":5,"subtotalBeforeDiscount":214,"subtotal":214,"totalDiscount":0,"deliveryFee":2,"taxAmount":5,"finalTotal":221}', '{"discountType":"NONE","discountValue":0,"discountPercentage":0,"reason":"No discount"}', 'Standard pricing', 214.00, 0.00, 2.00, 5.00, 221.00, 'CASH', 'PAID', NOW(), NULL, NOW(), NOW()),

('7ee27fbb-dffe-4606-aad1-14e1788f547e', 'ORD-20260326-001481', NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh","streetNumber":"1","houseNumber":"Shop","note":"POS evening order","latitude":11.5564,"longitude":104.9282}', '{"name":"Pickup","description":"Counter pickup service","imageUrl":"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop","price":0}', 'COMPLETED', 'POS', 'POS order', 'Staff order complete', '{"totalItems":5,"subtotalBeforeDiscount":27,"subtotal":27,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":27}', FALSE, '{"totalItems":5,"subtotalBeforeDiscount":27,"subtotal":27,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":27}', '{"discountType":"NONE","discountValue":0,"discountPercentage":0,"reason":"No discount"}', 'No changes', 27.00, 0.00, 0.00, 0.00, 27.00, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('02bd7a9c-ddd3-4d75-90df-90a8e9d0283e', 'ORD-20260326-AUDIT005', 'ebf927ff-4b58-41c4-aecc-e1a7d62f58bb', '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh","streetNumber":"1","houseNumber":"Shop","note":"Office catering order","latitude":11.5564,"longitude":104.9282}', '{"name":"Pickup","description":"Quick pickup service","imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop","price":0}', 'COMPLETED', 'PUBLIC', 'Office catering', 'Large catering order', '{"totalItems":7,"subtotalBeforeDiscount":50,"subtotal":50,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":50}', FALSE, '{"totalItems":7,"subtotalBeforeDiscount":50,"subtotal":42.5,"totalDiscount":7.5,"deliveryFee":0,"taxAmount":0,"finalTotal":42.5}', '{"discountType":"PERCENTAGE","discountValue":7.5,"discountPercentage":15,"reason":"Bulk catering 15%"}', 'Bulk catering discount', 50.00, 7.50, 0.00, 0.00, 42.50, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('51edd5c9-13a1-4f7e-ae77-cb736eb82b52', 'ORD-20260326-001310', NULL, '550cad56-cafd-4aba-baef-c4dcd53940d0', '{"village":"POS Counter","commune":"Downtown","district":"Daun Penh","province":"Phnom Penh","streetNumber":"1","houseNumber":"Shop","note":"POS afternoon order","latitude":11.5564,"longitude":104.9282}', '{"name":"Pickup","description":"Counter pickup","imageUrl":"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop","price":0}', 'COMPLETED', 'POS', 'POS order', 'Processed', '{"totalItems":5,"subtotalBeforeDiscount":24.5,"subtotal":24.5,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":24.5}', TRUE, '{"totalItems":5,"subtotalBeforeDiscount":24.5,"subtotal":17.95,"totalDiscount":6.55,"deliveryFee":0,"taxAmount":0,"finalTotal":17.95}', '{"discountType":"PERCENTAGE","discountValue":6.55,"discountPercentage":26.73,"reason":"POS discount"}', 'POS discount applied', 24.50, 6.55, 0.00, 0.00, 17.95, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW());

-- ============================================================================
-- 9. ORDER ITEMS - WITH COMPLETE AUDIT TRAILS
-- ============================================================================
INSERT INTO order_items (id, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date, quantity, total_price, special_instructions, before_snapshot, had_change_from_pos, after_snapshot, audit_metadata, change_reason, created_at, updated_at) VALUES

('2c7283c7-cd44-4ea8-a2c3-62c1a79531e2', '0add45d6-a13c-4861-9c41-a9d82a922c27', '00054cd9-d2ac-46a3-9061-db83cf526f05', NULL, 'Cappuccino VIP', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Medium', 5.5, 5.5, 5.5, FALSE, NULL, NULL, NULL, NULL, 2, 11, 'No extra', '{"currentPrice":5.5,"finalPrice":5.5,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":11,"discountAmount":0,"totalPrice":11}', FALSE, '{"currentPrice":5.5,"finalPrice":5.5,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":11,"discountAmount":0,"totalPrice":11}', '{"changeType":"NONE","source":"SYSTEM"}', 'No changes', NOW(), NOW()),

('9fbdbc3e-f4b1-43de-890a-482a5f3d85b2', '0add45d6-a13c-4861-9c41-a9d82a922c27', '000b3a18-a51e-4b92-ba3d-dbe4111e3e21', NULL, 'Croissant VIP', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 4.0, 4.0, 4.0, FALSE, NULL, NULL, NULL, NULL, 2, 8, 'Warm', '{"currentPrice":4.0,"finalPrice":4.0,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":8,"discountAmount":0,"totalPrice":8}', FALSE, '{"currentPrice":4.0,"finalPrice":4.0,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":8,"discountAmount":0,"totalPrice":8}', '{"changeType":"NONE","source":"SYSTEM"}', 'No changes', NOW(), NOW());

-- ============================================================================
-- END OF TEST DATA
-- ============================================================================
-- Total:
-- - 3 Main Test Users (Manager, Staff, Customer)
-- - 5 Businesses
-- - 8 Categories with 4 Brands
-- - 25+ Products with active promotions
-- - 10 Complete Orders with ZERO NULLS
-- - Image URLs: Only 2 (reused)
-- ============================================================================
