# Test Data Scripts

## master-test-data.sql

Comprehensive test data SQL script for the Khmer E-Menu platform with PostgreSQL database.

### Features

- **200 Orders Total**: 100 WEB orders + 100 POS orders
- **Complete Data Volume**:
  - 3 main users (Platform Admin, Business Manager, Customer)
  - 500 staff members
  - 20 product categories
  - 20 brands
  - 100 products
  - 5 delivery options
  - 600 order items (3 items per order)
  - Complete audit trails for all records

### Schema Compatibility

This script is designed for the normalized snapshot schema introduced in V7 migrations:

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

### Verification

After loading test data, verify with these queries:

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
