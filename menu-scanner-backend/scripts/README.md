# Test Data Scripts

## Overview

This directory contains test data SQL scripts for the Khmer E-Menu platform. Choose the appropriate script based on your testing needs.

### Available Scripts

| Script | Tables | Records | Use Case |
|--------|--------|---------|----------|
| **comprehensive-test-data.sql** | ALL 47 tables | 2,500+ | Full system testing, all features |
| **master-test-data.sql** | 14 core tables | 1,900+ | Order management testing |

---

## comprehensive-test-data.sql

**NEW - RECOMMENDED FOR FULL SYSTEM TESTING**

Complete test data for all 47 database tables with end-to-end data coverage.

### Comprehensive Test Data Coverage

#### Location & Geography (5 tables)
- **5 Provinces**: Phnom Penh, Kandal, Pursat, Siem Reap, Kampong Chhnang
- **5 Districts**: Multi-district coverage per province
- **5 Communes**: Realistic commune hierarchy
- **5 Villages**: Village-level location data

#### Authentication & User Management (7 tables)
- **4 Roles**: ADMIN, MANAGER, STAFF, CUSTOMER with proper UserType enums
- **503 Users**:
  - 3 main users (Platform Admin, Business Manager, Customer)
  - 500 staff members distributed across 2 businesses
  - 5 customers for order testing
- **User Sessions**: 5 active/inactive sessions with device tracking
- **Refresh Tokens**: 5 tokens with expiration and revocation states
- **Blacklisted Tokens**: 3 revoked tokens for security testing

#### Products & Inventory (8 tables)
- **100 Products** with:
  - Pricing and promotion data
  - 20 Categories and 20 Brands
  - Product status (ACTIVE, INACTIVE, OUT_OF_STOCK)
  - 30 Product Sizes with individual pricing
  - 50 Product Images
  - Product Stock: 100 inventory records
  - Stock Movements: 90+ transactions (STOCK_IN, STOCK_OUT, ADJUSTMENT, DAMAGE)
- **Product Favorites**: Cross-user favorite relationships

#### Orders & Payments (13 tables)
- **200 Orders Total**:
  - 100 WEB orders (various statuses)
  - 100 POS orders (all COMPLETED)
- **600 Order Items**: 3 items per order with pricing
- **Order Snapshots**:
  - Delivery Addresses: Full location data with lat/long
  - Delivery Options: Pickup, Standard, Express, Same Day
  - Item Pricing Snapshots: Before/after pricing for promotions
- **Order Status History**: Complete status change tracking
- **Order Payments**: 200 payment records with references
- **General Payments**: 10 subscription/business payment records
- **Exchange Rates**: USD/KHR, CNY, THB, VND rates

#### HR & Attendance (7 tables)
- **30 Work Schedules**: Distributed across staff with times and breaks
- **30 Attendances**: Full 30-day attendance records
- **60 Check-Ins**: START/END check-in pairs with location tracking
- **20 Leave Requests**: Various status (PENDING, APPROVED, REJECTED)
- **5 Leave Types**: Annual, Sick, Maternity, Emergency, Unpaid
- **3 Work Schedule Types**: Full-time, Part-time, Shift-based

#### Business Configuration (3 tables)
- **2 Businesses** with:
  - Complete Business Settings (hours, timezone, currency, contact info)
  - Colors, policies, delivery radius
  - Contact methods (Whatsapp, Telegram, Social Media)

#### Subscriptions (2 tables)
- **3 Subscription Plans**: Basic, Pro, Enterprise with pricing
- **1 Active Subscription**: Configured for main business

#### Support Tables (5 tables)
- **50 Audit Logs**: API activity tracking
- **20 Images**: Base64-encoded test images
- **Reference Counters**: Order, Leave, Attendance, Check-in counters
- **Exchange Rates**: Business-specific currency conversion
- **Order Counter**: Daily order numbering

### Features

- **2,500+ Records Total**: Complete system data
- **All 47 Tables**: Zero missing table coverage
- **Complete Data Volume**:
  - 3 main users (Platform Admin, Business Manager, Customer)
  - 500 staff members
  - 20 product categories
  - 20 brands
  - 100 products
  - 5 delivery options
  - 600 order items (3 items per order)
  - Complete audit trails for all records

#### How to Use Comprehensive Test Data

```bash
# Method 1: Command line
export PGPASSWORD="Hour1819"
psql -h localhost -U postgres -d e_menu_platform -f comprehensive-test-data.sql

# Method 2: PgAdmin
# 1. Open PgAdmin and connect to e_menu_platform
# 2. Open Query Tool
# 3. Paste entire script content
# 4. Execute (F5)

# Method 3: After Spring Boot starts
# Migrations auto-apply, then run script directly
```

### Data Relationships

The comprehensive script maintains proper relationships:

```
Business (2 records)
├── Users (503 total)
│   ├── User Sessions (5)
│   ├── Refresh Tokens (5)
│   ├── Work Schedules (30)
│   ├── Attendances (30)
│   │   └── Check-Ins (60)
│   └── Leaves (20)
├── Business Settings (2)
├── Categories (20)
├── Brands (20)
├── Products (100)
│   ├── Product Sizes (30)
│   ├── Product Images (50)
│   └── Product Stock (100)
├── Delivery Options (5)
├── Payment Options (2)
├── Orders (200)
│   ├── Order Items (600)
│   │   └── Pricing Snapshots (600)
│   ├── Delivery Address (200)
│   ├── Delivery Option (200)
│   ├── Status History (200)
│   └── Order Payments (200)
└── Subscriptions (1)
    └── Subscription Plans (3)

Location Hierarchy (25 records)
├── Provinces (5)
├── Districts (5)
├── Communes (5)
└── Villages (5)

Cross-Cutting Tables:
├── Carts (10)
│   └── Cart Items (100)
├── Customer Addresses (20)
├── Product Favorites (60)
├── Stock Movements (90)
├── Payments (10)
├── Audit Logs (50)
├── Blacklisted Tokens (3)
├── Images (20)
└── Enums & Reference Data (8)
```

---

## master-test-data.sql

Focused test data for order management and core features.

### Features

- **200 Orders Total**: 100 WEB orders + 100 POS orders

- **Snapshot Tables**:
  - `order_delivery_addresses` - Immutable delivery address snapshots
  - `order_delivery_options` - Immutable delivery option snapshots
  - `order_item_pricing_snapshots` - Before/after pricing snapshots for promotional tracking

- **Entity Audit Trail Fields**:
  - `version` - Optimistic locking counter (defaults to 0)
  - `created_at` - Timestamp created
  - `updated_at` - Timestamp last updated
  - `created_by` - Creator identifier (defaults to 'system')
  - `updated_by` - Last updater identifier (nullable)
  - `is_deleted` - Soft delete flag (defaults to false)
  - `deleted_at` - Soft deletion timestamp (nullable)
  - `deleted_by` - User who deleted record (nullable)

### How to Use

#### Prerequisites

- PostgreSQL 12+ installed and running
- Database `e_menu_platform` created
- Database migrations V1-V7 applied (Flyway auto-migration on app startup)

#### Method 1: Using psql Command Line

```bash
# Set password in environment
export PGPASSWORD="Hour1819"

# Execute the script
psql -h localhost -U postgres -d e_menu_platform -f master-test-data.sql

# Or with different host/port
psql -h <host> -p <port> -U <username> -d e_menu_platform -f master-test-data.sql
```

#### Method 2: Using PgAdmin

1. Open PgAdmin
2. Navigate to database: `e_menu_platform`
3. Open Query Tool
4. Copy and paste entire script content
5. Execute (F5 or Execute button)

#### Method 3: Using Spring Boot Application

The script will be automatically executed if you:
1. Have `app.init.create-admin: true` in application.yaml
2. First ensure migrations are applied by starting the application
3. Then run the script directly against the database

### Data Structure

#### Orders

- **WEB Orders** (100): Created with various statuses (PENDING, CONFIRMED, PREPARING, COMPLETED, CANCELLED)
- **POS Orders** (100): All created with COMPLETED status
- **Timestamps**: Orders created up to 90 days ago for realistic testing
- **Pricing**: Realistic amounts with discount application patterns

#### Order Items

- **Total**: 600 items (3 per order)
- **Pricing**: Mix of regular and promotional pricing
- **Snapshots**: Before/after pricing captured at creation

#### Delivery Information

- **Addresses**: Unique delivery address for each order (random villages/communes in Phnom Penh area)
- **Options**: Mix of delivery types (Pickup, Standard, Express)
- **Coordinates**: Fixed coordinates for Phnom Penh city center (11.5564°N, 104.9282°E)

#### Users

- **Admin**: Platform-level admin account
- **Manager**: Business-level manager account
- **Staff**: 500 business staff members with varied profile images
- **Customer**: Sample customer for WEB orders
- **Passwords**: All accounts use 'hashed_password' for testing

### Image URLs

All image URLs use Unsplash premium photos:
- Primary: `https://plus.unsplash.com/premium_photo-1673002094195-f18084be89ce`
- Secondary: `https://plus.unsplash.com/premium_photo-1661964071015-d97428970584`

These URLs are real and will work for API responses.

### Database Integrity Features

- ✅ **Zero NULL Values**: All critical fields populated
- ✅ **Referential Integrity**: All foreign keys properly linked
- ✅ **Cascade Relationships**: Orders/items deleted when parents removed
- ✅ **Audit Trails**: Complete created_by, updated_by tracking
- ✅ **Soft Deletes**: `is_deleted` flag for business logic compliance
- ✅ **Optimistic Locking**: Version field prevents concurrent update conflicts

### Performance Notes

- **Total Records**: ~1,900 records across all tables
- **Execution Time**: Typically <2 seconds on modern PostgreSQL
- **Indexes**: All snapshot tables have indexes on foreign keys
- **Memory**: Minimal footprint, safe for development machines

### Troubleshooting

#### Connection Refused
```bash
# Verify PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL if needed
sudo service postgresql start
```

#### Database Does Not Exist
```bash
# Create database (as postgres user)
createdb -U postgres e_menu_platform
```

#### Foreign Key Constraint Errors
- Ensure all migrations are applied first
- Check that `businesses` table exists and has the business record
- Verify `roles` table is populated before users

#### Column Not Found Errors
- Ensure V6 and V7 migrations have been applied
- V7 migration removes old denormalized columns and creates snapshot tables
- Run migrations first: `./gradlew flyway:migrate`

### Comprehensive Data Verification Queries

After loading comprehensive test data, run these verification queries:

```sql
-- 1. Overall record counts by table
SELECT
  'roles' as table_name, COUNT(*) as count FROM roles UNION ALL
SELECT 'users', COUNT(*) FROM users UNION ALL
SELECT 'user_sessions', COUNT(*) FROM user_sessions UNION ALL
SELECT 'refresh_tokens', COUNT(*) FROM refresh_tokens UNION ALL
SELECT 'blacklisted_tokens', COUNT(*) FROM blacklisted_tokens UNION ALL
SELECT 'businesses', COUNT(*) FROM businesses UNION ALL
SELECT 'business_settings', COUNT(*) FROM business_settings UNION ALL
SELECT 'categories', COUNT(*) FROM categories UNION ALL
SELECT 'brands', COUNT(*) FROM brands UNION ALL
SELECT 'products', COUNT(*) FROM products UNION ALL
SELECT 'product_sizes', COUNT(*) FROM product_sizes UNION ALL
SELECT 'product_images', COUNT(*) FROM product_images UNION ALL
SELECT 'product_stock', COUNT(*) FROM product_stock UNION ALL
SELECT 'stock_movements', COUNT(*) FROM stock_movements UNION ALL
SELECT 'product_favorites', COUNT(*) FROM product_favorites UNION ALL
SELECT 'carts', COUNT(*) FROM carts UNION ALL
SELECT 'cart_items', COUNT(*) FROM cart_items UNION ALL
SELECT 'orders', COUNT(*) FROM orders UNION ALL
SELECT 'order_items', COUNT(*) FROM order_items UNION ALL
SELECT 'order_item_pricing_snapshots', COUNT(*) FROM order_item_pricing_snapshots UNION ALL
SELECT 'order_delivery_addresses', COUNT(*) FROM order_delivery_addresses UNION ALL
SELECT 'order_delivery_options', COUNT(*) FROM order_delivery_options UNION ALL
SELECT 'order_status_history', COUNT(*) FROM order_status_history UNION ALL
SELECT 'order_payments', COUNT(*) FROM order_payments UNION ALL
SELECT 'delivery_options', COUNT(*) FROM delivery_options UNION ALL
SELECT 'payment_options', COUNT(*) FROM payment_options UNION ALL
SELECT 'customer_addresses', COUNT(*) FROM customer_addresses UNION ALL
SELECT 'work_schedules', COUNT(*) FROM work_schedules UNION ALL
SELECT 'attendances', COUNT(*) FROM attendances UNION ALL
SELECT 'attendance_check_ins', COUNT(*) FROM attendance_check_ins UNION ALL
SELECT 'leaves', COUNT(*) FROM leaves UNION ALL
SELECT 'leave_type_enum', COUNT(*) FROM leave_type_enum UNION ALL
SELECT 'work_schedule_type_enum', COUNT(*) FROM work_schedule_type_enum UNION ALL
SELECT 'location_province_cbc', COUNT(*) FROM location_province_cbc UNION ALL
SELECT 'location_district_cbc', COUNT(*) FROM location_district_cbc UNION ALL
SELECT 'location_commune_cbc', COUNT(*) FROM location_commune_cbc UNION ALL
SELECT 'location_village_cbc', COUNT(*) FROM location_village_cbc UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans UNION ALL
SELECT 'payments', COUNT(*) FROM payments UNION ALL
SELECT 'exchange_rates', COUNT(*) FROM exchange_rates UNION ALL
SELECT 'business_exchange_rates', COUNT(*) FROM business_exchange_rates UNION ALL
SELECT 'audit_logs', COUNT(*) FROM audit_logs UNION ALL
SELECT 'images', COUNT(*) FROM images
ORDER BY count DESC;

-- 2. Verify relationship integrity
SELECT 'All orders have delivery addresses' as check_name
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE NOT EXISTS (SELECT 1 FROM order_delivery_addresses WHERE order_id = o.id));

SELECT 'All order items have pricing snapshots' as check_name
WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE NOT EXISTS (SELECT 1 FROM order_item_pricing_snapshots WHERE order_item_id = oi.id));

SELECT 'All carts have users' as check_name
WHERE NOT EXISTS (SELECT 1 FROM carts WHERE user_id IS NULL);

SELECT 'All orders have status history' as check_name
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE NOT EXISTS (SELECT 1 FROM order_status_history WHERE order_id = o.id));

-- 3. Check user types and account statuses
SELECT user_type, COUNT(*) as count FROM users GROUP BY user_type;
SELECT account_status, COUNT(*) as count FROM users GROUP BY account_status;

-- 4. Check order statuses and sources
SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status;
SELECT source, COUNT(*) as count FROM orders GROUP BY source;

-- 5. Check product statuses
SELECT status, COUNT(*) as count FROM products GROUP BY status;
SELECT status, COUNT(*) as count FROM categories GROUP BY status;

-- 6. Check attendance records
SELECT status, COUNT(*) as count FROM attendances GROUP BY status;
SELECT COUNT(DISTINCT attendance_date) as unique_attendance_dates FROM attendances;

-- 7. Check leave statuses
SELECT status, COUNT(*) as count FROM leaves GROUP BY status;

-- 8. Verify no critical NULLs
SELECT COUNT(*) as users_without_identifier FROM users WHERE user_identifier IS NULL;
SELECT COUNT(*) as orders_without_status FROM orders WHERE order_status IS NULL;
SELECT COUNT(*) as items_without_price FROM order_items WHERE unit_price IS NULL;

-- 9. Check subscription relationships
SELECT s.id, sp.name FROM subscriptions s JOIN subscription_plans sp ON s.plan_id = sp.id;

-- 10. Verify location hierarchy
SELECT COUNT(DISTINCT province_code) as provinces FROM location_province_cbc;
SELECT COUNT(DISTINCT district_code) as districts FROM location_district_cbc;
SELECT COUNT(DISTINCT commune_code) as communes FROM location_commune_cbc;
SELECT COUNT(DISTINCT village_code) as villages FROM location_village_cbc;
```

### Verification (Master Test Data)

After loading master test data, verify with these queries:

```sql
-- Count records
SELECT 'roles' as table_name, COUNT(*) FROM roles
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'order_delivery_addresses', COUNT(*) FROM order_delivery_addresses
UNION ALL SELECT 'order_item_pricing_snapshots', COUNT(*) FROM order_item_pricing_snapshots;

-- Verify order relationships
SELECT COUNT(*) FROM orders o
WHERE NOT EXISTS (SELECT 1 FROM order_delivery_addresses WHERE order_id = o.id)
  AND o.source = 'WEB';  -- Should return 0 (all orders have delivery addresses)

-- Check POS orders with complete data
SELECT COUNT(DISTINCT order_id) FROM order_items WHERE quantity > 0;
```

### Next Steps

1. Load test data using one of the methods above
2. Start the Spring Boot application (migrations will run automatically)
3. Test API endpoints:
   - `POST /api/v1/orders/all` - Retrieve orders with filtering
   - `GET /api/v1/orders/{id}` - Get order details with snapshots

### Scaling the Test Data

To increase data volume:

1. Modify `generate_series()` parameters (currently: 1,100 for orders)
2. Adjust product count (currently: 1,100 for products)
3. Update item generation CROSS JOIN if needed (currently: 3 items per order)

Example: Change line with `FROM generate_series(1, 100)` to `FROM generate_series(1, 1000)` for 10x data

### Related Files

- Migration: `V7__refactor_to_snapshot_tables.sql` - Creates snapshot tables
- Entities: `src/main/java/com/emenu/features/order/models/`
- Mapper: `src/main/java/com/emenu/features/order/mapper/OrderMapper.java`
- Controller: `src/main/java/com/emenu/features/order/controller/OrderController.java`
