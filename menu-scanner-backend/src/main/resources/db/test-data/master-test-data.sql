-- ============================================
-- TEST DATA FOR KHMER E-MENU PLATFORM
-- Complete sample data for development and testing
-- ============================================

-- ============================================
-- 1. USERS (Customers and Business Owners)
-- ============================================
INSERT INTO users (id, first_name, last_name, phone_number, email, username, password, is_business_user, business_id, is_deleted, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John', 'Doe', '+855123456789', 'john@example.com', 'john_doe', 'hashed_password_123', false, NULL, false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Jane', 'Smith', '+855987654321', 'jane@example.com', 'jane_smith', 'hashed_password_456', false, NULL, false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Sokha', 'Restaurant', '+855977123456', 'sokha@restaurant.com', 'sokha_owner', 'hashed_password_789', true, '550e8400-e29b-41d4-a716-446655550001', false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Mealtime', 'Cafe', '+855988654321', 'mealtime@cafe.com', 'mealtime_owner', 'hashed_password_012', true, '550e8400-e29b-41d4-a716-446655550002', false, NOW(), NOW());

-- ============================================
-- 2. BUSINESSES
-- ============================================
INSERT INTO businesses (id, name, phone_number, email, address, description, is_deleted, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655550001', 'Sokha Restaurant', '+855977123456', 'sokha@restaurant.com', '123 Main Street, Phnom Penh', 'Best Khmer Cuisine in Town', false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655550002', 'Mealtime Cafe', '+855988654321', 'mealtime@cafe.com', '456 Riverside Road, Phnom Penh', 'Modern Cafe with Wi-Fi', false, NOW(), NOW());

-- ============================================
-- 3. PRODUCTS AND PRODUCT SIZES
-- ============================================
INSERT INTO products (id, business_id, name, description, price, main_image_url, has_active_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date, is_deleted, created_at, updated_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655550001', 'Amok Fish', 'Khmer curry cooked in coconut milk', 5.50, 'https://example.com/amok.jpg', true, 'PERCENTAGE', 10.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), false, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655550001', 'Lok Lak', 'Beef stir-fried with lime and pepper', 6.00, 'https://example.com/loklak.jpg', false, NULL, NULL, NULL, NULL, false, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655550002', 'Iced Coffee', 'Vietnamese-style iced coffee', 2.50, 'https://example.com/coffee.jpg', true, 'FIXED_AMOUNT', 0.50, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), false, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655550002', 'Fresh Juice', 'Orange or Mango juice', 1.80, 'https://example.com/juice.jpg', false, NULL, NULL, NULL, NULL, false, NOW(), NOW());

INSERT INTO product_sizes (id, product_id, name, price_adjustment, is_deleted, created_at, updated_at) VALUES
('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Small', -0.50, false, NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440001', 'Large', 0.50, false, NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Small Cup', 0.00, false, NOW(), NOW()),
('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440003', 'Large Cup', 0.50, false, NOW(), NOW());

-- ============================================
-- 4. DELIVERY OPTIONS
-- ============================================
INSERT INTO delivery_options (id, business_id, name, description, price, image_url, is_deleted, created_at, updated_at) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655550001', 'Pickup', 'Pickup at restaurant', 0.00, 'https://example.com/pickup.jpg', false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655550001', 'Delivery (Within 3km)', 'Free delivery within 3km', 0.00, 'https://example.com/delivery.jpg', false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655550001', 'Delivery (3-5km)', 'Delivery fee for 3-5km', 2.00, 'https://example.com/delivery.jpg', false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655550002', 'Pickup', 'Pickup at cafe', 0.00, 'https://example.com/pickup.jpg', false, NOW(), NOW()),
('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655550002', 'Delivery', 'Delivery available', 1.50, 'https://example.com/delivery.jpg', false, NOW(), NOW());

-- ============================================
-- 5. ORDERS
-- ============================================
INSERT INTO orders (id, business_id, customer_id, order_number, order_status, source, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, payment_method, payment_status, customer_note, business_note, had_order_level_change_from_pos, order_level_change_reason, is_deleted, created_by, updated_by, created_at, updated_at) VALUES
-- Order 1: Sokha Restaurant - Completed
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655550001', '550e8400-e29b-41d4-a716-446655440001', 'ORD-2026-00001', 'COMPLETED', 'WEB', 11.50, 1.15, 0.00, 0.00, 10.35, 'CARD', 'PAID', 'No spicy please', 'Prepared with care', false, 'No changes', false, '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- Order 2: Sokha Restaurant - Pending
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655550001', '550e8400-e29b-41d4-a716-446655440002', 'ORD-2026-00002', 'PENDING', 'WEB', 6.00, 0.00, 0.00, 0.00, 6.00, 'CASH', 'PENDING', NULL, NULL, false, 'No changes', false, '550e8400-e29b-41d4-a716-446655440002', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- Order 3: Mealtime Cafe - Completed (POS)
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655550002', '550e8400-e29b-41d4-a716-446655440001', 'ORD-2026-00003', 'COMPLETED', 'POS', 4.30, 0.00, 1.50, 0.00, 5.80, 'CASH', 'PAID', NULL, NULL, false, 'No changes', false, '550e8400-e29b-41d4-a716-446655440004', NULL, NOW(), NOW());

-- ============================================
-- 6. ORDER DELIVERY ADDRESSES (Snapshots)
-- ============================================
INSERT INTO order_delivery_addresses (id, order_id, village, commune, district, province, street_number, house_number, note, latitude, longitude, created_at, updated_at) VALUES
-- Order 1 delivery address
('a50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'Chbar Ampov', 'Chbar Ampov', 'Chbar Ampov', 'Phnom Penh', '123', 'A', 'Gate near pharmacy', 11.5731, 104.9367, NOW(), NOW()),
-- Order 2 delivery address
('a50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440002', 'Tuol Kouk', 'Tuol Kouk', 'Tuol Kouk', 'Phnom Penh', '456', 'B', 'Apartment 4th floor', 11.5548, 104.9282, NOW(), NOW()),
-- Order 3 delivery address
('a50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440003', 'Sangkat Toul Svay Prey', 'Boeng Trabek', 'Chhamnuak', 'Phnom Penh', '789', 'C', 'Office building reception', 11.5398, 104.8978, NOW(), NOW());

-- ============================================
-- 7. ORDER DELIVERY OPTIONS (Snapshots)
-- ============================================
INSERT INTO order_delivery_options (id, order_id, name, description, image_url, price, created_at, updated_at) VALUES
-- Order 1: Free delivery within 3km
('b50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'Delivery (Within 3km)', 'Free delivery within 3km', 'https://example.com/delivery.jpg', 0.00, NOW(), NOW()),
-- Order 2: Delivery 3-5km
('b50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440002', 'Delivery (3-5km)', 'Delivery fee for 3-5km', 'https://example.com/delivery.jpg', 2.00, NOW(), NOW()),
-- Order 3: Pickup at cafe
('b50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440003', 'Pickup', 'Pickup at cafe', 'https://example.com/pickup.jpg', 0.00, NOW(), NOW());

-- ============================================
-- 8. ORDER ITEMS
-- ============================================
INSERT INTO order_items (id, order_id, product_id, product_size_id, product_name, product_image_url, size_name, current_price, final_price, unit_price, quantity, has_promotion, promotion_type, promotion_value, promotion_from_date, promotion_to_date, total_price, had_change_from_pos, change_reason, special_instructions, is_deleted, created_at, updated_at) VALUES
-- Order 1 items
('c50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'Amok Fish', 'https://example.com/amok.jpg', 'Small', 5.00, 4.50, 4.50, 2, true, 'PERCENTAGE', 10.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 9.00, false, NULL, 'Less salt', false, NOW(), NOW()),
-- Order 2 items
('c50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', NULL, 'Lok Lak', 'https://example.com/loklak.jpg', NULL, 6.00, 6.00, 6.00, 1, false, NULL, NULL, NULL, NULL, 6.00, false, NULL, NULL, false, NOW(), NOW()),
-- Order 3 items
('c50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440003', 'Iced Coffee', 'https://example.com/coffee.jpg', 'Small Cup', 2.50, 2.00, 2.00, 2, true, 'FIXED_AMOUNT', 0.50, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 4.00, false, NULL, NULL, false, NOW(), NOW());

-- ============================================
-- 9. ORDER ITEM PRICING SNAPSHOTS
-- ============================================
-- Order 1, Item 1: Amok Fish with discount
INSERT INTO order_item_pricing_snapshots (id, order_item_id,
    before_current_price, before_final_price, before_has_active_promotion, before_discount_amount, before_total_price, before_promotion_type, before_promotion_value, before_promotion_from_date, before_promotion_to_date,
    after_current_price, after_final_price, after_has_active_promotion, after_discount_amount, after_total_price, after_promotion_type, after_promotion_value, after_promotion_from_date, after_promotion_to_date,
    created_at, updated_at) VALUES
('d50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001',
    5.00, 4.50, true, 0.50, 9.00, 'PERCENTAGE', 10.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY),
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NOW(), NOW());

-- Order 2, Item 1: Lok Lak without discount
INSERT INTO order_item_pricing_snapshots (id, order_item_id,
    before_current_price, before_final_price, before_has_active_promotion, before_discount_amount, before_total_price, before_promotion_type, before_promotion_value, before_promotion_from_date, before_promotion_to_date,
    after_current_price, after_final_price, after_has_active_promotion, after_discount_amount, after_total_price, after_promotion_type, after_promotion_value, after_promotion_from_date, after_promotion_to_date,
    created_at, updated_at) VALUES
('d50e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440002',
    6.00, 6.00, false, 0.00, 6.00, NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NOW(), NOW());

-- Order 3, Item 1: Iced Coffee with discount
INSERT INTO order_item_pricing_snapshots (id, order_item_id,
    before_current_price, before_final_price, before_has_active_promotion, before_discount_amount, before_total_price, before_promotion_type, before_promotion_value, before_promotion_from_date, before_promotion_to_date,
    after_current_price, after_final_price, after_has_active_promotion, after_discount_amount, after_total_price, after_promotion_type, after_promotion_value, after_promotion_from_date, after_promotion_to_date,
    created_at, updated_at) VALUES
('d50e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440003',
    2.50, 2.00, true, 1.00, 4.00, 'FIXED_AMOUNT', 0.50, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY),
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    NOW(), NOW());

-- ============================================
-- 10. ORDER STATUS HISTORY
-- ============================================
INSERT INTO order_status_history (id, order_id, order_status, note, changed_by_user_id, changed_by_name, is_deleted, created_at, updated_at) VALUES
-- Order 1 status history
('e50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'PENDING', 'Order placed', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', false, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
('e50e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440001', 'CONFIRMED', 'Order confirmed by kitchen', '550e8400-e29b-41d4-a716-446655440003', 'Sokha Restaurant', false, DATE_SUB(NOW(), INTERVAL 1.8 DAY), DATE_SUB(NOW(), INTERVAL 1.8 DAY)),
('e50e8400-e29b-41d4-a716-446655440003', '950e8400-e29b-41d4-a716-446655440001', 'COMPLETED', 'Order delivered successfully', '550e8400-e29b-41d4-a716-446655440003', 'Sokha Restaurant', false, DATE_SUB(NOW(), INTERVAL 1.5 DAY), DATE_SUB(NOW(), INTERVAL 1.5 DAY)),
-- Order 2 status history
('e50e8400-e29b-41d4-a716-446655440004', '950e8400-e29b-41d4-a716-446655440002', 'PENDING', 'Order placed', '550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', false, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- Order 3 status history (POS)
('e50e8400-e29b-41d4-a716-446655440005', '950e8400-e29b-41d4-a716-446655440003', 'COMPLETED', 'POS order completed', '550e8400-e29b-41d4-a716-446655440004', 'Mealtime Cafe', false, NOW(), NOW());

-- ============================================
-- 11. ORDER PAYMENTS
-- ============================================
INSERT INTO order_payments (id, business_id, order_id, payment_reference, status, payment_method, subtotal, discount_amount, delivery_fee, tax_amount, total_amount, customer_payment_method, is_deleted, created_at, updated_at) VALUES
-- Order 1 payment
('f50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655550001', '950e8400-e29b-41d4-a716-446655440001', 'PAY-2026-00001', 'PAID', 'CARD', 11.50, 1.15, 0.00, 0.00, 10.35, 'Visa Card ****1234', false, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY)),
-- Order 2 payment (pending)
('f50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655550001', '950e8400-e29b-41d4-a716-446655440002', 'PAY-2026-00002', 'PENDING', 'CASH', 6.00, 0.00, 0.00, 0.00, 6.00, NULL, false, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY)),
-- Order 3 payment (POS)
('f50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655550002', '950e8400-e29b-41d4-a716-446655440003', 'PAY-2026-00003', 'PAID', 'CASH', 4.30, 0.00, 1.50, 0.00, 5.80, 'Cash', false, NOW(), NOW());

-- ============================================
-- 12. CARTS (Optional - for testing cart operations)
-- ============================================
INSERT INTO carts (id, user_id, business_id, is_deleted, created_at, updated_at) VALUES
('560e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655550001', false, NOW(), NOW()),
('560e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655550002', false, NOW(), NOW());

-- ============================================
-- SUMMARY OF TEST DATA
-- ============================================
-- Users: 4 (2 customers, 2 business owners)
-- Businesses: 2
-- Products: 4 (with sizes and promotions)
-- Delivery Options: 5
-- Orders: 3 (different statuses, sources)
-- Order Items: 3 (with different pricing scenarios)
-- Pricing Snapshots: 3 (tracking before/after pricing)
-- Status History: 5 records
-- Payments: 3
-- Delivery Addresses: 3
-- Delivery Options (Snapshots): 3
-- ============================================
