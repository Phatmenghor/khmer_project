# POS Audit Trail Guide

## Overview

The POS system now tracks complete before/after snapshots for all changes made during checkout. This enables:
- ✅ Complete audit history of what changed and why
- ✅ Easy display of before/after comparisons in UI
- ✅ Tracking of item-level and order-level discounts
- ✅ Reason documentation for all changes

---

## Data Structures

### Item Pricing Snapshot

```typescript
interface ItemPricingSnapshot {
  currentPrice: number;           // Base price before promotion
  finalPrice: number;             // Price after promotion
  hasActivePromotion: boolean;    // Is promotion active?
  quantity: number;               // Item quantity
  totalBeforeDiscount: number;    // currentPrice × quantity
  discountAmount: number;         // (currentPrice - finalPrice) × quantity
  totalPrice: number;             // finalPrice × quantity
  promotionType: string | null;   // "PERCENTAGE" | "FIXED_AMOUNT"
  promotionValue: number | null;  // Discount % or amount
  promotionFromDate: string | null;
  promotionToDate: string | null;
}
```

### Cart Item with Audit Trail

```typescript
interface PosPageCartItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string;

  // ===== AUDIT TRAIL =====
  before: ItemPricingSnapshot;          // Original pricing
  hadChangeFromPOS: boolean;            // Was it modified?
  after: ItemPricingSnapshot;           // Final pricing
  reason?: string;                      // Why it changed
}
```

### Order Pricing with Audit Trail

```typescript
interface OrderPricingWithAuditTrail {
  before: OrderPricingSnapshot;           // Before order-level discount
  hadOrderLevelChangeFromPOS: boolean;    // Was order total modified?
  after: OrderPricingSnapshot;            // After order-level discount
  orderLevelChangeReason?: string;        // Why it changed
}
```

---

## Usage Examples

### 1. Check if Item Was Modified

```typescript
const item: PosPageCartItem = /* ... */;

if (item.hadChangeFromPOS) {
  console.log("Item was modified!");
  console.log(`Before: $${item.before.finalPrice}`);
  console.log(`After: $${item.after.finalPrice}`);
  console.log(`Reason: ${item.reason}`);
}
```

### 2. Display Before/After Comparison

```typescript
function ItemAuditTrail({ item }: { item: PosPageCartItem }) {
  if (!item.hadChangeFromPOS) {
    return <span>No changes</span>;
  }

  return (
    <div className="audit-trail">
      <div className="before">
        <p>Before</p>
        <p className="price">${item.before.finalPrice.toFixed(2)}</p>
        <p className="qty">Qty: {item.before.quantity}</p>
      </div>

      <div className="arrow">→</div>

      <div className="after">
        <p>After</p>
        <p className="price">${item.after.finalPrice.toFixed(2)}</p>
        <p className="qty">Qty: {item.after.quantity}</p>
      </div>

      {item.reason && (
        <div className="reason">Reason: {item.reason}</div>
      )}
    </div>
  );
}
```

### 3. Check Order-Level Discount

```typescript
const pricing = cartPricing; // OrderPricingWithAuditTrail

if (pricing?.hadOrderLevelChangeFromPOS) {
  const discount = pricing.before.finalTotal - pricing.after.finalTotal;
  console.log(`Order discount: $${discount.toFixed(2)}`);
  console.log(`Reason: ${pricing.orderLevelChangeReason}`);
}
```

### 4. Display Order Total Changes

```typescript
function OrderPricingAuditTrail({ pricing }: { pricing: OrderPricingWithAuditTrail }) {
  if (!pricing?.hadOrderLevelChangeFromPOS) {
    return null;
  }

  const discount = pricing.before.finalTotal - pricing.after.finalTotal;

  return (
    <div className="order-audit">
      <div className="pricing-row">
        <span>Before Discount:</span>
        <span>${pricing.before.finalTotal.toFixed(2)}</span>
      </div>

      <div className="pricing-row discount">
        <span>Order Discount:</span>
        <span className="saved">-${discount.toFixed(2)}</span>
      </div>

      <div className="pricing-row total">
        <span>After Discount:</span>
        <span>${pricing.after.finalTotal.toFixed(2)}</span>
      </div>

      {pricing.orderLevelChangeReason && (
        <div className="reason">
          Reason: {pricing.orderLevelChangeReason}
        </div>
      )}
    </div>
  );
}
```

### 5. Helper Functions

```typescript
import {
  displayItemChanges,
  displayOrderPricingChanges,
  calculateTotalSavings,
  itemHasChanges,
} from "@/redux/features/business/store/utils/pos-audit-trail-helpers";

// Check if item has any changes
if (itemHasChanges(item)) {
  // Show audit trail
}

// Get readable change summary
const itemSummary = displayItemChanges(item);
// Output: "Price: $5.50 → $4.25 | Promotion: None → 20% PERCENTAGE"

// Get order pricing summary
const orderSummary = displayOrderPricingChanges(pricing);
// Output: "Before: $28.00 → After: $23.00 (Saved: $5.00) | Reason: VIP Loyalty"

// Calculate total savings from all changes
const totalSaved = calculateTotalSavings(cartItems, cartPricing);
```

---

## API Response Example

### Item Response

```json
{
  "id": "cbcef6b9-a6aa-47fe-9207-1885840541dc",
  "product": {
    "id": "00004532-b841-40ee-82a8-5724ccce946b",
    "name": "Cappuccino VIP",
    "imageUrl": "https://...",
    "sizeName": "Medium"
  },
  "before": {
    "currentPrice": 5.5,
    "finalPrice": 5.5,
    "hasActivePromotion": false,
    "quantity": 2,
    "totalBeforeDiscount": 11,
    "discountAmount": 0,
    "totalPrice": 11,
    "promotionType": null,
    "promotionValue": null
  },
  "hadChangeFromPOS": true,
  "after": {
    "currentPrice": 4.25,
    "finalPrice": 4.25,
    "hasActivePromotion": false,
    "quantity": 2,
    "totalBeforeDiscount": 8.5,
    "discountAmount": 0,
    "totalPrice": 8.5,
    "promotionType": null,
    "promotionValue": null
  },
  "reason": "Admin override: 15% employee discount"
}
```

### Order Pricing Response

```json
{
  "before": {
    "totalItems": 6,
    "subtotalBeforeDiscount": 28,
    "subtotal": 28,
    "totalDiscount": 0,
    "deliveryFee": 0,
    "taxAmount": 0,
    "finalTotal": 28
  },
  "hadOrderLevelChangeFromPOS": true,
  "after": {
    "totalItems": 6,
    "subtotalBeforeDiscount": 28,
    "subtotal": 23,
    "totalDiscount": 5,
    "deliveryFee": 0,
    "taxAmount": 0,
    "finalTotal": 23
  },
  "orderLevelChangeReason": "VIP Loyalty discount: $5.00 off"
}
```

---

## Benefits

✅ **Easy Display**: Check `hadChangeFromPOS` flag to show/hide audit trail
✅ **No Null Handling**: If flag is false, audit fields can be ignored
✅ **Complete History**: Both before/after values always available
✅ **Reasoning**: Why each change was made is documented
✅ **Flexible UI**: Can display as comparison, summary, or detailed breakdown
✅ **Mobile Friendly**: Compact structure, easy to parse

---

## Next Steps

1. **Update Redux Slice** to initialize `cartPricing` state
2. **Create Display Components** using the examples above
3. **Update API Mappers** to populate before/after when receiving responses
4. **Add History View** to show order audit trail
5. **Add Summary View** to show total savings from all changes
