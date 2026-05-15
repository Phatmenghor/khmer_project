# Quick Start: Stock Debugging

## Problem Summary
POS orders were not auto-decrementing stock quantities. When ordering 2 units, stock still showed 100 instead of 98.

## Root Causes Fixed

### 1. Stock Not Deducted for POS Orders
- **Problem**: POS orders have status COMPLETED, not CONFIRMED
- **Where it was called**: `updateOrderConfirmation()` method (only called for online orders)
- **Fix**: Added `deductStockForOrder()` call in `createPOSCheckoutOrder()` at line 966

### 2. API Returning Wrong Quantities
- **Problem**: `findWithFilters()` returned ALL batches, including those with quantity=0 (already deducted)
- **Example**: Deducted from batch A (100→0), but API returned batch B (100)
- **Fix**: Added filters in ProductStockRepository.findWithFilters():
  - `AND ps.quantity_on_hand > 0` - Exclude empty batches
  - `AND ps.is_expired = false` - Exclude expired batches

## What Changed

### Code Changes
- `OrderServiceImpl.java` - Enhanced logging in deductStockForOrder()
- `StockServiceImpl.java` - Enhanced logging in deductStockFIFO() and createStockMovement()
- `application-local.yaml` - Enabled DEBUG logging for tracking

### Database Changes
None - existing schema is correct

### API Changes
None - existing endpoints now return correct data

## How Stock Deduction Works Now

```
POS Order Created
    ↓
Order saved with COMPLETED status
    ↓
Payment created
    ↓
deductStockForOrder() called [NEW]
    ↓
For each order item:
    ↓
stockService.deductStockFIFO()
    ↓
Find active batches (oldest first)
    ↓
Deduct Math.min(quantity_needed, batch_quantity)
    ↓
Update batch.quantityOnHand in database
    ↓
Create stock movement audit record
    ↓
Set dateOut timestamp on batch
    ↓
Repeat for next batch if more units needed
```

## Immediate Actions

### 1. Rebuild
```bash
cd menu-scanner-backend
mvn clean install -DskipTests
```

### 2. Restart
```bash
java -jar target/menu-scanner-backend.jar
```

### 3. Test
1. Create POS order for 2 units
2. Check console logs for `[FIFO SUCCESS]` message
3. Verify in API response: stock now shows 98 (not 100)

## Expected Log Output (Abbreviated)

```
[POS CHECKOUT START] Creating POS order
[STEP 6/6] Deducting stock for POS order...
[STOCK DEDUCTION START] Processing 1 items
[FIFO DEDUCTION START] Product: ..., Quantity to deduct: 2
[FIFO BATCH 1] ID: ..., On-hand: 100
[FIFO DEDUCT] Deducting 2 (was 100 now 98)
[FIFO SAVED] Batch ... updated in database
[MOVEMENT SAVED] Movement ID: ... saved
[FIFO SUCCESS] All 2 units deducted successfully
[POS CHECKOUT SUCCESS] Order created successfully
```

## Verification Steps

### Check 1: Logs Show Deduction
Run order, watch console for `[FIFO SUCCESS]`

### Check 2: Database Has New Quantity
```sql
SELECT quantity_on_hand FROM product_stock WHERE id = 'BATCH_ID';
-- Should show: 98 (not 100)
```

### Check 3: Audit Trail Exists
```sql
SELECT * FROM stock_movement 
WHERE product_stock_id = 'BATCH_ID' 
ORDER BY created_at DESC LIMIT 1;
-- Should show: STOCK_OUT, quantity_change: -2
```

### Check 4: API Returns Correct Quantity
```bash
curl http://localhost:8080/api/product-stocks?businessId=YOUR_ID
# Response should show quantity: 98 (not 100)
```

## Files to Review

1. **STOCK_DEDUCTION_LOGGING_GUIDE.md** (259 lines)
   - Complete documentation
   - Sample logs
   - Troubleshooting guide

2. **OrderServiceImpl.java** (line 998-1032)
   - Enhanced deductStockForOrder() method
   - Shows item processing with detailed logging

3. **StockServiceImpl.java** (lines 87-119)
   - Enhanced deductStockFIFO() method
   - Shows batch selection, deduction, and audit trail

4. **ProductStockRepository.java** (lines 165-166)
   - Critical filters for API response accuracy

5. **application-local.yaml** (lines 29-38)
   - DEBUG logging configuration

## Key Concepts

### FIFO (First In First Out)
- Oldest batches used first
- Prevents expired stock
- Uses `dateIn` column to order batches

### Stock Quantities
- `quantityOnHand` - Actual units in warehouse
- `quantityReserved` - Units reserved for pending orders
- `quantityAvailable` - Calculated: onHand - reserved
- Updated by database triggers and @PreUpdate hook

### Stock Movement
- Audit trail of all stock changes
- Records: type, quantity_change, before/after, cost impact
- Used for compliance and debugging

## If It Still Doesn't Work

### Debug Checklist
1. ✓ Rebuilt with `mvn clean install`?
2. ✓ Restarted application?
3. ✓ application-local.yaml has `active: local` (not prod)?
4. ✓ Logging level set to DEBUG?
5. ✓ Looking at correct product in API response?
6. ✓ Database changed (SELECT quantity_on_hand from product_stock)?

### Common Issues
- **Issue**: Logs not showing
  - Solution: Check application-local.yaml, restart
- **Issue**: Stock still 100
  - Solution: Check database directly with SQL
- **Issue**: See `[FIFO INSUFFICIENT]` message
  - Solution: Not enough stock in any active batch

## Commits
- `e657d8d` - Add comprehensive logging for stock deduction
- `8d7257b` - Add stock deduction logging guide
