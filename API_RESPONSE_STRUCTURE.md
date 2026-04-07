# Updated API Response Structure

## Overview
The backend API has been updated with standardized pricing field names. All endpoints return `OrderResponse` which includes `OrderPricingInfo` with the new field structure.

## Endpoints Affected
- `POST /api/v1/orders/checkout` - Public checkout
- `POST /api/v1/orders/checkout-from-pos` - POS checkout
- `GET /api/v1/orders/{id}` - Get order details
- `POST /api/v1/orders/all` - List orders
- `POST /api/v1/orders/my-business/all` - Business orders

## New Response Structure

### Order Pricing - Before Snapshot (Item-Level Discounts)
```json
{
  "pricing": {
    "before": {
      "totalItems": 5,
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

### Order Pricing - After Snapshot (Order-Level Discount Applied)
```json
{
  "pricing": {
    "hadOrderLevelChangeFromPOS": true,
    "after": {
      "totalItems": 5,
      "subtotalBeforeDiscount": 242,
      "subtotal": 214.1,
      "discountAmount": 27.9,
      "hasActivePromotion": true,
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 3,
      "deliveryFee": 2,
      "taxAmount": 5,
      "finalTotal": 221.1
    },
    "reason": "Loyalty promotion ($3 off)"
  }
}
```

### Order Item - Before Snapshot
```json
{
  "items": [
    {
      "id": "uuid",
      "product": {
        "name": "Coffee",
        "sku": "SKU123",
        "barcode": "BC123"
      },
      "before": {
        "currentPrice": 46,
        "finalPrice": 41.4,
        "quantity": 2,
        "discountAmount": 4.6,
        "totalPrice": 82.8,
        "hasActivePromotion": true,
        "promotionType": "FIXED_AMOUNT",
        "promotionValue": 5
      },
      "hadChangeFromPOS": true
    }
  ]
}
```

### Order Item - After Snapshot
```json
{
  "items": [
    {
      "after": {
        "currentPrice": 50.6,
        "finalPrice": 45.54,
        "quantity": 2,
        "discountAmount": 5.06,
        "totalPrice": 101.2,
        "hasActivePromotion": true,
        "promotionType": "FIXED_AMOUNT",
        "promotionValue": 5
      }
    }
  ]
}
```

## Field Name Mapping

| Old Field Name | New Field Name | Location | Type | Example |
|---|---|---|---|---|
| `totalDiscount` | `discountAmount` | Pricing & Item snapshots | BigDecimal | 24.9, 5.06 |
| `discountType` | (removed) | OrderPricingInfo | - | - |
| N/A | `hasActivePromotion` | Pricing & Item snapshots | Boolean | true, false |
| N/A | `promotionType` | Pricing & Item snapshots | String | "PERCENTAGE", "FIXED_AMOUNT" |
| N/A | `promotionValue` | Pricing & Item snapshots | BigDecimal | 10, 5, 3 |

## Changes Summary

### Order Pricing Snapshot (`OrderPricingSnapshot`)
**Added:**
- `hasActivePromotion: Boolean` - Indicates if promotion/discount is active
- `promotionType: String` - "PERCENTAGE" or "FIXED_AMOUNT"
- `promotionValue: BigDecimal` - Actual value of the promotion

**Renamed:**
- `totalDiscount` → `discountAmount`

**Removed:**
- (none - discountType was in OrderPricingInfo, not snapshot)

### Order Pricing Info (`OrderPricingInfo`)
**Removed:**
- `discountType` - Now in snapshot objects only

**Kept:**
- `before: OrderPricingSnapshot` - Before order-level changes
- `hadOrderLevelChangeFromPOS: Boolean` - Was there a POS change?
- `after: OrderPricingSnapshot` - After order-level changes (if hadOrderLevelChangeFromPOS=true)
- `reason: String` - Why the change occurred

## Frontend Update Pattern

When updating frontend components, replace patterns like:
```typescript
// OLD
pricing.before.totalDiscount → pricing.before.discountAmount
pricing.before.discountType → pricing.before.promotionType
pricing.after.totalDiscount → pricing.after.discountAmount
pricing.after.discountType → pricing.after.promotionType

// NEW - Also check hasActivePromotion
pricing.before.hasActivePromotion && pricing.before.discountAmount
pricing.after.hasActivePromotion && pricing.after.discountAmount
```

## Files to Update in Frontend

**Priority 1 (Checkout-related):**
- [ ] `checkout/page.tsx`
- [ ] `cart/page.tsx`
- [ ] `src/redux/features/main/store/models/response/order-response.ts`

**Priority 2 (POS-related):**
- [ ] `pos/page.tsx`
- [ ] `orders/create/page.tsx`
- [ ] Type definitions for pricing

**Priority 3 (Display-related):**
- [ ] `orders/[id]/page.tsx`
- [ ] `order-admin-table.tsx`
- [ ] All pricing-related components

## Test Data
Run the new V6 migration to generate fresh test data:
```bash
mvn clean flyway:clean flyway:migrate
```

This will generate 200 orders (100 customer + 100 POS) with all items having active promotions and proper discount structures.
