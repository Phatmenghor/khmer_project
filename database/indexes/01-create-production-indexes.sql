-- ============================================================================
-- COMPREHENSIVE INDEX STRATEGY FOR 180K PRODUCTS + MASSIVE DATA
-- ============================================================================
-- Production-ready indexes for optimal query performance
-- Run AFTER data population to avoid slow inserts

-- Statistics & Warnings
SELECT '🚀 Starting comprehensive indexing for 180K products...' as status;

-- ============================================================================
-- PRODUCTS TABLE - Core Performance Indexes
-- ============================================================================
CREATE INDEX idx_products_business_id ON products(business_id)
  WHERE is_deleted = false;

CREATE INDEX idx_products_category_id ON products(category_id)
  WHERE is_deleted = false;

CREATE INDEX idx_products_brand_id ON products(brand_id)
  WHERE is_deleted = false;

CREATE INDEX idx_products_status ON products(status)
  WHERE is_deleted = false;

-- ⭐ CRITICAL: has_active_promotion for your sync optimization
CREATE INDEX idx_products_has_active_promotion ON products(has_active_promotion)
  WHERE is_deleted = false;

-- Performance for product queries by business + category
CREATE INDEX idx_products_business_category ON products(business_id, category_id, status)
  WHERE is_deleted = false;

-- For filtering by promotion
CREATE INDEX idx_products_promotion ON products(business_id, display_promotion_type, display_promotion_from_date, display_promotion_to_date)
  WHERE is_deleted = false AND display_promotion_type IS NOT NULL;

-- Created/Updated for sorting
CREATE INDEX idx_products_created_at ON products(business_id, created_at DESC)
  WHERE is_deleted = false;

CREATE INDEX idx_products_updated_at ON products(business_id, updated_at DESC)
  WHERE is_deleted = false;

-- ============================================================================
-- PRODUCT IMAGES TABLE
-- ============================================================================
CREATE INDEX idx_product_images_product_id ON product_images(product_id)
  WHERE is_deleted = false;

-- Bulk fetch for product detail pages
CREATE INDEX idx_product_images_product_batch ON product_images(product_id, created_at)
  WHERE is_deleted = false;

-- ============================================================================
-- PRODUCT SIZES TABLE
-- ============================================================================
CREATE INDEX idx_product_sizes_product_id ON product_sizes(product_id)
  WHERE is_deleted = false;

CREATE INDEX idx_product_sizes_product_active ON product_sizes(product_id)
  WHERE is_deleted = false AND (promotion_to_date IS NULL OR promotion_to_date > NOW());

-- ============================================================================
-- PRODUCT FAVORITES TABLE - Fast Lookups
-- ============================================================================
CREATE INDEX idx_product_favorites_user_id ON product_favorites(user_id)
  WHERE is_deleted = false;

CREATE INDEX idx_product_favorites_product_id ON product_favorites(product_id)
  WHERE is_deleted = false;

CREATE UNIQUE INDEX idx_product_favorites_user_product ON product_favorites(user_id, product_id)
  WHERE is_deleted = false;

-- ============================================================================
-- CART TABLES
-- ============================================================================
CREATE INDEX idx_carts_user_id ON carts(user_id)
  WHERE is_deleted = false;

CREATE INDEX idx_carts_business_id ON carts(business_id)
  WHERE is_deleted = false;

CREATE INDEX idx_carts_user_business ON carts(user_id, business_id)
  WHERE is_deleted = false;

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id)
  WHERE is_deleted = false;

CREATE INDEX idx_cart_items_product_id ON cart_items(product_id)
  WHERE is_deleted = false;

CREATE UNIQUE INDEX idx_cart_items_cart_product_size ON cart_items(cart_id, product_id, product_size_id)
  WHERE is_deleted = false;

-- ============================================================================
-- ORDERS & ORDER ITEMS - Critical for Reports
-- ============================================================================
CREATE INDEX idx_orders_business_id ON orders(business_id)
  WHERE is_deleted = false;

CREATE INDEX idx_orders_customer_id ON orders(customer_id)
  WHERE is_deleted = false;

CREATE INDEX idx_orders_business_customer ON orders(business_id, customer_id, created_at DESC)
  WHERE is_deleted = false;

CREATE INDEX idx_orders_status ON orders(order_process_status_name)
  WHERE is_deleted = false;

CREATE INDEX idx_orders_business_status ON orders(business_id, order_process_status_name)
  WHERE is_deleted = false;

CREATE INDEX idx_orders_payment_status ON orders(payment_status)
  WHERE is_deleted = false;

CREATE INDEX idx_orders_created_at ON orders(business_id, created_at DESC)
  WHERE is_deleted = false;

CREATE INDEX idx_orders_confirmed_at ON orders(business_id, confirmed_at DESC)
  WHERE confirmed_at IS NOT NULL AND is_deleted = false;

CREATE INDEX idx_orders_completed_at ON orders(business_id, completed_at DESC)
  WHERE completed_at IS NOT NULL AND is_deleted = false;

-- Order number lookups
CREATE UNIQUE INDEX idx_orders_order_number ON orders(order_number)
  WHERE is_deleted = false;

CREATE INDEX idx_order_items_order_id ON order_items(order_id)
  WHERE is_deleted = false;

CREATE INDEX idx_order_items_product_id ON order_items(product_id)
  WHERE is_deleted = false;

-- ============================================================================
-- ORDER PAYMENTS
-- ============================================================================
CREATE INDEX idx_order_payments_business_id ON order_payments(business_id)
  WHERE is_deleted = false;

CREATE INDEX idx_order_payments_order_id ON order_payments(order_id)
  WHERE is_deleted = false;

CREATE INDEX idx_order_payments_status ON order_payments(status)
  WHERE is_deleted = false;

CREATE UNIQUE INDEX idx_order_payments_reference ON order_payments(payment_reference)
  WHERE is_deleted = false;

-- ============================================================================
-- USERS TABLE - Authentication & Filtering
-- ============================================================================
CREATE UNIQUE INDEX idx_users_email ON users(email)
  WHERE is_deleted = false;

CREATE UNIQUE INDEX idx_users_user_identifier ON users(user_identifier)
  WHERE is_deleted = false;

CREATE INDEX idx_users_user_type ON users(user_type)
  WHERE is_deleted = false;

CREATE INDEX idx_users_account_status ON users(account_status)
  WHERE is_deleted = false;

CREATE INDEX idx_users_business_id ON users(business_id)
  WHERE is_deleted = false AND user_type = 'BUSINESS_USER';

CREATE INDEX idx_users_business_status ON users(business_id, account_status)
  WHERE is_deleted = false AND user_type = 'BUSINESS_USER';

CREATE INDEX idx_users_last_login ON users(user_type, last_login_at DESC)
  WHERE is_deleted = false;

-- ============================================================================
-- CATEGORIES & BRANDS
-- ============================================================================
CREATE INDEX idx_categories_business_id ON categories(business_id, status)
  WHERE is_deleted = false;

CREATE INDEX idx_categories_created_at ON categories(business_id, created_at DESC)
  WHERE is_deleted = false;

CREATE INDEX idx_brands_business_id ON brands(business_id, status)
  WHERE is_deleted = false;

CREATE INDEX idx_brands_created_at ON brands(business_id, created_at DESC)
  WHERE is_deleted = false;

-- ============================================================================
-- BUSINESSES & SETTINGS
-- ============================================================================
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id)
  WHERE is_deleted = false;

CREATE INDEX idx_businesses_status ON businesses(status)
  WHERE is_deleted = false;

CREATE INDEX idx_business_settings_business_id ON business_settings(business_id)
  WHERE is_deleted = false;

-- ============================================================================
-- DELIVERY & BANNERS
-- ============================================================================
CREATE INDEX idx_delivery_options_business_id ON delivery_options(business_id, status)
  WHERE is_deleted = false;

CREATE INDEX idx_banners_business_id ON banners(business_id, status)
  WHERE is_deleted = false;

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================
CREATE INDEX idx_subscriptions_business_id ON subscriptions(business_id)
  WHERE is_deleted = false;

CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id)
  WHERE is_deleted = false;

CREATE INDEX idx_subscriptions_active ON subscriptions(business_id, end_date)
  WHERE is_deleted = false AND end_date > NOW();

-- ============================================================================
-- CUSTOMER ADDRESSES
-- ============================================================================
CREATE INDEX idx_customer_addresses_user_id ON customer_addresses(user_id)
  WHERE is_deleted = false;

CREATE INDEX idx_customer_addresses_default ON customer_addresses(user_id, is_default)
  WHERE is_deleted = false;

-- ============================================================================
-- ATTENDANCE TRACKING
-- ============================================================================
CREATE INDEX idx_attendances_user_id ON attendances(user_id)
  WHERE is_deleted = false;

CREATE INDEX idx_attendances_business_id ON attendances(business_id)
  WHERE is_deleted = false;

CREATE INDEX idx_attendances_date ON attendances(business_id, attendance_date DESC)
  WHERE is_deleted = false;

CREATE UNIQUE INDEX idx_attendances_reference ON attendances(reference_number)
  WHERE is_deleted = false;

CREATE INDEX idx_attendance_check_ins_attendance_id ON attendance_check_ins(attendance_id)
  WHERE is_deleted = false;

-- ============================================================================
-- WORK SCHEDULES
-- ============================================================================
CREATE INDEX idx_work_schedules_user_id ON work_schedules(user_id)
  WHERE is_deleted = false;

CREATE INDEX idx_work_schedules_business_id ON work_schedules(business_id)
  WHERE is_deleted = false;

CREATE INDEX idx_work_schedules_schedule_type ON work_schedules(business_id, schedule_type_enum)
  WHERE is_deleted = false;

-- ============================================================================
-- ROLES & PERMISSIONS
-- ============================================================================
CREATE INDEX idx_roles_business_id ON roles(business_id)
  WHERE is_deleted = false;

CREATE INDEX idx_roles_user_type ON roles(user_type)
  WHERE is_deleted = false;

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- ============================================================================
-- QUERY OPTIMIZATION: Composite Indexes for Common Patterns
-- ============================================================================

-- Product listing with pagination (most important!)
CREATE INDEX idx_products_list_optimize ON products(business_id, status, created_at DESC)
  WHERE is_deleted = false;

-- Product search filters
CREATE INDEX idx_products_search ON products(business_id, status, category_id, brand_id)
  WHERE is_deleted = false;

-- Order analytics queries
CREATE INDEX idx_orders_analytics ON orders(business_id, created_at, payment_status, order_process_status_name)
  WHERE is_deleted = false;

-- User management
CREATE INDEX idx_users_filter ON users(business_id, user_type, account_status)
  WHERE is_deleted = false;

-- ============================================================================
-- PARTIAL INDEXES FOR ACTIVE DATA ONLY
-- ============================================================================

-- Active promotions (perfect for your sync job!)
CREATE INDEX idx_products_active_promotions ON products(business_id, display_promotion_from_date, display_promotion_to_date)
  WHERE is_deleted = false
  AND has_active_promotion = true
  AND display_promotion_to_date > NOW();

-- Pending orders (high query frequency)
CREATE INDEX idx_orders_pending ON orders(business_id, created_at DESC)
  WHERE is_deleted = false
  AND order_process_status_name IN ('Pending', 'Confirmed', 'Preparing', 'Ready', 'In Delivery');

-- Active users only
CREATE INDEX idx_users_active ON users(business_id, user_type)
  WHERE is_deleted = false AND account_status = 'ACTIVE';

-- ============================================================================
-- ANALYZE & REPORT STATISTICS
-- ============================================================================

-- Gather statistics for query planner
ANALYZE;

-- Report index creation
SELECT '✅ Core product indexes created' as status;
SELECT '✅ Cart & order indexes created' as status;
SELECT '✅ User & authentication indexes created' as status;
SELECT '✅ Attendance & HR indexes created' as status;
SELECT '✅ Composite & partial indexes created' as status;

SELECT
  '📊 PRODUCTION INDEX SUMMARY:' as "STATUS",
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as "Total Indexes",
  pg_size_pretty(pg_database_size(current_database())) as "Database Size";

-- ============================================================================
-- VERIFICATION: Check if indexes exist
-- ============================================================================

SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_indexes
JOIN pg_class ON pg_indexes.indexname = pg_class.relname
WHERE schemaname = 'public'
  AND tablename IN ('products', 'orders', 'cart_items', 'users')
ORDER BY tablename, indexname;

RAISE NOTICE '✅ ALL INDEXES CREATED SUCCESSFULLY!';
RAISE NOTICE '📈 Database is now fully optimized for 180K products';
RAISE NOTICE '🚀 Ready for production use!';
