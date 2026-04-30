# Order Status Migration Guide

## Overview
The OrderStatus enum has been simplified from 8 statuses to 4 core statuses:
- **PENDING** - Order received but not yet confirmed
- **CONFIRMED** - Order confirmed and being prepared
- **COMPLETED** - Order delivered/fulfilled
- **CANCELLED** - Order cancelled or failed

## Old → New Status Mapping
| Old Status | New Status | Reason |
|-----------|-----------|--------|
| PENDING_POS_CONFIRMATION | PENDING | Pending confirmation maps to pending |
| PREPARING | CONFIRMED | In-progress preparation = confirmed |
| READY | CONFIRMED | Ready for delivery = confirmed |
| IN_TRANSIT | CONFIRMED | In delivery = confirmed state |
| DELIVERING | CONFIRMED | Being delivered = confirmed state |
| FAILED | CANCELLED | Failed orders are cancelled |

## Execution Instructions

### Option 1: Automatic Migration (Recommended)
The Flyway migration script will automatically run when the application starts:
```
File: src/main/resources/db/migration/V999__migrate_order_statuses_to_simplified.sql
```
Simply restart the backend, and Flyway will execute the migration automatically.

### Option 2: Manual Execution
If you need to run the migration manually or separately:

1. **Connect to PostgreSQL:**
   ```bash
   psql -U <username> -d <database_name>
   ```

2. **Run the migration script:**
   ```bash
   \i scripts/migrate-order-statuses.sql
   ```

3. **Or using psql directly:**
   ```bash
   psql -U <username> -d <database_name> -f scripts/migrate-order-statuses.sql
   ```

## Verification
After migration, verify the results:
```sql
SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status ORDER BY count DESC;
```

Expected output should only show: PENDING, CONFIRMED, COMPLETED, CANCELLED

## Rollback (if needed)
The migration is in a transaction, so if you run it manually with `psql`, you can rollback by running `ROLLBACK;` if something goes wrong.

For Flyway migrations, rollback is not automatic. You would need to create a new migration script to revert the changes if absolutely necessary.

## Notes
- The migration is safe and idempotent
- It handles NULL values gracefully
- Any unknown statuses are set to PENDING as a safety net
- No data is lost, only status values are remapped
