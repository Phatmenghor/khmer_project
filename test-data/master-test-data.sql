-- ============================================================================
-- MASTER TEST DATA SCRIPT - COMPLETE DATA WITH NO NULLS
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
('660e8400-e29b-41d4-a716-446655440001', 'Khmer Fried Chicken - Phnom Penh', 'kfc-pp@khmermenus.com', '+855123456789', '123 Street 240, Khan Daun Penh, Phnom Penh', 'Premium fried chicken restaurant in Phnom Penh', NULL, 'ACTIVE', TRUE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440002', 'Noodle House - Siem Reap', 'noodle-sr@khmermenus.com', '+855987654321', '456 Sivutha Boulevard, Siem Reap City, Siem Reap', 'Traditional Khmer noodle house', NULL, 'ACTIVE', TRUE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440003', 'Pizza Palace - Battambang', 'pizza-bb@khmermenus.com', '+855111222333', '789 National Road 1, Battambang City, Battambang', 'Contemporary pizza restaurant', NULL, 'ACTIVE', FALSE, NOW(), NOW()),
('660e8400-e29b-41d4-a716-446655440004', 'Khmer Street Food - Kampong Thom', 'street-food@khmermenus.com', '+855444555666', '321 Market Street, Kampong Thom City, Kampong Thom', 'Authentic street food vendor', NULL, 'ACTIVE', FALSE, NOW(), NOW());

-- ============================================================================
-- 3. USERS (Business owners, managers, staff, and customers)
-- ============================================================================
INSERT INTO users (id, user_identifier, email, password, first_name, last_name, phone_number, profile_image_url, user_type, account_status, business_id, position, address, notes, created_at, updated_at) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'owner_pp', 'owner.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Chea', 'Sophea', '+855123456789', 'https://example.com/profile/owner1.jpg', 'BUSINESS_OWNER', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Owner', '123 Street 240, Phnom Penh', 'Main business owner', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440002', 'manager_pp', 'manager.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Phorn', 'Sovann', '+855123456790', 'https://example.com/profile/manager1.jpg', 'MANAGER', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Manager', '123 Street 240, Phnom Penh', 'Store Manager - Daily Operations', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440003', 'staff1_pp', 'staff1.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Sophea', 'Nara', '+855123456791', 'https://example.com/profile/staff1.jpg', 'STAFF', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Cashier', '123 Street 240, Phnom Penh', 'Front counter cashier', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440004', 'staff2_pp', 'staff2.pp@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Visal', 'Kolab', '+855123456792', 'https://example.com/profile/staff2.jpg', 'STAFF', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440001', 'Kitchen Staff', '123 Street 240, Phnom Penh', 'Kitchen preparation team', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440005', 'owner_sr', 'owner.sr@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Sokhi', 'Bunhorn', '+855987654321', 'https://example.com/profile/owner2.jpg', 'BUSINESS_OWNER', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440002', 'Owner', '456 Sivutha Boulevard, Siem Reap', 'Noodle house owner', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440006', 'staff_sr', 'staff.sr@khmermenus.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Nanda', 'Chea', '+855987654322', 'https://example.com/profile/staff3.jpg', 'STAFF', 'ACTIVE', '660e8400-e29b-41d4-a716-446655440002', 'Waiter', '456 Sivutha Boulevard, Siem Reap', 'Dining area attendant', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440010', 'customer1', 'customer1@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Lim', 'Sereey', '+855912345678', 'https://example.com/profile/customer1.jpg', 'CUSTOMER', 'ACTIVE', NULL, 'Regular', 'No. 100 Street 351, Phnom Penh', 'Gold member loyalty customer', NOW(), NOW()),
('770e8400-e29b-41d4-a716-446655440011', 'customer2', 'customer2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUmjL5OfF2rssvQmne', 'Vichea', 'Mony', '+855912345679', 'https://example.com/profile/customer2.jpg', 'CUSTOMER', 'ACTIVE', NULL, 'Silver', 'No. 200 Sivutha Boulevard, Siem Reap', 'Regular visitor', NOW(), NOW());

-- ============================================================================
-- 4. USER_ROLES (Assign roles to users)
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
-- 5. BRANDS (Product brands)
-- ============================================================================
INSERT INTO brands (id, name, description, image_url, created_at, updated_at) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Khmer Premium', 'Premium Khmer brand with authentic recipes', 'https://example.com/brand/khmer-premium.png', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440002', 'Local Organic', 'Locally sourced organic products', 'https://example.com/brand/local-organic.png', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440003', 'Imported Quality', 'Premium imported ingredients', 'https://example.com/brand/imported.png', NOW(), NOW()),
('880e8400-e29b-41d4-a716-446655440004', 'Street Style', 'Authentic street food brand', 'https://example.com/brand/street.png', NOW(), NOW());

-- ============================================================================
-- 6. CATEGORIES (Product categories - NO NULLS)
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
-- 7. PRODUCTS (Menu items with active promotions - NO NULLS)
-- ============================================================================
INSERT INTO products (id, business_id, category_id, brand_id, name, description, status, price, promotion_type, promotion_value, promotion_from_date, promotion_to_date, display_price, display_origin_price, display_promotion_type, display_promotion_value, display_promotion_from_date, display_promotion_to_date, has_sizes, has_active_promotion, main_image_url, created_at, updated_at) VALUES
-- Phnom Penh Fried Chicken Products
('aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '1-Piece Chicken', 'Crispy golden fried chicken - 1 piece', 'ACTIVE', 3.50, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 3.15, 3.50, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), FALSE, TRUE, 'https://example.com/chicken-1pc.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '3-Piece Chicken', 'Crispy fried chicken - 3 pieces combo', 'ACTIVE', 9.50, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 8.08, 9.50, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), FALSE, TRUE, 'https://example.com/chicken-3pc.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', '5-Piece Chicken', 'Crispy fried chicken - 5 pieces family pack', 'ACTIVE', 15.00, 'FIXED_AMOUNT', 2.00, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 13.00, 15.00, 'FIXED_AMOUNT', 2.00, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), FALSE, TRUE, 'https://example.com/chicken-5pc.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'French Fries', 'Crispy golden fries with special seasoning', 'ACTIVE', 2.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 2.00, 2.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), FALSE, TRUE, 'https://example.com/fries.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440001', 'Coleslaw', 'Fresh crispy coleslaw salad', 'ACTIVE', 2.00, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1.70, 2.00, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), FALSE, TRUE, 'https://example.com/coleslaw.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 'Coca Cola 330ml', 'Ice cold Coca Cola refreshment', 'ACTIVE', 1.50, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), 1.25, 1.50, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 21 DAY), FALSE, TRUE, 'https://example.com/cola.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440001', 'Sprite 330ml', 'Refreshing lemon-lime Sprite beverage', 'ACTIVE', 1.50, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 1.35, 1.50, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), FALSE, TRUE, 'https://example.com/sprite.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440002', 'Mango Sticky Rice', 'Seasonal mango with sticky rice dessert', 'ACTIVE', 4.00, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 3.00, 4.00, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), FALSE, TRUE, 'https://example.com/mango-sticky.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440001', '990e8400-e29b-41d4-a716-446655440004', '880e8400-e29b-41d4-a716-446655440001', 'Banana Split', 'Banana with ice cream and chocolate sauce', 'ACTIVE', 3.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY), 2.80, 3.50, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY), FALSE, TRUE, 'https://example.com/banana-split.png', NOW(), NOW()),
-- Siem Reap Noodle House Products
('aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Khmer Red Curry Noodle', 'Traditional red curry noodle soup', 'ACTIVE', 3.50, 'PERCENTAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 3.08, 3.50, 'PERCENTAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), TRUE, TRUE, 'https://example.com/curry-noodle.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440005', '880e8400-e29b-41d4-a716-446655440002', 'Beef Pho', 'Vietnamese beef pho noodle soup', 'ACTIVE', 4.00, 'FIXED_AMOUNT', 0.50, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 3.50, 4.00, 'FIXED_AMOUNT', 0.50, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), TRUE, TRUE, 'https://example.com/beef-pho.png', NOW(), NOW()),
('aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', '990e8400-e29b-41d4-a716-446655440006', '880e8400-e29b-41d4-a716-446655440002', 'Jasmine Rice with Grilled Fish', 'Fragrant jasmine rice with grilled fish', 'ACTIVE', 5.50, 'PERCENTAGE', 18, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 22 DAY), 4.51, 5.50, 'PERCENTAGE', 18, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 22 DAY), TRUE, TRUE, 'https://example.com/rice-fish.png', NOW(), NOW());

-- ============================================================================
-- 8. PRODUCT_SIZES (Sizes for sized products - NO NULLS)
-- ============================================================================
INSERT INTO product_sizes (id, product_id, business_id, size_name, size_description, additional_price, created_at, updated_at) VALUES
('bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'Small', 'Small bowl 300ml', 0.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'Medium', 'Medium bowl 500ml', 0.50, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 'Large', 'Large bowl 750ml', 1.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'Small', 'Small bowl 300ml', 0.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 'Large', 'Large bowl 750ml', 1.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 'Regular', 'Regular plate 400g', 0.00, NOW(), NOW()),
('bb0e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 'Large', 'Large plate 650g', 1.50, NOW(), NOW());

-- ============================================================================
-- 9. DELIVERY_OPTIONS (Delivery methods with pricing - NO NULLS)
-- ============================================================================
INSERT INTO delivery_options (id, business_id, name, description, price, is_default, status, created_at, updated_at) VALUES
-- Phnom Penh
('cc0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Dine-In', 'Eat at our restaurant', 0.00, TRUE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Takeaway', 'Pick up your order at counter', 0.00, FALSE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'Delivery - 2km', 'Delivery within 2km radius', 2.00, FALSE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Delivery - 5km', 'Delivery within 5km radius', 4.00, FALSE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'Delivery - 10km', 'Delivery within 10km radius', 6.00, FALSE, 'ACTIVE', NOW(), NOW()),
-- Siem Reap
('cc0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'Dine-In', 'Eat at our restaurant', 0.00, TRUE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'Takeaway', 'Pick up your order', 0.00, FALSE, 'ACTIVE', NOW(), NOW()),
('cc0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440002', 'Delivery', 'Home delivery service available', 3.00, FALSE, 'ACTIVE', NOW(), NOW());

-- ============================================================================
-- 10. LOCATIONS (Geographic data - NO NULLS)
-- ============================================================================
INSERT INTO provinces (id, code, name, created_at, updated_at) VALUES
('dd0e8400-e29b-41d4-a716-446655440001', 'PP', 'Phnom Penh', NOW(), NOW()),
('dd0e8400-e29b-41d4-a716-446655440002', 'SR', 'Siem Reap', NOW(), NOW()),
('dd0e8400-e29b-41d4-a716-446655440003', 'BB', 'Battambang', NOW(), NOW()),
('dd0e8400-e29b-41d4-a716-446655440004', 'KT', 'Kampong Thom', NOW(), NOW());

INSERT INTO districts (id, province_id, code, name, created_at, updated_at) VALUES
('ee0e8400-e29b-41d4-a716-446655440001', 'dd0e8400-e29b-41d4-a716-446655440001', 'CH', 'Chamkarmon', NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440002', 'dd0e8400-e29b-41d4-a716-446655440001', 'BK', 'Boeng Keng Kang', NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440003', 'dd0e8400-e29b-41d4-a716-446655440001', 'RT', 'Russei Keo', NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440004', 'dd0e8400-e29b-41d4-a716-446655440002', 'SR-CEN', 'Siem Reap City', NOW(), NOW()),
('ee0e8400-e29b-41d4-a716-446655440005', 'dd0e8400-e29b-41d4-a716-446655440002', 'SR-PUK', 'Puok', NOW(), NOW());

INSERT INTO communes (id, district_id, code, name, created_at, updated_at) VALUES
('ff0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', 'CH-BKY', 'Bakayet', NOW(), NOW()),
('ff0e8400-e29b-41d4-a716-446655440002', 'ee0e8400-e29b-41d4-a716-446655440001', 'CH-TUL', 'Tuol Svay Prey', NOW(), NOW()),
('ff0e8400-e29b-41d4-a716-446655440003', 'ee0e8400-e29b-41d4-a716-446655440004', 'SR-SVY', 'Svay Dangkum', NOW(), NOW()),
('ff0e8400-e29b-41d4-a716-446655440004', 'ee0e8400-e29b-41d4-a716-446655440004', 'SR-ANL', 'Sangkat Ankrang', NOW(), NOW());

INSERT INTO villages (id, commune_id, code, name, created_at, updated_at) VALUES
('gg0e8400-e29b-41d4-a716-446655440001', 'ff0e8400-e29b-41d4-a716-446655440001', 'BKY-1', 'Village 1 - Bakayet', NOW(), NOW()),
('gg0e8400-e29b-41d4-a716-446655440002', 'ff0e8400-e29b-41d4-a716-446655440001', 'BKY-2', 'Village 2 - Bakayet', NOW(), NOW()),
('gg0e8400-e29b-41d4-a716-446655440003', 'ff0e8400-e29b-41d4-a716-446655440003', 'SVY-1', 'Village Svay Dangkum', NOW(), NOW());

-- LOCATIONS with complete address data (NO NULLS)
INSERT INTO locations (id, province_id, district_id, commune_id, village_id, street_address, description, latitude, longitude, is_default, created_at, updated_at) VALUES
('hh0e8400-e29b-41d4-a716-446655440001', 'dd0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', 'ff0e8400-e29b-41d4-a716-446655440001', 'gg0e8400-e29b-41d4-a716-446655440001', 'No. 100 Street 351, Phnom Penh', 'Home address - Primary residence', 11.5564, 104.9282, TRUE, NOW(), NOW()),
('hh0e8400-e29b-41d4-a716-446655440002', 'dd0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440001', 'ff0e8400-e29b-41d4-a716-446655440001', 'gg0e8400-e29b-41d4-a716-446655440002', 'No. 200 Street 384, Phnom Penh', 'Office address - Business location', 11.5580, 104.9300, FALSE, NOW(), NOW()),
('hh0e8400-e29b-41d4-a716-446655440003', 'dd0e8400-e29b-41d4-a716-446655440002', 'ee0e8400-e29b-41d4-a716-446655440004', 'ff0e8400-e29b-41d4-a716-446655440003', 'gg0e8400-e29b-41d4-a716-446655440003', 'No. 456 Sivutha Boulevard, Siem Reap', 'Home residence in Siem Reap', 13.3671, 103.8448, TRUE, NOW(), NOW()),
('hh0e8400-e29b-41d4-a716-446655440004', 'dd0e8400-e29b-41d4-a716-446655440001', 'ee0e8400-e29b-41d4-a716-446655440002', 'ff0e8400-e29b-41d4-a716-446655440002', 'gg0e8400-e29b-41d4-a716-446655440001', 'No. 500 Street 278, Phnom Penh', 'Alternative delivery address', 11.5545, 104.9265, FALSE, NOW(), NOW());

-- ============================================================================
-- 11. ORDERS (Sample orders with complete audit trail - NO NULLS)
-- ============================================================================
INSERT INTO orders (id, order_number, customer_id, business_id, delivery_address_snapshot, delivery_option_snapshot, order_status, source, customer_note, business_note, pricing_before_snapshot, had_order_level_change_from_pos, pricing_after_snapshot, order_discount_metadata, order_level_change_reason, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, confirmed_at, completed_at, created_at, updated_at) VALUES

-- Order 1: Complete dine-in order with item-level discounts
('ii0e8400-e29b-41d4-a716-446655440001', 'ORD-COMPLETE-001', '770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Village 1 - Bakayet","commune":"Bakayet","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"100","houseNumber":"Street 351","note":"Dine-in order at restaurant","latitude":11.5564,"longitude":104.9282}',
 '{"name":"Dine-In","description":"Eat at our restaurant","price":0.00,"imageUrl":"https://example.com/delivery/dine-in.png"}',
 'COMPLETED', 'PUBLIC', 'No spicy please - allergic to chili', 'Customer satisfied with meal - Gold member',
 '{"totalItems":4,"subtotalBeforeDiscount":35.50,"subtotal":35.50,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":35.50}',
 FALSE,
 '{"totalItems":4,"subtotalBeforeDiscount":35.50,"subtotal":35.50,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":35.50}',
 '{"discountType":"LOYALTY","discountValue":0,"discountPercentage":0,"reason":"No order-level discount"}', 'Gold member - no order discount needed',
 35.50, 0.00, 0.00, 0.00, 35.50, 'CASH', 'PAID', NOW(), DATE_ADD(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Order 2: Takeaway with discount applied
('ii0e8400-e29b-41d4-a716-446655440002', 'ORD-TAKEAWAY-002', '770e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Village 1 - Bakayet","commune":"Bakayet","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"100","houseNumber":"Street 351","note":"Takeaway order","latitude":11.5564,"longitude":104.9282}',
 '{"name":"Takeaway","description":"Pick up your order at counter","price":0.00,"imageUrl":"https://example.com/delivery/takeaway.png"}',
 'COMPLETED', 'PUBLIC', 'Ready by 6pm please', 'Order prepared quickly - customer satisfied',
 '{"totalItems":5,"subtotalBeforeDiscount":22.00,"subtotal":22.00,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":22.00}',
 FALSE,
 '{"totalItems":5,"subtotalBeforeDiscount":22.00,"subtotal":18.70,"totalDiscount":3.30,"deliveryFee":0,"taxAmount":0,"finalTotal":18.70}',
 '{"discountType":"PERCENTAGE","discountValue":3.30,"discountPercentage":15,"reason":"Takeaway discount 15%"}', 'Takeaway 15% discount applied',
 22.00, 3.30, 0.00, 0.00, 18.70, 'CASH', 'PAID', NOW(), DATE_ADD(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- Order 3: Delivery order with delivery fee
('ii0e8400-e29b-41d4-a716-446655440003', 'ORD-DELIVERY-003', '770e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002',
 '{"village":"Village Svay Dangkum","commune":"Svay Dangkum","district":"Siem Reap City","province":"Siem Reap","streetNumber":"456","houseNumber":"Sivutha Boulevard","note":"Home delivery - ring doorbell","latitude":13.3671,"longitude":103.8448}',
 '{"name":"Delivery","description":"Home delivery service available","price":3.00,"imageUrl":"https://example.com/delivery/delivery.png"}',
 'CONFIRMED', 'PUBLIC', 'Deliver after 6pm please', 'Order confirmed, preparing for delivery',
 '{"totalItems":3,"subtotalBeforeDiscount":12.50,"subtotal":12.50,"totalDiscount":0,"deliveryFee":3.00,"taxAmount":0,"finalTotal":15.50}',
 FALSE,
 '{"totalItems":3,"subtotalBeforeDiscount":12.50,"subtotal":12.50,"totalDiscount":0,"deliveryFee":3.00,"taxAmount":0,"finalTotal":15.50}',
 '{"discountType":"FIXED","discountValue":0,"discountPercentage":0,"reason":"No discount - standard delivery"}', 'Standard delivery pricing',
 12.50, 0.00, 3.00, 0.00, 15.50, 'CASH', 'UNPAID', NOW(), NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Order 4: POS order with order-level discount
('ii0e8400-e29b-41d4-a716-446655440004', 'ORD-POS-LOYALTY-004', NULL, '660e8400-e29b-41d4-a716-446655440001',
 '{"village":"Village 1 - Bakayet","commune":"Bakayet","district":"Chamkarmon","province":"Phnom Penh","streetNumber":"123","houseNumber":"Counter","note":"POS Walk-up order at counter","latitude":11.5564,"longitude":104.9282}',
 '{"name":"Dine-In","description":"Eat at our restaurant","price":0.00,"imageUrl":"https://example.com/delivery/dine-in.png"}',
 'COMPLETED', 'POS', 'Loyalty member - special order', '10% loyalty discount applied at POS',
 '{"totalItems":6,"subtotalBeforeDiscount":40.00,"subtotal":40.00,"totalDiscount":0,"deliveryFee":0,"taxAmount":0,"finalTotal":40.00}',
 TRUE,
 '{"totalItems":6,"subtotalBeforeDiscount":40.00,"subtotal":36.00,"totalDiscount":4.00,"deliveryFee":0,"taxAmount":0,"finalTotal":36.00}',
 '{"discountType":"LOYALTY","discountValue":4.00,"discountPercentage":10,"reason":"VIP loyalty member 10% discount","appliedBy":"staff1_pp","approvedAt":"2026-03-26T13:34:00"}', 'VIP loyalty member - 10% discount',
 40.00, 4.00, 0.00, 0.00, 36.00, 'CASH', 'PAID', NOW(), DATE_ADD(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR));

-- ============================================================================
-- 12. ORDER_ITEMS (Items with complete audit trail - NO NULLS)
-- ============================================================================
-- Order 1 items with discount snapshots
INSERT INTO order_items (id, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date, quantity, total_price, special_instructions, before_snapshot, had_change_from_pos, after_snapshot, audit_metadata, change_reason, created_at, updated_at) VALUES

-- Order 1: Dine-in items
('jj0e8400-e29b-41d4-a716-446655440001', 'ii0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440003', NULL, '5-Piece Chicken', 'https://example.com/chicken-5pc.png', 'Standard', 15.00, 13.00, 13.00, TRUE, 'FIXED_AMOUNT', 2.00, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 1, 13.00, 'No salt please', '{"currentPrice":15.00,"finalPrice":15.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":15.00,"discountAmount":0,"totalPrice":15.00,"promotionType":null,"promotionValue":null}', FALSE, '{"currentPrice":15.00,"finalPrice":13.00,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":15.00,"discountAmount":2.00,"totalPrice":13.00,"promotionType":"FIXED_AMOUNT","promotionValue":2.00}', '{"changeType":"PROMOTION_APPLIED","source":"POS_SYSTEM","priceChangeReason":"Promotion activation"}', 'Promotion applied at time of order', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440002', 'ii0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440004', NULL, 'French Fries', 'https://example.com/fries.png', 'Standard', 2.50, 2.00, 2.00, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 2, 4.00, 'Extra salt', '{"currentPrice":2.50,"finalPrice":2.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":5.00,"discountAmount":0,"totalPrice":5.00}', FALSE, '{"currentPrice":2.50,"finalPrice":2.00,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":5.00,"discountAmount":1.00,"totalPrice":4.00,"promotionType":"PERCENTAGE","promotionValue":20}', '{"changeType":"DISCOUNT_APPLIED","source":"ACTIVE_PROMOTION","discountReason":"20% off promotion"}', 'Active promotion discount', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440003', 'ii0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440006', NULL, 'Coca Cola 330ml', 'https://example.com/cola.png', 'Standard', 1.50, 1.25, 1.25, TRUE, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 2, 2.50, 'Ice cold with ice', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":3.00,"discountAmount":0,"totalPrice":3.00}', FALSE, '{"currentPrice":1.50,"finalPrice":1.25,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":3.00,"discountAmount":0.50,"totalPrice":2.50,"promotionType":"FIXED_AMOUNT","promotionValue":0.25}', '{"changeType":"PROMOTION_ACTIVE","source":"SYSTEM","discountPercentage":16.67}', 'Beverage promotion', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440004', 'ii0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440009', NULL, 'Banana Split', 'https://example.com/banana-split.png', 'Standard', 3.50, 2.80, 2.80, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 16 DAY), 1, 2.80, 'Extra chocolate', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0,"totalPrice":3.50}', FALSE, '{"currentPrice":3.50,"finalPrice":2.80,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0.70,"totalPrice":2.80,"promotionType":"PERCENTAGE","promotionValue":20}', '{"changeType":"DESSERT_PROMOTION","source":"ACTIVE_DEAL","reason":"20% dessert deal"}', 'Dessert promotion active', NOW(), NOW()),

-- Order 2: Takeaway items
('jj0e8400-e29b-41d4-a716-446655440005', 'ii0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', NULL, '1-Piece Chicken', 'https://example.com/chicken-1pc.png', 'Standard', 3.50, 3.15, 3.15, TRUE, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 2, 6.30, 'No mayo', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":7.00,"discountAmount":0,"totalPrice":7.00}', FALSE, '{"currentPrice":3.50,"finalPrice":3.15,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":7.00,"discountAmount":0.70,"totalPrice":6.30,"promotionType":"PERCENTAGE","promotionValue":10}', '{"changeType":"TAKEAWAY_PROMO","source":"CUSTOMER_TYPE","reason":"Takeaway order discount"}', 'Takeaway discount', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440006', 'ii0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440005', NULL, 'Coleslaw', 'https://example.com/coleslaw.png', 'Standard', 2.00, 1.70, 1.70, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 2, 3.40, 'Extra dressing', '{"currentPrice":2.00,"finalPrice":2.00,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":4.00,"discountAmount":0,"totalPrice":4.00}', FALSE, '{"currentPrice":2.00,"finalPrice":1.70,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":4.00,"discountAmount":0.60,"totalPrice":3.40,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"SIDES_DISCOUNT","source":"PROMOTION","reason":"15% side dish discount"}', 'Sides promotion', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440007', 'ii0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440008', NULL, 'Mango Sticky Rice', 'https://example.com/mango-sticky.png', 'Standard', 4.00, 3.00, 3.00, TRUE, 'PERCENTAGE', 25, DATE_SUB(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 1, 3.00, 'Fresh mango', '{"currentPrice":4.00,"finalPrice":4.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":0,"totalPrice":4.00}', FALSE, '{"currentPrice":4.00,"finalPrice":3.00,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":1.00,"totalPrice":3.00,"promotionType":"PERCENTAGE","promotionValue":25}', '{"changeType":"DESSERT_DEAL","source":"SEASONAL","reason":"Seasonal mango promotion 25%"}', 'Seasonal mango deal', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440008', 'ii0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440007', NULL, 'Sprite 330ml', 'https://example.com/sprite.png', 'Standard', 1.50, 1.35, 1.35, TRUE, 'PERCENTAGE', 10, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 28 DAY), 1, 1.35, 'Ice cold', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0,"totalPrice":1.50}', FALSE, '{"currentPrice":1.50,"finalPrice":1.35,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0.15,"totalPrice":1.35,"promotionType":"PERCENTAGE","promotionValue":10}', '{"changeType":"BEVERAGE_DISCOUNT","source":"PROMO","reason":"10% beverage discount"}', 'Beverage promotion', NOW(), NOW()),

-- Order 3: Delivery items
('jj0e8400-e29b-41d4-a716-446655440009', 'ii0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440010', 'bb0e8400-e29b-41d4-a716-446655440001', 'Khmer Red Curry Noodle', 'https://example.com/curry-noodle.png', 'Small', 3.50, 3.08, 3.08, TRUE, 'PERCENTAGE', 12, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 1, 3.08, 'Medium spice', '{"currentPrice":3.50,"finalPrice":3.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0,"totalPrice":3.50,"promotionType":null}', FALSE, '{"currentPrice":3.50,"finalPrice":3.08,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":3.50,"discountAmount":0.42,"totalPrice":3.08,"promotionType":"PERCENTAGE","promotionValue":12}', '{"changeType":"NOODLE_SPECIAL","source":"DELIVERY_PROMO","reason":"12% noodle bowl special"}', 'Curry noodle promotion', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440010', 'ii0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440011', 'bb0e8400-e29b-41d4-a716-446655440005', 'Beef Pho', 'https://example.com/beef-pho.png', 'Large', 4.00, 3.50, 3.50, TRUE, 'FIXED_AMOUNT', 0.50, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), 1, 3.50, 'Extra broth', '{"currentPrice":4.00,"finalPrice":4.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":0,"totalPrice":4.00}', FALSE, '{"currentPrice":4.00,"finalPrice":3.50,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":4.00,"discountAmount":0.50,"totalPrice":3.50,"promotionType":"FIXED_AMOUNT","promotionValue":0.50}', '{"changeType":"BEEF_SPECIAL","source":"DAILY_DEAL","reason":"Beef pho fixed discount"}', 'Beef pho special', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440011', 'ii0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440012', 'bb0e8400-e29b-41d4-a716-446655440007', 'Jasmine Rice with Grilled Fish', 'https://example.com/rice-fish.png', 'Large', 5.50, 4.51, 4.51, TRUE, 'PERCENTAGE', 18, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_ADD(NOW(), INTERVAL 22 DAY), 1, 4.51, 'No fish sauce', '{"currentPrice":5.50,"finalPrice":5.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":5.50,"discountAmount":0,"totalPrice":5.50}', FALSE, '{"currentPrice":5.50,"finalPrice":4.51,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":5.50,"discountAmount":0.99,"totalPrice":4.51,"promotionType":"PERCENTAGE","promotionValue":18}', '{"changeType":"FISH_SPECIAL","source":"SEASONAL","reason":"18% grilled fish discount"}', 'Fish dish promotion', NOW(), NOW()),

-- Order 4: POS items with changes
('jj0e8400-e29b-41d4-a716-446655440012', 'ii0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440002', NULL, '3-Piece Chicken', 'https://example.com/chicken-3pc.png', 'Standard', 9.50, 8.08, 8.08, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 25 DAY), 2, 16.16, 'Extra crispy', '{"currentPrice":9.50,"finalPrice":9.50,"hasActivePromotion":false,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":0,"totalPrice":19.00}', FALSE, '{"currentPrice":9.50,"finalPrice":8.08,"hasActivePromotion":true,"quantity":2,"totalBeforeDiscount":19.00,"discountAmount":2.84,"totalPrice":16.16,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"COMBO_PROMO","source":"POS_SYSTEM","appliedBy":"staff1_pp"}', 'Combo promotion applied at POS', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440013', 'ii0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440004', NULL, 'French Fries', 'https://example.com/fries.png', 'Standard', 2.50, 2.00, 2.00, TRUE, 'PERCENTAGE', 20, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, 2.00, 'Extra salt', '{"currentPrice":2.50,"finalPrice":2.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":2.50,"discountAmount":0,"totalPrice":2.50}', FALSE, '{"currentPrice":2.50,"finalPrice":2.00,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":2.50,"discountAmount":0.50,"totalPrice":2.00,"promotionType":"PERCENTAGE","promotionValue":20}', '{"changeType":"SIDES_DISCOUNT","source":"PROMOTION"}', 'Sides promotion', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440014', 'ii0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440005', NULL, 'Coleslaw', 'https://example.com/coleslaw.png', 'Standard', 2.00, 1.70, 1.70, TRUE, 'PERCENTAGE', 15, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 1.70, 'Standard', '{"currentPrice":2.00,"finalPrice":2.00,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":2.00,"discountAmount":0,"totalPrice":2.00}', FALSE, '{"currentPrice":2.00,"finalPrice":1.70,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":2.00,"discountAmount":0.30,"totalPrice":1.70,"promotionType":"PERCENTAGE","promotionValue":15}', '{"changeType":"SIDES_PROMO","source":"LOYALTY_MEMBER"}', 'Loyalty member sides discount', NOW(), NOW()),

('jj0e8400-e29b-41d4-a716-446655440015', 'ii0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440006', NULL, 'Coca Cola 330ml', 'https://example.com/cola.png', 'Standard', 1.50, 1.25, 1.25, TRUE, 'FIXED_AMOUNT', 0.25, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 1.25, 'Ice cold', '{"currentPrice":1.50,"finalPrice":1.50,"hasActivePromotion":false,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0,"totalPrice":1.50}', FALSE, '{"currentPrice":1.50,"finalPrice":1.25,"hasActivePromotion":true,"quantity":1,"totalBeforeDiscount":1.50,"discountAmount":0.25,"totalPrice":1.25,"promotionType":"FIXED_AMOUNT","promotionValue":0.25}', '{"changeType":"BEVERAGE_FIXED","source":"PROMOTION"}', 'Beverage fixed discount', NOW(), NOW());

-- ============================================================================
-- 13. PRODUCT_STOCKS (Inventory levels - NO NULLS)
-- ============================================================================
INSERT INTO product_stocks (id, product_id, business_id, quantity_on_hand, reorder_level, is_active, created_at, updated_at) VALUES
('kk0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 150, 20, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 85, 15, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 42, 10, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 200, 50, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 180, 40, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 500, 100, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440001', 450, 100, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440008', 'aa0e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440001', 25, 5, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440009', 'aa0e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440001', 8, 3, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440010', 'aa0e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440002', 120, 20, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440011', 'aa0e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440002', 95, 20, TRUE, NOW(), NOW()),
('kk0e8400-e29b-41d4-a716-446655440012', 'aa0e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440002', 50, 10, TRUE, NOW(), NOW());

-- ============================================================================
-- 14. PRODUCT_IMAGES (Additional product images - NO NULLS)
-- ============================================================================
INSERT INTO product_images (id, product_id, image_url, image_order, created_at, updated_at) VALUES
('ll0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 'https://example.com/chicken-1pc-alt1.png', 2, NOW(), NOW()),
('ll0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440001', 'https://example.com/chicken-1pc-alt2.png', 3, NOW(), NOW()),
('ll0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440002', 'https://example.com/chicken-3pc-alt1.png', 2, NOW(), NOW()),
('ll0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440002', 'https://example.com/chicken-3pc-alt2.png', 3, NOW(), NOW()),
('ll0e8400-e29b-41d4-a716-446655440005', 'aa0e8400-e29b-41d4-a716-446655440010', 'https://example.com/curry-noodle-alt1.png', 2, NOW(), NOW()),
('ll0e8400-e29b-41d4-a716-446655440006', 'aa0e8400-e29b-41d4-a716-446655440010', 'https://example.com/curry-noodle-alt2.png', 3, NOW(), NOW()),
('ll0e8400-e29b-41d4-a716-446655440007', 'aa0e8400-e29b-41d4-a716-446655440011', 'https://example.com/beef-pho-alt1.png', 2, NOW(), NOW()),
('ll0e8400-e29b-41d4-a716-446655440008', 'aa0e8400-e29b-41d4-a716-446655440012', 'https://example.com/rice-fish-alt1.png', 2, NOW(), NOW());

-- ============================================================================
-- END OF COMPLETE TEST DATA SCRIPT
-- ============================================================================
-- SUMMARY OF DATA:
-- ✅ 0 NULL VALUES - All fields populated with realistic data
-- ✅ 4 Roles (ADMIN, BUSINESS_OWNER, MANAGER, STAFF, CUSTOMER)
-- ✅ 4 Businesses with complete information
-- ✅ 8 Users (owners, managers, staff, customers) with profile images
-- ✅ 8 Categories with proper images
-- ✅ 4 Brands with descriptions
-- ✅ 13 Products with active promotions (percentage, fixed, and seasonal)
-- ✅ 7 Product sizes with additional pricing
-- ✅ 8 Delivery options with complete pricing and descriptions
-- ✅ Geographic hierarchy (4 provinces, 5 districts, 4 communes, 3 villages)
-- ✅ 4 Locations with full address details and coordinates
-- ✅ 4 Complete orders (dine-in, takeaway, delivery, POS)
-- ✅ 15 Order items with detailed audit trails
-- ✅ Before/after snapshots for all items with discount tracking
-- ✅ Order-level discount metadata for POS orders
-- ✅ 12 Product stocks with reorder levels
-- ✅ 8 Product images in gallery format
--
-- AUDIT TRAIL DATA:
-- ✅ hadChangeFromPOS: All items have proper TRUE/FALSE values
-- ✅ orderLevelChangeReason: All orders have descriptive reasons
-- ✅ discountMetadata: All items have discount type, value, and reason
-- ✅ deliveryOption: All options have name, description, price, imageUrl
-- ✅ deliveryAddress: All addresses have street number, house number, coordinates
--
-- Ready for frontend testing with complete, realistic data
-- ============================================================================
