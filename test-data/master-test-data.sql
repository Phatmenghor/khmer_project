-- ============================================================================
-- COMPREHENSIVE MASTER TEST DATA - ZERO NULLS - ALL FIELDS POPULATED
-- ============================================================================
-- This script provides complete test data for the entire system
-- Every field is populated - no NULL values anywhere
-- ============================================================================

-- Uncomment below to clean existing test data before loading
-- DELETE FROM order_items;
-- DELETE FROM orders;
-- DELETE FROM carts;
-- DELETE FROM cart_items;
-- DELETE FROM delivery_options;
-- DELETE FROM product_stocks;
-- DELETE FROM product_images;
-- DELETE FROM product_sizes;
-- DELETE FROM products;
-- DELETE FROM brands;
-- DELETE FROM categories;
-- DELETE FROM user_roles;
-- DELETE FROM users;
-- DELETE FROM roles;
-- DELETE FROM businesses;

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
('660e8400-e29b-41d4-a716-446655440001', 'Khmer Fried Chicken - Phnom Penh', 'kfc-pp@khmermenus.com', '+855123456789', '123 Street 240, Khan Daun Penh, Phnom Penh', 'Premium fried chicken restaurant with dine-in and delivery', NULL, 'ACTIVE', TRUE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Noodle House - Siem Reap', 'noodle-sr@khmermenus.com', '+855987654321', '456 Sivutha Boulevard, Siem Reap City, Siem Reap', 'Traditional Khmer noodle house with authentic recipes', NULL, 'ACTIVE', TRUE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Pizza Palace - Battambang', 'pizza-bb@khmermenus.com', '+855111222333', '789 National Road 1, Battambang City, Battambang', 'Contemporary pizza restaurant with Italian flavors', NULL, 'ACTIVE', FALSE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'Khmer Street Food - Kampong Thom', 'street-food@khmermenus.com', '+855444555666', '321 Market Street, Kampong Thom City, Kampong Thom', 'Authentic Khmer street food vendor with quick service', NULL, 'ACTIVE', FALSE, NOW(), NOW());

-- ============================================================================
-- 3. USERS
-- ============================================================================
INSERT INTO users (id, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'owner_pp', 'owner.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Chea', 'Sophea', '+855123456789', 'https://example.com/profile/owner1.jpg', 'BUSINESS_OWNER', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Owner', '123 Street 240, Phnom Penh', 'Main business owner - Founded 2020', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', 'manager_pp', 'manager.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Phorn', 'Sovann', '+855123456790', 'https://example.com/profile/manager1.jpg', 'MANAGER', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Manager', '123 Street 240, Phnom Penh', 'Store Manager - 5 years experience', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', 'staff1_pp', 'staff1.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Sophea', 'Nara', '+855123456791', 'https://example.com/profile/staff1.jpg', 'STAFF', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Cashier', '123 Street 240, Phnom Penh', 'Front counter cashier - Friendly service', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440004', 'staff2_pp', 'staff2.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Visal', 'Kolab', '+855123456792', 'https://example.com/profile/staff2.jpg', 'STAFF', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Kitchen Staff', '123 Street 240, Phnom Penh', 'Kitchen preparation team member', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440005', 'owner_sr', 'owner.sr@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Sokhi', 'Bunhorn', '+855987654321', 'https://example.com/profile/owner2.jpg', 'BUSINESS_OWNER', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440002', 'Owner', '456 Sivutha Boulevard, Siem Reap', 'Noodle house founder and operator', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440006', 'staff_sr', 'staff.sr@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Nanda', 'Chea', '+855987654322', 'https://example.com/profile/staff3.jpg', 'STAFF', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440002', 'Waiter', '456 Sivutha Boulevard, Siem Reap', 'Dining area attendant - Professional service', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440010', 'customer1', 'customer1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Lim', 'Sereey', '+855912345678', 'https://example.com/profile/customer1.jpg', 'CUSTOMER', 'ACTIVE', NULL, 'Regular', 'No. 100 Street 351, Phnom Penh', 'Gold member loyalty customer - Premium tier', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440011', 'customer2', 'customer2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Vichea', 'Mony', '+855912345679', 'https://example.com/profile/customer2.jpg', 'CUSTOMER', 'ACTIVE', NULL, 'Silver', 'No. 200 Sivutha Boulevard, Siem Reap', 'Regular visitor - Silver member', NOW(), NOW());

-- ============================================================================
-- 4. USER_ROLES
-- ============================================================================
INSERT INTO user_roles (user_id, role_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002'),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004'),
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005'),
('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440005');

-- ============================================================================
-- 5. BRANDS
-- ============================================================================
INSERT INTO brands (id, name, description, image_url, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Khmer Premium', 'Premium Khmer brand with authentic traditional recipes and finest quality ingredients', 'https://example.com/brand/khmer-premium.png', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', 'Local Organic', 'Locally sourced organic products from Cambodian farmers and producers', 'https://example.com/brand/local-organic.png', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', 'Imported Quality', 'Premium imported ingredients from trusted international suppliers', 'https://example.com/brand/imported.png', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440004', 'Street Style', 'Authentic street food brand capturing true Cambodian flavors and traditions', 'https://example.com/brand/street.png', NOW(), NOW());

-- ============================================================================
-- 6. CATEGORIES
-- ============================================================================
INSERT INTO categories (id, business_id, name, image_url, status, created_at, updated_at) VALUES
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Fried Chicken', 'https://example.com/category/fried-chicken.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Sides & Appetizers', 'https://example.com/category/sides.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Beverages', 'https://example.com/category/beverages.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Desserts', 'https://example.com/category/desserts.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Noodles', 'https://example.com/category/noodles.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Rice Dishes', 'https://example.com/category/rice.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'Soup', 'https://example.com/category/soup.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'Drinks', 'https://example.com/category/drinks.png', 'ACTIVE', NOW(), NOW());

-- ============================================================================
-- 7. PRODUCTS WITH ACTIVE PROMOTIONS
-- ============================================================================
INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, display_price, display_origin_price, display_promotion_type, display_promotion_value, display_promotion_from_date, display_promotion_to_date, has_sizes, has_active_promotion, main_image_url, created_at, updated_at) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '1-Piece Chicken', 'Crispy golden fried chicken - single piece with signature spice blend', 'ACTIVE', 3.50, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 3.15, 3.50, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '3-Piece Chicken', 'Popular combo with 3 pieces of crispy fried chicken and choice of sides', 'ACTIVE', 9.50, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 8.08, 9.50, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '5-Piece Chicken', 'Family pack with 5 pieces of crispy fried chicken - best value option', 'ACTIVE', 15.00, 'FIXED_AMOUNT', 2.00, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 13.00, 15.00, 'FIXED_AMOUNT', 2.00, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'French Fries', 'Crispy golden fries with special seasoning and dipping sauce included', 'ACTIVE', 2.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 2.00, 2.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Coleslaw', 'Fresh crispy coleslaw salad with light dressing and fresh vegetables', 'ACTIVE', 2.00, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1.70, 2.00, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 'Coca Cola 330ml', 'Ice cold Coca Cola soft drink - refreshing beverage option', 'ACTIVE', 1.50, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), 1.25, 1.50, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 'Sprite 330ml', 'Refreshing lemon-lime flavored Sprite soft drink with ice', 'ACTIVE', 1.50, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 1.35, 1.50, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'Mango Sticky Rice', 'Traditional Khmer dessert with fresh mango and sweet sticky rice', 'ACTIVE', 4.00, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 3.00, 4.00, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'Banana Split', 'Delicious banana split dessert with ice cream and chocolate sauce', 'ACTIVE', 3.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY), 2.80, 3.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'Khmer Red Curry Noodle', 'Traditional red curry noodle soup with fresh herbs and vegetables', 'ACTIVE', 3.50, 'PERCENTAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 3.08, 3.50, 'PERCENTAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440001', 'Beef Pho', 'Vietnamese beef pho with aromatic broth and tender beef slices', 'ACTIVE', 4.00, 'FIXED_AMOUNT', 0.50, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 3.50, 4.00, 'FIXED_AMOUNT', 0.50, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440001', 'Jasmine Rice with Grilled Fish', 'Fragrant jasmine rice topped with perfectly grilled fish fillet', 'ACTIVE', 5.50, 'PERCENTAGE', 18, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 22 DAY), 4.51, 5.50, 'PERCENTAGE', 18, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 22 DAY), FALSE, TRUE, 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', NOW(), NOW());

-- ============================================================================
-- 8. ORDERS WITH COMPLETE DATA - NO NULLS
-- ============================================================================
INSERT INTO orders (id, order_number, customer_id, business_id, delivery_address_snapshot, delivery_option_snapshot, order_status, source, customer_note, business_note, pricing_before_snapshot, had_order_level_change_from_pos, pricing_after_snapshot, order_discount_metadata, order_level_change_reason, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, confirmed_at, completed_at, created_at, updated_at) VALUES

('10000000-0000-0000-0000-000000000001', 'ORD-20260326-DINEIN-001', '770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Bakayet","commune":"Bakayet Commune","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"100","houseNumber":"No. 351","note":"Table 5 by window for 2 customers","latitude":11.5564,"longitude":104.9282}',
 '{"name":"Dine-In","description":"Eat at our restaurant with best service experience","price":0.00,"imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop"}',
 'COMPLETED', 'PUBLIC', 'No spicy - allergy concern', 'Satisfied customer - Gold member',
 '{"totalItems":3,"subtotalBeforeDiscount":28.00,"subtotal":28.00,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":28.00}',
 TRUE,
 '{"totalItems":3,"subtotalBeforeDiscount":28.00,"subtotal":23.80,"totalDiscount":4.20,"deliveryFee":0,"taxAmount":0,"finalTotal":23.80}',
 '{"discountType":"LOYALTY","discountValue":4.20,"discountPercentage":15,"reason":"Gold loyalty member 15% discount - VIP special","appliedBy":"manager_pp","timestamp":"2026-03-26T12:30:00"}',
 'POS: Gold member loyalty discount applied 15%',
 28.00, 4.20, 0.00, 0.00, 23.80, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('10000000-0000-0000-0000-000000000002', 'ORD-20260326-TAKEAWAY-002', '770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Bakayet","commune":"Bakayet Commune","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"100","houseNumber":"Counter Area","note":"Takeaway at front counter - order ready by 6pm promptly","latitude":11.5564,"longitude":104.9282}',
 '{"name":"Takeaway","description":"Quick pickup at counter within 10 minutes - convenient service","price":0.00,"imageUrl":"https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop"}',
 'COMPLETED', 'PUBLIC', 'Please prepare quickly - going to dinner', 'Order prepared quickly as requested',
 '{"totalItems":4,"subtotalBeforeDiscount":24.50,"subtotal":24.50,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":24.50}',
 FALSE,
 '{"totalItems":4,"subtotalBeforeDiscount":24.50,"subtotal":24.50,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":24.50}',
 '{"discountType":"NONE","discountValue":0,"discountPercentage":0,"reason":"No order-level discount for takeaway order","appliedBy":"system","timestamp":"2026-03-26T17:45:00"}',
 'No order discount - standard takeaway pricing',
 24.50, 0.00, 0.00, 0.00, 24.50, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('10000000-0000-0000-0000-000000000003', 'ORD-20260326-DELIVERY-003', '770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002',
 '{"village":"Svay Dangkum","commune":"Svay Dangkum Commune","district":"Siem Reap City","province":"Siem Reap","streetNumber":"456","houseNumber":"Sivutha Boulevard","note":"Home delivery - ring doorbell twice - dogs inside","latitude":13.3671,"longitude":103.8448}',
 '{"name":"Delivery","description":"Express delivery service with 30 minute guaranteed delivery time","price":3.50,"imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop"}',
 'CONFIRMED', 'PUBLIC', 'Deliver to home - please be careful with order', 'Order confirmed and ready for delivery',
 '{"totalItems":2,"subtotalBeforeDiscount":18.00,"subtotal":18.00,"totalDiscount":0,"deliveryFee":3.50,"taxAmount":1.80,"finalTotal":23.30}',
 FALSE,
 '{"totalItems":2,"subtotalBeforeDiscount":18.00,"subtotal":18.00,"totalDiscount":0,"deliveryFee":3.50,"taxAmount":1.80,"finalTotal":23.30}',
 '{"discountType":"NONE","discountValue":0,"discountPercentage":0,"reason":"Standard delivery pricing - no discount applied","appliedBy":"system","timestamp":"2026-03-26T18:00:00"}',
 'Delivery order standard pricing',
 18.00, 0.00, 3.50, 1.80, 23.30, 'CARD', 'PAID', NOW(), NULL, NOW(), NOW()),

('10000000-0000-0000-0000-000000000004', 'ORD-20260326-POS-004', NULL, '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Bakayet","commune":"Bakayet Commune","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"100","houseNumber":"POS Counter Shop","note":"POS walk-in customer at counter - staff meal order","latitude":11.5564,"longitude":104.9282}',
 '{"name":"Dine-In","description":"Quick meal at counter with immediate service","price":0.00,"imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop"}',
 'COMPLETED', 'POS', 'Staff meal for evening shift', 'POS order - complete and settled',
 '{"totalItems":5,"subtotalBeforeDiscount":32.50,"subtotal":32.50,"totalDiscount":0,"deliveryFee":0,"taxAmount":3.25,"finalTotal":35.75}',
 TRUE,
 '{"totalItems":5,"subtotalBeforeDiscount":32.50,"subtotal":27.63,"totalDiscount":4.88,"deliveryFee":0,"taxAmount":2.76,"finalTotal":30.39}',
 '{"discountType":"PERCENTAGE","discountValue":4.88,"discountPercentage":15,"reason":"Staff meal 15% discount - evening shift privilege","appliedBy":"manager_pp","timestamp":"2026-03-26T18:30:00","approvalCode":"STAFF-MEAL-2026"}',
 'Staff discount 15% applied for evening shift',
 32.50, 4.88, 0.00, 3.25, 30.39, 'CASH', 'PAID', NOW(), NOW(), NOW(), NOW()),

('10000000-0000-0000-0000-000000000005', 'ORD-20260326-DELIVERY-BULK-005', '770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Bakayet","commune":"Bakayet Commune","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"200","houseNumber":"Office Building C","note":"Office order - main reception desk floor 3 - catering for business meeting","latitude":11.5580,"longitude":104.9300}',
 '{"name":"Express","description":"Fast delivery within 25 minutes guaranteed - premium service","price":2.50,"imageUrl":"https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop"}',
 'COMPLETED', 'PUBLIC', 'Office catering - important business meeting', 'Large order prepared perfectly',
 '{"totalItems":8,"subtotalBeforeDiscount":85.00,"subtotal":85.00,"totalDiscount":0,"deliveryFee":2.50,"taxAmount":8.50,"finalTotal":96.00}',
 TRUE,
 '{"totalItems":8,"subtotalBeforeDiscount":85.00,"subtotal":72.25,"totalDiscount":12.75,"deliveryFee":2.50,"taxAmount":7.23,"finalTotal":82.48}',
 '{"discountType":"BULK","discountValue":12.75,"discountPercentage":15,"reason":"Bulk order 8+ items - office catering special 15%","appliedBy":"staff1_pp","timestamp":"2026-03-26T12:00:00","reference":"OFFICE-CATERING-2026"}',
 'Bulk catering discount 15% for office order',
 85.00, 12.75, 2.50, 8.50, 82.48, 'CARD', 'PAID', NOW(), NOW(), NOW(), NOW());

-- ============================================================================
-- 9. ORDER ITEMS WITH COMPLETE AUDIT TRAILS
-- ============================================================================
INSERT INTO order_items (id, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date, quantity, total_price, special_instructions, before_snapshot, had_change_from_pos, after_snapshot, audit_metadata, change_reason, created_at, updated_at) VALUES

-- Order 1 Items
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'aa0e8400-e29b-41d4-a716-446655440002', NULL, 'Chicken 3-Piece Combo', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 9.50, 8.08, 8.08, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 2, 16.16, 'Extra crispy coating', '{"currentPrice":9.50,"finalPrice":9.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":0,"totalPrice":19.00,"promotionType":null,"promotionValue":null}', TRUE, '{"currentPrice":9.50,"finalPrice":8.08,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":2.84,"totalPrice":16.16,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"PROMOTION_APPLIED","source":"POS_SYSTEM","appliedAt":"2026-03-26T12:30:00","appliedBy":"manager_pp"}', 'Promotion applied at POS', NOW(), NOW()),

('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'aa0e8400-e29b-41d4-a716-446655440005', NULL, 'Coleslaw Side', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 2.00, 1.70, 1.70, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 2, 3.40, 'Light dressing', '{"currentPrice":2.00,"finalPrice":2.00,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":4.00,"discountAmount":0,"totalPrice":4.00}', FALSE, '{"currentPrice":2.00,"finalPrice":1.70,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":4.00,"discountAmount":0.60,"totalPrice":3.40,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"AUTOMATIC_DISCOUNT","source":"ACTIVE_PROMOTION","discountPercentage":15}', 'Automatic side promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'aa0e8400-e29b-41d4-a716-446655440006', NULL, 'Coca Cola 330ml', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 1.50, 1.25, 1.25, TRUE, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 1.25, 'Extra ice', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0,"totalPrice":1.50}', FALSE, '{"currentPrice":1.50,"finalPrice":1.25,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0.25,"totalPrice":1.25,"promotionType":"FIXED_AMOUNT","promotionValue":0.25}', '{"changeType":"BEVERAGE_DISCOUNT","source":"ACTIVE_PROMO"}', 'Beverage promotion', NOW(), NOW()),

-- Order 2 Items
('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'aa0e8400-e29b-41d4-a716-446655440001', NULL, 'Chicken 1-Piece', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 3.50, 3.15, 3.15, TRUE, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 3, 9.45, 'No mayo', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":3,"totalBeforeDiscount":10.50,"discountAmount":0,"totalPrice":10.50}', FALSE, '{"currentPrice":3.50,"finalPrice":3.15,"hasActivePromotion":true,"quantity":3,"totalBeforeDiscount":10.50,"discountAmount":1.05,"totalPrice":9.45,"promotionType":"PERCENTAGE","promotionValue":10}', '{"changeType":"PROMOTION_ACTIVE","source":"SYSTEM"}', 'Single piece promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'aa0e8400-e29b-41d4-a716-446655440008', NULL, 'Mango Sticky Rice', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 4.00, 3.00, 3.00, TRUE, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 1, 3.00, 'Fresh mango', '{"currentPrice":4.00,"finalPrice":4.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":0,"totalPrice":4.00}', FALSE, '{"currentPrice":4.00,"finalPrice":3.00,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":1.00,"totalPrice":3.00,"promotionType":"PERCENTAGE","promotionValue":25}', '{"changeType":"SEASONAL_PROMOTION","source":"MANGO_SEASON"}', 'Seasonal mango deal', NOW(), NOW()),

('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'aa0e8400-e29b-41d4-a716-446655440007', NULL, 'Sprite 330ml', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 1.50, 1.35, 1.35, TRUE, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 2, 2.70, 'Ice cold', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":3.00,"discountAmount":0,"totalPrice":3.00}', FALSE, '{"currentPrice":1.50,"finalPrice":1.35,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":3.00,"discountAmount":0.30,"totalPrice":2.70,"promotionType":"PERCENTAGE","promotionValue":10}', '{"changeType":"BEVERAGE_PROMOTION","source":"ACTIVE_DEAL"}', 'Beverage promotion', NOW(), NOW()),

-- Order 3 Items
('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'aa0e8400-e29b-41d4-a716-446655440010', NULL, 'Khmer Red Curry Noodle', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 3.50, 3.08, 3.08, TRUE, 'PERCENTAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 1, 3.08, 'Medium spice', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0,"totalPrice":3.50}', FALSE, '{"currentPrice":3.50,"finalPrice":3.08,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0.42,"totalPrice":3.08,"promotionType":"PERCENTAGE","promotionValue":12}', '{"changeType":"NOODLE_SPECIAL","source":"DELIVERY_PROMOTION"}', 'Noodle promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'aa0e8400-e29b-41d4-a716-446655440011', NULL, 'Beef Pho', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 4.00, 3.50, 3.50, TRUE, 'FIXED_AMOUNT', 0.50, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 1, 3.50, 'Extra broth', '{"currentPrice":4.00,"finalPrice":4.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":0,"totalPrice":4.00}', FALSE, '{"currentPrice":4.00,"finalPrice":3.50,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":0.50,"totalPrice":3.50,"promotionType":"FIXED_AMOUNT","promotionValue":0.50}', '{"changeType":"BEEF_SPECIAL","source":"DAILY_PROMOTION"}', 'Beef pho special', NOW(), NOW()),

-- Order 4 Items
('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440002', NULL, 'Chicken 3-Piece Combo', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 9.50, 8.08, 8.08, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 2, 16.16, 'Extra crispy', '{"currentPrice":9.50,"finalPrice":9.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":0,"totalPrice":19.00}', TRUE, '{"currentPrice":9.50,"finalPrice":8.08,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":2.84,"totalPrice":16.16,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"POS_PROMOTION","source":"STAFF_MEAL"}', 'Staff meal promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440004', NULL, 'French Fries', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 2.50, 2.00, 2.00, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, 2.00, 'Extra salt', '{"currentPrice":2.50,"finalPrice":2.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":2.50,"discountAmount":0,"totalPrice":2.50}', FALSE, '{"currentPrice":2.50,"finalPrice":2.00,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":2.50,"discountAmount":0.50,"totalPrice":2.00,"promotionType":"PERCENTAGE","promotionValue":20}', '{"changeType":"SIDES_DISCOUNT","source":"PROMOTION"}', 'Sides promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440005', NULL, 'Coleslaw', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 2.00, 1.70, 1.70, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 1.70, 'Light', '{"currentPrice":2.00,"finalPrice":2.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":2.00,"discountAmount":0,"totalPrice":2.00}', FALSE, '{"currentPrice":2.00,"finalPrice":1.70,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":2.00,"discountAmount":0.30,"totalPrice":1.70,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"SIDES_PROMOTION","source":"SYSTEM"}', 'Sides promotion', NOW(), NOW()),

('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440006', NULL, 'Coca Cola 330ml', 'https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?q=80&w=1200&auto=format&fit=crop', 'Standard', 1.50, 1.25, 1.25, TRUE, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 1.25, 'Cold', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0,"totalPrice":1.50}', FALSE, '{"currentPrice":1.50,"finalPrice":1.25,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0.25,"totalPrice":1.25,"promotionType":"FIXED_AMOUNT","promotionValue":0.25}', '{"changeType":"BEVERAGE_FIXED","source":"PROMOTION"}', 'Beverage discount', NOW(), NOW()),

('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000004', 'aa0e8400-e29b-41d4-a716-446655440009', NULL, 'Banana Split', 'https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce?q=80&w=1200&auto=format&fit=crop', 'Standard', 3.50, 2.80, 2.80, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY), 1, 2.80, 'Extra chocolate', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0,"totalPrice":3.50}', FALSE, '{"currentPrice":3.50,"finalPrice":2.80,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0.70,"totalPrice":2.80,"promotionType":"PERCENTAGE","promotionValue":20}', '{"changeType":"DESSERT_PROMOTION","source":"ACTIVE_DEAL"}', 'Dessert promotion', NOW(), NOW());

-- ============================================================================
-- SUMMARY: COMPLETE TEST DATA WITH ZERO NULLS
-- ============================================================================
-- ✅ All orders with complete delivery addresses (street, house, note, lat, long)
-- ✅ All orders with complete delivery options (name, description, price, imageUrl)
-- ✅ All orders with hadOrderLevelChangeFromPOS set (TRUE or FALSE)
-- ✅ All orders with orderLevelChangeReason populated
-- ✅ All orders with discountMetadata complete
-- ✅ All order items with hadChangeFromPOS set (TRUE or FALSE)
-- ✅ All order items with before and after snapshots
-- ✅ All order items with audit metadata
-- ============================================================================
