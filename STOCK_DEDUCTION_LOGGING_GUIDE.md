# Stock Deduction Logging Guide

## Overview

This guide documents the comprehensive logging enhancements made to track stock deduction during POS order processing. These logs will help you verify that:

1. Stock is being properly deducted from inventory
2. FIFO (First In First Out) batch selection is working correctly
3. Stock movements are being recorded in the audit trail
4. Stock quantities in the API response are accurate (showing only active batches)

## Recent Changes Made

### 1. OrderServiceImpl.java - Enhanced deductStockForOrder() Method

**Purpose**: Log the complete stock deduction process for each order item.

**Logging Points**:
- `[STOCK DEDUCTION START]` - Logs how many items need stock deduction
- `[STOCK DEDUCTION ITEM]` - Logs each item's product ID, size, and quantity
- `[STOCK DEDUCTION SUCCESS]` - Confirms successful deduction for each item
- `[STOCK DEDUCTION ERROR]` - Captures any errors during deduction
- `[STOCK DEDUCTION COMPLETE]` - Marks completion of all items

**Key Change**: This method is called immediately after payment creation (line 966) for POS orders, ensuring stock is deducted even though POS orders have COMPLETED status (they skip the CONFIRMED state).

### 2. StockServiceImpl.java - Enhanced deductStockFIFO() Method

**Purpose**: Track the FIFO batch selection and deduction process in detail.

**Logging Points**:
- `[FIFO DEDUCTION START]` - Logs product ID, size, quantity needed, and order ID
- `[FIFO BATCHES]` - Shows how many active batches are available
- `[FIFO BATCH n]` - Logs details of each batch being processed (ID, quantity on hand, date in, price)
- `[FIFO DEDUCT]` - Shows deduction amount and before/after quantity for each batch
- `[FIFO SAVED]` - Confirms batch updated in database
- `[FIFO MOVEMENT]` - Logs audit trail record creation
- `[FIFO DEDUCTED]` - Confirms units deducted and remaining
- `[FIFO INSUFFICIENT]` - Warns if not enough stock available
- `[FIFO SUCCESS]` - Confirms all units deducted successfully

### 3. StockServiceImpl.java - Enhanced createStockMovement() Method

**Purpose**: Track stock movement audit trail creation.

**Logging Points**:
- `[MOVEMENT CREATE]` - Logs movement type, product stock ID, quantity changes
- `[MOVEMENT COST]` - Logs unit price, quantity, and cost impact calculation
- `[MOVEMENT SAVED]` - Confirms movement record saved with ID

### 4. ProductStockRepository.java - Critical Filters

**Purpose**: Ensure API only returns active stock batches (not deducted ones).

**Filters Added**:
- `AND ps.quantity_on_hand > 0` - Excludes batches with zero quantity (already deducted)
- `AND ps.is_expired = false` - Excludes expired batches

**Location**: Lines 165-166 in findWithFilters() query

These filters ensure that when you check stock availability via API, you only see batches that actually have inventory.

### 5. application-local.yaml - Logging Configuration

**Changes**:
```yaml
logging:
  level:
    root: INFO
    com.emenu: DEBUG
    com.emenu.features.order.service.impl.OrderServiceImpl: DEBUG
    com.emenu.features.stock.service.impl.StockServiceImpl: DEBUG
    com.emenu.features.stock.service.impl.ProductStockServiceImpl: DEBUG
    org.springframework: WARN
    org.hibernate: WARN
    org.hibernate.SQL: WARN
    org.hibernate.type: WARN
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

**Key Points**:
- Set `com.emenu` to DEBUG level to see all detailed logs
- Stock and order services explicitly set to DEBUG
- Console pattern includes timestamp, thread, log level, logger name, and message

## Sample Log Output

When you create a POS order for 2 units of a product with 100 units in stock, you should see:

```
2026-05-15 14:23:45.123 [http-nio-8080-exec-1] INFO  OrderServiceImpl - [POS CHECKOUT START] Creating POS order - Business: d14f442-1234-5678, Items: 1
2026-05-15 14:23:45.145 [http-nio-8080-exec-1] DEBUG OrderServiceImpl - [STEP 1/6] Creating base order...
2026-05-15 14:23:45.156 [http-nio-8080-exec-1] DEBUG OrderServiceImpl - [STEP 2/6] Saving order...
2026-05-15 14:23:45.234 [http-nio-8080-exec-1] INFO  OrderServiceImpl - [ORDER CREATED] Order #POS-001 saved with ID: d14f442-5678-1234
2026-05-15 14:23:45.245 [http-nio-8080-exec-1] DEBUG OrderServiceImpl - [STEP 3/6] Creating initial status history...
2026-05-15 14:23:45.260 [http-nio-8080-exec-1] INFO  OrderServiceImpl - [STEP 4/6] Processing 1 items with customizations
2026-05-15 14:23:45.280 [http-nio-8080-exec-1] DEBUG OrderServiceImpl - [CART SUMMARY] Processing 1 items with customizations for order: d14f442-5678-1234
2026-05-15 14:23:45.300 [http-nio-8080-exec-1] DEBUG OrderServiceImpl - [STEP 5/6] Creating payment record...
2026-05-15 14:23:45.350 [http-nio-8080-exec-1] DEBUG OrderServiceImpl - [STEP 6/6] Deducting stock for POS order...
2026-05-15 14:23:45.360 [http-nio-8080-exec-1] INFO  OrderServiceImpl - [STOCK DEDUCTION START] Processing 1 items for order POS-001
2026-05-15 14:23:45.365 [http-nio-8080-exec-1] DEBUG OrderServiceImpl - [STOCK DEDUCTION ITEM] Product ID: e657d8d-1234-5678, Size ID: null, Quantity: 2
2026-05-15 14:23:45.370 [http-nio-8080-exec-1] INFO  StockServiceImpl - [FIFO DEDUCTION START] Product: e657d8d-1234-5678, Size: null, Quantity to deduct: 2, Order: d14f442-5678-1234
2026-05-15 14:23:45.375 [http-nio-8080-exec-1] DEBUG StockServiceImpl - [FIFO BATCHES] Found 2 active batches for product e657d8d-1234-5678
2026-05-15 14:23:45.380 [http-nio-8080-exec-1] DEBUG StockServiceImpl - [FIFO BATCH 1] ID: 444c9b93-1234-5678, On-hand: 100, DateIn: 2026-05-01T10:00:00, Price: 5.0000
2026-05-15 14:23:45.385 [http-nio-8080-exec-1] DEBUG StockServiceImpl - [FIFO DEDUCT] Deducting 2 from batch 444c9b93-1234-5678 (was 100 now 98)
2026-05-15 14:23:45.390 [http-nio-8080-exec-1] DEBUG StockServiceImpl - [FIFO SAVED] Batch 444c9b93-1234-5678 updated in database, remaining to deduct: 0
2026-05-15 14:23:45.400 [http-nio-8080-exec-1] DEBUG StockServiceImpl - [MOVEMENT CREATE] Type: STOCK_OUT, ProductStock: 444c9b93-1234-5678, Change: -2, Previous: 100, New: 98
2026-05-15 14:23:45.405 [http-nio-8080-exec-1] DEBUG StockServiceImpl - [MOVEMENT COST] Unit Price: 5.0000, Quantity: -2, Cost Impact: -10.0000
2026-05-15 14:23:45.410 [http-nio-8080-exec-1] DEBUG StockServiceImpl - [MOVEMENT SAVED] Movement ID: a1b2c3d4-1234-5678 saved to database
2026-05-15 14:23:45.415 [http-nio-8080-exec-1] INFO  StockServiceImpl - [FIFO DEDUCTED] 2 units from batch 444c9b93-1234-5678, 0 units remaining to deduct
2026-05-15 14:23:45.420 [http-nio-8080-exec-1] INFO  StockServiceImpl - [FIFO SUCCESS] All 2 units deducted successfully for order d14f442-5678-1234
2026-05-15 14:23:45.425 [http-nio-8080-exec-1] DEBUG OrderServiceImpl - [STOCK DEDUCTION SUCCESS] Successfully deducted 2 units of product e657d8d-1234-5678
2026-05-15 14:23:45.430 [http-nio-8080-exec-1] INFO  OrderServiceImpl - [STOCK DEDUCTION COMPLETE] All items processed for order: POS-001
2026-05-15 14:23:45.440 [http-nio-8080-exec-1] INFO  OrderServiceImpl - [POS CHECKOUT SUCCESS] Order #POS-001 created successfully
```

## What These Logs Tell You

### Verification Checklist

1. **Stock Deduction Occurred**
   - Look for: `[FIFO SUCCESS] All X units deducted successfully`
   - This confirms the quantity change from 100 → 98

2. **Correct Batch Selected**
   - Look for: `[FIFO BATCH 1]` with DateIn timestamp
   - FIFO ensures oldest batches are used first
   - Multiple batches? Check that oldest (earliest DateIn) is used first

3. **Database Updated**
   - Look for: `[FIFO SAVED] Batch ... updated in database`
   - Confirms quantityOnHand changed in the database

4. **Audit Trail Created**
   - Look for: `[MOVEMENT SAVED] Movement ID: ... saved to database`
   - Tracks all stock changes for compliance/auditing

5. **API Response Accuracy**
   - When checking stock via API after order:
     - Should show 98 (not 100)
     - Only shows batches with quantity_on_hand > 0
     - Only shows batches with is_expired = false

## Next Steps

### 1. Rebuild the Application

```bash
cd /home/user/khmer_project/menu-scanner-backend
mvn clean install -DskipTests
```

This will:
- Compile all Java code with new logging statements
- Include updated application-local.yaml configuration
- Package everything into executable JAR

### 2. Restart the Backend Application

```bash
java -jar target/menu-scanner-backend.jar
```

Or if using an IDE, restart the Spring Boot application.

### 3. Test the POS Order Flow

1. Open POS interface
2. Create an order with 2 units of a product
3. Check the backend console/logs for the complete sequence above
4. Verify in database:
   - Stock batch quantity changed (100 → 98)
   - Stock movement record created
5. Check API response for updated quantity

### 4. Monitor the Logs

Watch the console output or check the log file at:
```
logs/application.log
```

Look for the pattern markers:
- `[POS CHECKOUT START]` - Order creation begins
- `[FIFO DEDUCTION START]` - Stock deduction begins
- `[FIFO SUCCESS]` - Stock properly deducted
- `[POS CHECKOUT SUCCESS]` - Order completed

## Troubleshooting

### Problem: Still showing 100 units after order

**Check 1**: Application rebuilt and restarted?
- Sometimes IDE caches old bytecode
- Stop application, run `mvn clean install -DskipTests`, restart

**Check 2**: Look for `[FIFO INSUFFICIENT]` logs
- Means not enough stock available
- Check if batches have zero quantity (already deducted)

**Check 3**: Check database directly
```sql
SELECT id, quantity_on_hand, date_in FROM product_stock 
WHERE product_id = 'YOUR_PRODUCT_ID' 
ORDER BY date_in ASC;
```
- Should show decremented quantities

**Check 4**: Verify findWithFilters filters
- API might still be returning deducted batch
- Check that ProductStockRepository has the filters on lines 165-166

### Problem: Logs not showing up

**Check 1**: Ensure application-local.yaml is active
```yaml
spring:
  profiles:
    active: local  # NOT prod
```

**Check 2**: Check log level is DEBUG
```yaml
logging:
  level:
    com.emenu: DEBUG
```

**Check 3**: Verify logger initialization
- StockServiceImpl has `@Slf4j` annotation
- OrderServiceImpl has `@Slf4j` annotation

## Key Files Modified

1. **OrderServiceImpl.java** (line 998-1032)
   - Enhanced deductStockForOrder() method

2. **StockServiceImpl.java** (lines 87-119, 210-240)
   - Enhanced deductStockFIFO() method
   - Enhanced createStockMovement() method

3. **ProductStockRepository.java** (lines 165-166)
   - Filters to exclude empty batches

4. **application-local.yaml** (lines 29-38)
   - DEBUG logging configuration

## Summary

The stock deduction system now has comprehensive logging at each step:
1. Order creation initiates stock deduction
2. FIFO algorithm selects oldest batches
3. Batch quantities update in database
4. Audit trail records all changes
5. API response filters to show only active batches

This three-pronged approach (stock deduction + audit logging + API filtering) ensures accurate inventory management and complete visibility into what's happening during the order process.
