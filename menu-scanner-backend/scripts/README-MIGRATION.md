# Test Data & Migration Guide

## Overview
This directory contains scripts for database setup and test data generation.

### Database Scripts
- **comprehensive-test-data.sql** - Generates complete test data with orders, items, promotions, and status history

## Comprehensive Test Data

### What's Included
The `comprehensive-test-data.sql` script creates:
- **20 Test Orders** with complete data:
  - 10 CUSTOMER (public) orders
  - 10 BUSINESS (POS) orders
- **Full Customer Information**: Names, phone numbers, email addresses, delivery addresses
- **Order Items**: 5-15 items per order with:
  - Promotion details (15% and 10% discounts on sample items)
  - Add-ons/customizations (10% of items have add-ons)
  - Complete pricing information
- **Delivery Information**: 
  - Addresses with district, province, GPS coordinates
  - Delivery options (Standard Delivery for CUSTOMER, Pickup for POS)
- **Status History**: 7-10 status change entries per order
- **Order Statuses**: Mix of PENDING, CONFIRMED, COMPLETED, and CANCELLED

### Sample Data Features
- **Promotions**: 
  - PERCENTAGE discounts (15%, 10%)
  - Valid date ranges
  - Promotion details captured at order time
- **Customizations**:
  - Sample add-ons ($10 value)
  - JSON format storage
- **Mixed Payment Methods**: CREDIT_CARD, CASH, MOBILE_MONEY
- **Mixed Order Sources**: PUBLIC (customer) and POS (business)

## Execution Instructions

### Option 1: Using psql CLI
```bash
# Connect and run the script
psql -U <username> -d <database_name> -f scripts/comprehensive-test-data.sql

# Or from psql interactive mode
\i scripts/comprehensive-test-data.sql
```

### Option 2: Using pgAdmin
1. Open pgAdmin
2. Select your database
3. Go to Tools → Query Tool
4. Open the script file
5. Click Execute

### Option 3: Direct SQL Execution
```sql
-- Copy and paste the contents of comprehensive-test-data.sql into your SQL client
```

## Verification Queries

After running the script, verify the data was inserted:

```sql
-- Check order counts by type
SELECT order_from, COUNT(*) as count 
FROM orders 
GROUP BY order_from;

-- Check items with promotions
SELECT COUNT(*) as total, 
       COUNT(CASE WHEN has_promotion THEN 1 END) as with_promotion
FROM order_items;

-- Check delivery addresses
SELECT COUNT(*) as orders_with_delivery
FROM order_delivery_addresses;

-- Check status history
SELECT order_id, COUNT(*) as status_changes
FROM order_status_history
GROUP BY order_id
ORDER BY status_changes DESC;
```

## Notes
- The script is wrapped in a transaction for safety
- You can optionally enable the DELETE section to clear existing test data
- All new records are marked with `created_by = 'admin'`
- Timestamps are automatically set to recent dates (past 30 days)
- The script includes verification queries at the end

## Order Status Values
The system uses 4 core order statuses:
- **PENDING** - Order received but not yet confirmed
- **CONFIRMED** - Order confirmed and being prepared
- **COMPLETED** - Order delivered/fulfilled
- **CANCELLED** - Order cancelled or failed
