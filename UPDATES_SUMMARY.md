# API & Frontend Update Summary
## Pricing Schema Standardization with Before/After Audit Trail

### Date: 2026-04-07
### Branch: `claude/update-contacts-settings-ui-fptzU`

---

## Overview

Comprehensive update to order management system with standardized pricing field names and complete before/after snapshots for audit trail tracking.

### Key Changes
- ✅ **Backend API**: Updated all response DTOs with new field names
- ✅ **Database Migration**: Added discount_type column and regenerated test data
- ✅ **Frontend Types**: Updated all TypeScript type definitions
- ✅ **Order Detail Display**: Fixed UI to show before/after snapshots
- 🔄 **In Progress**: POS page updates, cart page updates

---

## Backend Changes

### 1. Database Schema (V5 Migration)
**File**: `menu-scanner-backend/src/main/resources/db/migration/V5__Add_Discount_Type_To_Orders.sql`
- Added `discount_type` column to `orders` table
- Maps to: `PERCENTAGE` or `FIXED_AMOUNT`
- Created index for query optimization

### 2. Response DTOs - Pricing Fields
All pricing snapshots now use these standardized fields:

#### OrderPricingSnapshot.java
```java
private Integer totalItems;
private BigDecimal subtotalBeforeDiscount;
private BigDecimal subtotal;
private BigDecimal discountAmount;        // Renamed from totalDiscount
private Boolean hasActivePromotion;       // New
private String promotionType;             // New - PERCENTAGE or FIXED_AMOUNT
private BigDecimal promotionValue;        // New
private BigDecimal deliveryFee;
private BigDecimal taxAmount;
private BigDecimal finalTotal;
```

#### OrderItemPricingSnapshot.java
```java
private BigDecimal currentPrice;
private BigDecimal finalPrice;
private Integer quantity;
private BigDecimal discountAmount;        // Renamed from totalDiscount
private BigDecimal totalPrice;
private Boolean hasActivePromotion;       // New
private String promotionType;             // New
private BigDecimal promotionValue;        // New
```

### 3. Mapper Logic (OrderMapper.java)
- `mapPricingInfo()`: Calculates item-level discounts and creates before/after snapshots
- `calculateItemLevelDiscounts()`: Sums (currentPrice - finalPrice) × quantity
- `calculateSubtotalBeforeDiscount()`: Sums currentPrice × quantity
- Properly sets promotionType and promotionValue in both snapshots

### 4. Test Data Migration (V6)
**File**: `menu-scanner-backend/src/main/resources/db/migration/V6__Regenerate_Test_Data.sql`
- Generates 200 orders (100 customer + 100 POS)
- Creates 1000 order items (5 per order)
- All items have active promotions:
  - 15% PERCENTAGE discount (items 0 mod 3)
  - $5 FIXED_AMOUNT discount (items 1 mod 3)
  - 10% PERCENTAGE discount (items 2 mod 3)
- Creates proper item pricing snapshots
- Creates complete order status history

---

## Frontend Changes

### 1. Type Definition Updates

#### order-response.ts (Main API Response Types)
```typescript
export interface OrderPricingSnapshot {
  totalItems: number;
  subtotalBeforeDiscount: number;
  subtotal: number;
  discountAmount: number;        // Changed from totalDiscount
  hasActivePromotion: boolean;    // Added
  promotionType: string | null;   // Added
  promotionValue: number | null;  // Added
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
}
```

#### order-api-response.ts (Business API Response)
- Updated `OrderPricingSnapshotApi` with same new fields
- Updated `OrderItemPricingSnapshotApi` with same new fields
- Removed promotionFromDate/promotionToDate from response types

#### order.types.ts (Comprehensive Order Types)
- Updated `OrderPricingDetails` with new field names
- Added promotion fields to all pricing types

#### pos-page-type.ts (POS State Types)
- Updated `OrderPricingSnapshot` interface
- Updated `ItemPricingSnapshot` interface
- Removed promotion date fields

#### pos-checkout-request.ts (POS Checkout Request)
- Updated `CartSummary` to use `discountAmount`

### 2. Page Updates

#### orders/[id]/page.tsx (Order Detail Page)
```typescript
// BEFORE
order.pricing?.totalDiscount

// AFTER
order.pricing?.before?.discountAmount
order.pricing?.before?.subtotal
order.pricing?.before?.deliveryFee
order.pricing?.before?.finalTotal
```

### 3. Component Documentation

#### Documentation Files Created
- `API_RESPONSE_STRUCTURE.md`: Field name mapping and response structure
- `COMPLETE_API_RESPONSE_EXAMPLE.md`: Full JSON example with explanations
- `comprehensive-test-data.sql`: Standalone test data generation script

---

## API Response Structure Example

### Before Snapshot (Item-Level Discounts)
```json
{
  "pricing": {
    "before": {
      "totalItems": 6,
      "subtotalBeforeDiscount": 242,
      "subtotal": 217.1,
      "discountAmount": 24.9,
      "hasActivePromotion": true,
      "promotionType": "PERCENTAGE",
      "promotionValue": 10,
      "deliveryFee": 2,
      "taxAmount": 5,
      "finalTotal": 224.1
    }
  }
}
```

### After Snapshot (Order-Level Discount Applied)
```json
{
  "pricing": {
    "hadOrderLevelChangeFromPOS": true,
    "after": {
      "totalItems": 6,
      "subtotalBeforeDiscount": 242,
      "subtotal": 214.1,
      "discountAmount": 27.9,
      "hasActivePromotion": true,
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 3,
      "deliveryFee": 2,
      "taxAmount": 5,
      "finalTotal": 221.1
    }
  }
}
```

### Calculation Flow
```
BEFORE:
subtotalBeforeDiscount = 242
- item-level discounts = 24.9
= subtotal = 217.1
+ deliveryFee = 2
+ taxAmount = 5
= finalTotal = 224.1

AFTER (with order-level discount):
subtotalBeforeDiscount = 242
- item-level discounts = 24.9
- order-level discount = 3
= subtotal = 214.1
+ deliveryFee = 2
+ taxAmount = 5
= finalTotal = 221.1
```

---

## Field Name Changes

| Old Name | New Name | Location | Example |
|----------|----------|----------|---------|
| `totalDiscount` | `discountAmount` | Pricing snapshots | 24.9, 27.9 |
| (N/A) | `hasActivePromotion` | Pricing snapshots | true, false |
| (N/A) | `promotionType` | Pricing snapshots | "PERCENTAGE", "FIXED_AMOUNT" |
| (N/A) | `promotionValue` | Pricing snapshots | 10, 3, 5 |
| `discountType` | `promotionType` | Snapshot objects | "PERCENTAGE" |
| (Removed) | (Removed) | OrderPricingInfo | (promotionFromDate/ToDate) |

---

## Remaining Tasks

### Frontend Pages Still Needing Updates
- [ ] `app/admin/(business)/pos/page.tsx` - POS checkout page
- [ ] `app/admin/(business)/orders/create/page.tsx` - Order creation page
- [ ] Cart-related state and components
- [ ] Order admin table components
- [ ] Order status table components
- [ ] All pricing display components

### Testing
- [ ] Run database migration V5 and V6
- [ ] Generate fresh test data with `comprehensive-test-data.sql`
- [ ] Test checkout flow with new pricing structure
- [ ] Test POS order creation and modification
- [ ] Verify order detail page displays before/after snapshots correctly
- [ ] Verify item pricing shows discount information
- [ ] Test discount calculations across all scenarios

### Deployment Checklist
- [ ] Run all migrations in order
- [ ] Regenerate test data
- [ ] Build and test backend API
- [ ] Build and test frontend
- [ ] Verify all endpoints return new field names
- [ ] Test UI with real data from API

---

## Files Modified

### Backend
- `OrderPricingSnapshot.java` - DTO
- `OrderItemPricingSnapshot.java` - DTO
- `OrderPricingInfo.java` - DTO
- `OrderResponse.java` - DTO
- `OrderItemResponse.java` - DTO
- `OrderMapper.java` - Mapper with calculation logic
- `V5__Add_Discount_Type_To_Orders.sql` - Migration
- `V6__Regenerate_Test_Data.sql` - Test data

### Frontend
- `order-response.ts` - Type definitions
- `order-api-response.ts` - Business API types
- `order.types.ts` - Comprehensive order types
- `pos-page-type.ts` - POS state types
- `pos-checkout-request.ts` - POS request types
- `app/(public)/orders/[id]/page.tsx` - Order detail page

### Documentation
- `API_RESPONSE_STRUCTURE.md` - API reference
- `COMPLETE_API_RESPONSE_EXAMPLE.md` - Full example with explanations
- `comprehensive-test-data.sql` - Test data generation

---

## Testing Command

To regenerate test data with the new schema:

```bash
# Navigate to backend
cd menu-scanner-backend

# Run migrations
mvn clean flyway:clean flyway:migrate

# Or run the comprehensive test data directly
psql -U [user] -d [database] -f ../comprehensive-test-data.sql
```

---

## Notes

1. **Calculation Formula**: `finalTotal = subtotal + deliveryFee + taxAmount`
   - deliveryFee and taxAmount are constant across before/after
   - subtotal changes based on applied discounts
   - finalTotal is calculated, NOT a separate field

2. **Promotion Fields**: Always check `hasActivePromotion` before reading `promotionType` and `promotionValue`

3. **Audit Trail**: Use `hadOrderLevelChangeFromPOS` and `hadChangeFromPOS` to determine which snapshot to display
   - When true: Show both before and after with comparison
   - When false: Show only before snapshot

4. **Backward Compatibility**: Old field names (`totalDiscount`, `discountType`) removed entirely from response DTOs
   - Ensure all frontend code uses new names
   - This prevents confusion between different discount sources

---

## Status

**Last Updated**: 2026-04-07  
**Status**: Frontend type definitions and order detail page updated ✅  
**Next**: Update remaining frontend pages (POS, cart, order creation)
