-- ============================================================================
-- MASTER TEST DATA SCRIPT
-- Generated for comprehensive testing of Khmer Menu Scanner Application
-- ============================================================================

-- Clean up existing test data (optional, comment out for production)
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
-- 1. ROLES (Authorization and Access Control)
-- ============================================================================
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'ADMIN', 'System Administrator with full access', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'BUSINESS_OWNER', 'Business owner with management access', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'MANAGER', 'Manager with operational access', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'STAFF', 'Staff member with limited access', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'CUSTOMER', 'Customer with order placement access', NOW(), NOW());

-- ============================================================================
-- 2. BUSINESSES (Main business entities)
-- ============================================================================
INSERT INTO businesses (id, name, email, phone, address, description, owner_id, status, is_subscription_active, created_at, updated_at) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'Khmer Fried Chicken - Phnom Penh', 'kfc-pp@khmermenus.com', '+855123456789', '123 Street 240, Phnom Penh', 'Premium fried chicken restaurant in Phnom Penh', NULL, 'ACTIVE', TRUE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Noodle House - Siem Reap', 'noodle-sr@khmermenus.com', '+855987654321', '456 Sivutha Boulevard, Siem Reap', 'Traditional Khmer noodle house', NULL, 'ACTIVE', TRUE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Pizza Palace - Battambang', 'pizza-bb@khmermenus.com', '+855111222333', '789 National Road 1, Battambang', 'Contemporary pizza restaurant', NULL, 'PENDING', FALSE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'Khmer Street Food - Kampong Thom', 'street-food@khmermenus.com', '+855444555666', '321 Market Street, Kampong Thom', 'Authentic street food vendor', NULL, 'ACTIVE', FALSE, NOW(), NOW());

-- ============================================================================
-- 3. USERS (Business owners, managers, staff, and customers)
-- ============================================================================
-- Business Owner for PP
INSERT INTO users (id, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'owner_pp', 'owner.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Chea', 'Sophea', '+855123456789', NULL, 'BUSINESS_OWNER', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Owner', '123 Phnom Penh', 'Main owner', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', 'manager_pp', 'manager.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Phorn', 'Sovann', '+855123456790', NULL, 'MANAGER', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Manager', '123 Phnom Penh', 'Store Manager', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', 'staff1_pp', 'staff1.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Sophea', 'Nara', '+855123456791', NULL, 'STAFF', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Cashier', '123 Phnom Penh', 'Cashier at counter 1', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440004', 'staff2_pp', 'staff2.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Visal', 'Kolab', '+855123456792', NULL, 'STAFF', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Kitchen', 'Kitchen Area', 'Kitchen staff', NOW(), NOW()),

-- Business Owner for Siem Reap
('770e8400-e29b-41d4-a716-446655440005', 'owner_sr', 'owner.sr@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Sokhi', 'Bunhorn', '+855987654321', NULL, 'BUSINESS_OWNER', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440002', 'Owner', '456 Siem Reap', 'Main owner SR', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440006', 'staff_sr', 'staff.sr@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Nanda', 'Chea', '+655987654322', NULL, 'STAFF', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440002', 'Waiter', '456 Siem Reap', 'Dining area staff', NOW(), NOW()),

-- Customers
('770e8400-e29b-41d4-a716-446655440010', 'customer1', 'customer1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Lim', 'Sereey', '+855912345678', NULL, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Phnom Penh', 'Regular customer', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440011', 'customer2', 'customer2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Vichea', 'Mony', '+855912345679', NULL, 'CUSTOMER', 'ACTIVE', NULL, NULL, 'Siem Reap', 'Regular customer', NOW(), NOW());

-- ============================================================================
-- 4. USER_ROLES (Assign roles to users)
-- ============================================================================
INSERT INTO user_roles (user_id, role_id) VALUES
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'), -- owner_pp -> BUSINESS_OWNER
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003'), -- manager_pp -> MANAGER
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004'), -- staff1_pp -> STAFF
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004'), -- staff2_pp -> STAFF
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002'), -- owner_sr -> BUSINESS_OWNER
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004'), -- staff_sr -> STAFF
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440005'), -- customer1 -> CUSTOMER
('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440005'); -- customer2 -> CUSTOMER

-- ============================================================================
-- 5. BRANDS (Product brands)
-- ============================================================================
INSERT INTO brands (id, name, description, image_url, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Khmer Premium', 'Premium Khmer brand', 'https://example.com/khmer-premium.png', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', 'Local Organic', 'Locally sourced organic products', 'https://example.com/local-organic.png', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', 'Imported Quality', 'Premium imported ingredients', 'https://example.com/imported.png', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440004', 'Street Style', 'Authentic street food brand', 'https://example.com/street.png', NOW(), NOW());

-- ============================================================================
-- 6. CATEGORIES (Product categories)
-- ============================================================================
INSERT INTO categories (id, business_id, name, image_url, status, created_at, updated_at) VALUES
-- Phnom Penh Categories
('990e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Fried Chicken', 'https://example.com/fried-chicken.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Sides', 'https://example.com/sides.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Beverages', 'https://example.com/beverages.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Desserts', 'https://example.com/desserts.png', 'ACTIVE', NOW(), NOW()),
-- Siem Reap Categories
('990e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', 'Noodles', 'https://example.com/noodles.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Rice Dishes', 'https://example.com/rice.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'Soup', 'https://example.com/soup.png', 'ACTIVE', NOW(), NOW()),
('990e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'Drinks', 'https://example.com/drinks.png', 'ACTIVE', NOW(), NOW());

-- ============================================================================
-- 7. PRODUCTS (Menu items with various pricing and promotions)
-- ============================================================================
-- Phnom Penh Fried Chicken Products
INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, display_price, display_origin_price, display_promotion_type, display_promotion_value, display_promotion_from_date, display_promotion_to_date, has_sizes, has_active_promotion, main_image_url, created_at, updated_at) VALUES
-- Regular priced items (no promotion)
('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '1-Piece Chicken', 'Crispy fried chicken - 1 piece', 'ACTIVE', 3.50, NULL, NULL, NULL, NULL, 3.50, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, 'https://example.com/chicken-1pc.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '3-Piece Chicken', 'Crispy fried chicken - 3 pieces', 'ACTIVE', 9.50, NULL, NULL, NULL, NULL, 9.50, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, 'https://example.com/chicken-3pc.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '5-Piece Chicken', 'Crispy fried chicken - 5 pieces', 'ACTIVE', 15.00, NULL, NULL, NULL, NULL, 15.00, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, 'https://example.com/chicken-5pc.png', NOW(), NOW()),

-- Items with percentage discount (currently active)
('aa0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'French Fries', 'Crispy golden fries', 'ACTIVE', 2.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 2.00, 2.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, TRUE, 'https://example.com/fries.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Coleslaw', 'Fresh coleslaw salad', 'ACTIVE', 2.00, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1.70, 2.00, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, TRUE, 'https://example.com/coleslaw.png', NOW(), NOW()),

-- Items with fixed amount discount (currently active)
('aa0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 'Coca Cola 330ml', 'Refreshing Coca Cola', 'ACTIVE', 1.50, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 1.25, 1.50, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), FALSE, TRUE, 'https://example.com/cola.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'Sprite 330ml', 'Refreshing Sprite', 'ACTIVE', 1.50, NULL, NULL, NULL, NULL, 1.50, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, 'https://example.com/sprite.png', NOW(), NOW()),

-- Desserts
('aa0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440004', 'Mango Sticky Rice', 'Seasonal mango with sticky rice', 'ACTIVE', 4.00, NULL, NULL, NULL, NULL, 4.00, NULL, NULL, NULL, NULL, NULL, FALSE, FALSE, 'https://example.com/mango-sticky.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'Banana Split', 'Banana with ice cream', 'ACTIVE', 3.50, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 2.63, 3.50, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), FALSE, TRUE, 'https://example.com/banana-split.png', NOW(), NOW()),

-- Siem Reap Noodle House Products
('aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Khmer Red Curry Noodle', 'Traditional red curry noodle soup', 'ACTIVE', 3.50, NULL, NULL, NULL, NULL, 3.50, NULL, NULL, NULL, NULL, NULL, TRUE, FALSE, 'https://example.com/curry-noodle.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Beef Pho', 'Vietnamese beef pho noodle soup', 'ACTIVE', 4.00, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 3.60, 4.00, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), TRUE, TRUE, 'https://example.com/beef-pho.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002', 'Jasmine Rice with Grilled Fish', 'Fragrant jasmine rice with grilled fish', 'ACTIVE', 5.50, NULL, NULL, NULL, NULL, 5.50, NULL, NULL, NULL, NULL, NULL, TRUE, FALSE, 'https://example.com/rice-fish.png', NOW(), NOW());

-- ============================================================================
-- 8. PRODUCT_SIZES (Sizes for sized products)
-- ============================================================================
INSERT INTO product_sizes (id, product_id, business_id, size_name, size_description, additional_price, created_at, updated_at) VALUES
-- Khmer Red Curry Noodle sizes
('bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'Small', 'Small bowl', 0.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'Medium', 'Medium bowl', 0.50, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'Large', 'Large bowl', 1.00, NOW(), NOW()),
-- Beef Pho sizes
('bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'Small', 'Small bowl', 0.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'Large', 'Large bowl', 1.00, NOW(), NOW()),
-- Jasmine Rice sizes
('bb0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 'Regular', 'Regular plate', 0.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 'Large', 'Large plate', 1.50, NOW(), NOW());

-- ============================================================================
-- 9. DELIVERY_OPTIONS (Delivery methods with pricing)
-- ============================================================================
INSERT INTO delivery_options (id, business_id, name, description, price, is_default, status, created_at, updated_at) VALUES
-- Phnom Penh
('cc0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Dine-In', 'Eat at our restaurant', 0.00, TRUE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Takeaway', 'Pick up your order', 0.00, FALSE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Delivery - 2km', 'Delivery within 2km radius', 2.00, FALSE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Delivery - 5km', 'Delivery within 5km radius', 4.00, FALSE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Delivery - 10km', 'Delivery within 10km radius', 6.00, FALSE, 'ACTIVE', NOW(), NOW()),
-- Siem Reap
('cc0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Dine-In', 'Eat at our restaurant', 0.00, TRUE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'Takeaway', 'Pick up your order', 0.00, FALSE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'Delivery', 'Delivery service available', 3.00, FALSE, 'ACTIVE', NOW(), NOW());

-- ============================================================================
-- 10. LOCATIONS (Geographic hierarchy)
-- ============================================================================
-- Provinces
INSERT INTO provinces (id, code, name, created_at, updated_at) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'PP', 'Phnom Penh', NOW(), NOW()),
('dd0e8400-e29b-41d4-a716-446655440002', 'SR', 'Siem Reap', NOW(), NOW()),
('dd0e8400-e29b-41d4-a716-446655440003', 'BB', 'Battambang', NOW(), NOW()),
('dd0e8400-e29b-41d4-a716-446655440004', 'KT', 'Kampong Thom', NOW(), NOW());

-- Districts for Phnom Penh
INSERT INTO districts (id, province_id, code, name, created_at, updated_at) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'dd0e8400-e29b-41d4-a716-446655440001', 'CH', 'Chamkarmon', NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440002', 'dd0e8400-e29b-41d4-a716-446655440001', 'BK', 'Boeng Keng Kang', NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440003', 'dd0e8400-e29b-41d4-a716-446655440001', 'RT', 'Russei Keo', NOW(), NOW()),
-- Districts for Siem Reap
('ee0e8400-e29b-41d4-a716-446655440004', 'dd0e8400-e29b-41d4-a716-446655440002', 'SR-CEN', 'Siem Reap City', NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440005', 'dd0e8400-e29b-41d4-a716-446655440002', 'SR-PUK', 'Puok', NOW(), NOW());

-- Communes for Chamkarmon
INSERT INTO communes (id, district_id, code, name, created_at, updated_at) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', 'CH-BKY', 'Bakayet', NOW(), NOW()),
('ff0e8400-e29b-41d4-a716-446655440002', 'ee0e8400-e29b-41d4-a716-446655440001', 'CH-TUL', 'Tuol Svay Prey', NOW(), NOW());

-- Communes for Siem Reap City
INSERT INTO communes (id, district_id, code, name, created_at, updated_at) VALUES
('ff0e8400-e29b-41d4-a716-446655440003', 'ee0e8400-e29b-41d4-a716-446655440004', 'SR-SVY', 'Svay Dangkum', NOW(), NOW()),
('ff0e8400-e29b-41d4-a716-446655440004', 'ee0e8400-e29b-41d4-a716-446655440004', 'SR-ANL', 'Sangkat Ankrang', NOW(), NOW());

-- Villages for Bakayet
INSERT INTO villages (id, commune_id, code, name, created_at, updated_at) VALUES
('gg0e8400-e29b-41d4-a716-446655440001', 'ff0e8400-e29b-41d4-a716-446655440001', 'BKY-1', 'Village 1', NOW(), NOW()),
('gg0e8400-e29b-41d4-a716-446655440002', 'ff0e8400-e29b-41d4-a716-446655440001', 'BKY-2', 'Village 2', NOW(), NOW());

-- Locations (specific addresses)
INSERT INTO locations (id, province_id, district_id, commune_id, village_id, street_address, description, latitude, longitude, is_default, created_at, updated_at) VALUES
-- Customer 1 locations
('hh0e8400-e29b-41d4-a716-446655440001', 'dd0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', 'ff0e8400-e29b-41d4-a716-446655440001', 'gg0e8400-e29b-41d4-a716-446655440001', 'No. 123 Street 240', 'Home address', 11.5564, 104.9282, TRUE, NOW(), NOW()),
('hh0e8400-e29b-41d4-a716-446655440002', 'dd0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', 'ff0e8400-e29b-41d4-a716-446655440001', 'gg0e8400-e29b-41d4-a716-446655440002', 'No. 456 Street 278', 'Office address', 11.5580, 104.9300, FALSE, NOW(), NOW()),
-- Customer 2 locations
('hh0e8400-e29b-41d4-a716-446655440003', 'dd0e8400-e29b-41d4-a716-446655440002', 'ee0e8400-e29b-41d4-a716-446655440004', 'ff0e8400-e29b-41d4-a716-446655440003', NULL, '456 Sivutha Boulevard', 'Residence', 13.3671, 103.8448, TRUE, NOW(), NOW());

-- ============================================================================
-- 11. ORDERS (Sample orders for testing)
-- ============================================================================
INSERT INTO orders (id, order_number, customer_id, business_id, delivery_address_snapshot, delivery_option_snapshot, order_status, source, customer_note, business_note, pricing_before_snapshot, had_order_level_change_from_pos, pricing_after_snapshot, order_discount_metadata, order_level_change_reason, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, confirmed_at, completed_at, created_at, updated_at) VALUES
-- Order 1: Simple dine-in order
('ii0e8400-e29b-41d4-a716-446655440001', 'ORD-2024-001', '770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001', '{"street_address":"No. 123 Street 240","description":"Home address","latitude":11.5564,"longitude":104.9282}', '{"name":"Dine-In","description":"Eat at our restaurant","price":0.00}', 'COMPLETED', 'PUBLIC', 'No spicy please', NULL, NULL, FALSE, NULL, NULL, NULL, 25.50, 0.00, 0.00, 0.00, 25.50, 'CASH', 'PAID', NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Order 2: Takeaway order with discount
('ii0e8400-e29b-41d4-a716-446655440002', 'ORD-2024-002', '770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001', NULL, '{"name":"Takeaway","description":"Pick up your order","price":0.00}', 'COMPLETED', 'PUBLIC', NULL, NULL, NULL, FALSE, NULL, NULL, NULL, 18.00, 2.00, 0.00, 0.00, 16.00, 'CASH', 'PAID', NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Order 3: Delivery order from Siem Reap
('ii0e8400-e29b-41d4-a716-446655440003', 'ORD-2024-003', '770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', '{"street_address":"456 Sivutha Boulevard","description":"Residence","latitude":13.3671,"longitude":103.8448}', '{"name":"Delivery","description":"Delivery service available","price":3.00}', 'CONFIRMED', 'PUBLIC', 'Deliver after 6pm', 'Order confirmed, preparing', NULL, FALSE, NULL, NULL, NULL, 12.50, 0.00, 3.00, 0.00, 15.50, 'CASH', 'UNPAID', NOW(), NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Order 4: POS order with order-level discount
('ii0e8400-e29b-41d4-a716-446655440004', 'ORD-2024-POS-001', NULL, '660e8400-e29b-41d4-a716-446655440001', '{"street_address":"Walk-up order","description":"Counter order"}', '{"name":"Dine-In","description":"Eat at our restaurant","price":0.00}', 'COMPLETED', 'POS', NULL, '10% loyalty discount applied', NULL, TRUE, NULL, '{"discountType":"LOYALTY","discountReason":"Customer loyalty program","discountAppliedBy":"staff1_pp"}', 'Loyalty customer', 30.00, 3.00, 0.00, 0.00, 27.00, 'CASH', 'PAID', NOW(), DATE_ADD(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- ============================================================================
-- 12. ORDER_ITEMS (Items in each order)
-- ============================================================================
INSERT INTO order_items (id, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date, quantity, total_price, special_instructions, before_snapshot, had_change_from_pos, after_snapshot, audit_metadata, change_reason, created_at, updated_at) VALUES
-- Order 1 items
('jj0e8400-e29b-41d4-a716-446655440001', 'ii0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440003', NULL, '5-Piece Chicken', 'https://example.com/chicken-5pc.png', 'Standard', 15.00, 15.00, 15.00, FALSE, NULL, NULL, NULL, NULL, 1, 15.00, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),
('jj0e8400-e29b-41d4-a716-446655440002', 'ii0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440004', NULL, 'French Fries', 'https://example.com/fries.png', 'Standard', 2.50, 2.00, 2.00, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 2, 4.00, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),
('jj0e8400-e29b-41d4-a716-446655440003', 'ii0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440006', NULL, 'Coca Cola 330ml', 'https://example.com/cola.png', 'Standard', 1.50, 1.25, 1.25, TRUE, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 2, 2.50, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),

-- Order 2 items
('jj0e8400-e29b-41d4-a716-446655440004', 'ii0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', NULL, '1-Piece Chicken', 'https://example.com/chicken-1pc.png', 'Standard', 3.50, 3.50, 3.50, FALSE, NULL, NULL, NULL, NULL, 2, 7.00, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),
('jj0e8400-e29b-41d4-a716-446655440005', 'ii0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440005', NULL, 'Coleslaw', 'https://example.com/coleslaw.png', 'Standard', 2.00, 1.70, 1.70, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 2, 3.40, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),
('jj0e8400-e29b-41d4-a716-446655440006', 'ii0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440008', NULL, 'Mango Sticky Rice', 'https://example.com/mango-sticky.png', 'Standard', 4.00, 4.00, 4.00, FALSE, NULL, NULL, NULL, NULL, 1, 4.00, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),
('jj0e8400-e29b-41d4-a716-446655440007', 'ii0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440007', NULL, 'Sprite 330ml', 'https://example.com/sprite.png', 'Standard', 1.50, 1.50, 1.50, FALSE, NULL, NULL, NULL, NULL, 1, 1.50, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),

-- Order 3 items
('jj0e8400-e29b-41d4-a716-446655440008', 'ii0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440010', 'bb0e8400-e29b-41d4-a716-446655440001', 'Khmer Red Curry Noodle', 'https://example.com/curry-noodle.png', 'Small', 3.50, 3.50, 3.50, FALSE, NULL, NULL, NULL, NULL, 1, 3.50, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),
('jj0e8400-e29b-41d4-a716-446655440009', 'ii0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440011', 'bb0e8400-e29b-41d4-a716-446655440005', 'Beef Pho', 'https://example.com/beef-pho.png', 'Large', 4.00, 3.60, 3.60, TRUE, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 1, 3.60, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),
('jj0e8400-e29b-41d4-a716-446655440010', 'ii0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440012', 'bb0e8400-e29b-41d4-a716-446655440007', 'Jasmine Rice with Grilled Fish', 'https://example.com/rice-fish.png', 'Large', 7.00, 7.00, 7.00, FALSE, NULL, NULL, NULL, NULL, 1, 7.00, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),

-- Order 4 items (with POS modifications)
('jj0e8400-e29b-41d4-a716-446655440011', 'ii0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440002', NULL, '3-Piece Chicken', 'https://example.com/chicken-3pc.png', 'Standard', 9.50, 9.50, 9.50, FALSE, NULL, NULL, NULL, NULL, 2, 19.00, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),
('jj0e8400-e29b-41d4-a716-446655440012', 'ii0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440004', NULL, 'French Fries', 'https://example.com/fries.png', 'Standard', 2.50, 2.00, 2.00, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 2.00, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW()),
('jj0e8400-e29b-41d4-a716-446655440013', 'ii0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440009', NULL, 'Banana Split', 'https://example.com/banana-split.png', 'Standard', 3.50, 2.63, 2.63, TRUE, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 1, 2.63, NULL, NULL, FALSE, NULL, NULL, NULL, NOW(), NOW());

-- ============================================================================
-- 13. PRODUCT_STOCKS (Inventory levels)
-- ============================================================================
INSERT INTO product_stocks (id, product_id, business_id, quantity_on_hand, reorder_level, is_active, created_at, updated_at) VALUES
-- Phnom Penh stocks
('kk0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 150, 20, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 85, 15, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 42, 10, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 200, 50, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 180, 40, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 500, 100, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', 450, 100, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440008', 'aa0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', 25, 5, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440009', 'aa0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440001', 8, 3, TRUE, NOW(), NOW()),
-- Siem Reap stocks
('kk0e8400-e29b-41d4-a716-446655440010', 'aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 120, 20, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440011', 'aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 95, 20, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440012', 'aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 50, 10, TRUE, NOW(), NOW());

-- ============================================================================
-- 14. PRODUCT_IMAGES (Additional product images)
-- ============================================================================
INSERT INTO product_images (id, product_id, image_url, image_order, created_at, updated_at) VALUES
-- Chicken images
('ll0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'https://example.com/chicken-1pc-alt1.png', 2, NOW(), NOW()),
('ll0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', 'https://example.com/chicken-3pc-alt1.png', 2, NOW(), NOW()),
-- Noodle images
('ll0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440010', 'https://example.com/curry-noodle-alt1.png', 2, NOW(), NOW()),
('ll0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440010', 'https://example.com/curry-noodle-alt2.png', 3, NOW(), NOW());

-- ============================================================================
-- END OF TEST DATA SCRIPT
-- ============================================================================
-- Summary:
-- - 4 Roles
-- - 4 Businesses
-- - 12 Users (6 staff + 2 customers)
-- - 8 Categories (4 per restaurant)
-- - 4 Brands
-- - 13 Products (9 Phnom Penh + 4 Siem Reap)
-- - 7 Product Sizes
-- - 8 Delivery Options (5 Phnom Penh + 3 Siem Reap)
-- - 4 Provinces with Districts, Communes, Villages
-- - 3 Locations (customer addresses)
-- - 4 Orders (mix of PUBLIC and POS, various statuses)
-- - 13 Order Items
-- - 12 Product Stocks
-- - 4 Product Images
-- ============================================================================
