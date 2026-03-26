# POS Checkout - Complete Audit Trail Documentation

## Overview

The POS checkout system implements a comprehensive before/after audit trail at both item and order levels to ensure complete accountability for all price modifications and discounts applied by administrators.

---

## 1. Architecture Overview

### Frontend-to-Backend Data Flow

```
Frontend (React/Next.js)
├── User edits item price in modal
│   └── originalPrice (tracked) → currentPrice (overridden by admin)
├── System applies promotion
│   └── finalPrice (after promotion)
├── Admin applies order-level discount (modal)
│   └── Order discount (fixed $ or % applied)
└── Submit order with complete audit trail
    └── Backend receives nested structure

Backend (Spring Boot)
├── Validates nested POSCheckoutRequest
├── Extracts items from cart.items[]
├── Stores order with complete snapshot
│   ├── Order.businessNote (audit summary)
│   └── OrderItem.currentPrice, finalPrice
├── Creates OrderPayment (PAID)
└── Records OrderStatusHistory (COMPLETED)
```

---

## 2. Price Tracking (3-Tier System)

Each order item tracks three price points for complete transparency:

### Tier 1: originalPrice
- **Definition**: Product's starting price at time of order creation
- **Set by**: System (product catalog price)
- **Can change**: Never - locked for audit trail
- **Used for**: Historical reference, calculating discount impact
- **Frontend**: `PosPageCartItem.originalPrice`
- **Backend DTO**: `POSCheckoutItemRequest.originalPrice`
- **Database**: Captured in business note (JSON audit trail)

### Tier 2: currentPrice
- **Definition**: Price after admin override (if any)
- **Set by**: Admin via edit item modal
- **Can change**: Yes - admin can set custom price
- **Used for**: Calculating final price and discount amounts
- **Frontend**: `PosPageCartItem.currentPrice`
- **Backend DTO**: `POSCheckoutItemRequest.currentPrice`
- **Database**: `order_items.current_price`

### Tier 3: finalPrice
- **Definition**: Price after promotions applied
- **Set by**: System (applies promotion rules to currentPrice)
- **Can change**: Yes - through promotions
- **Used for**: Total calculation, customer invoice
- **Frontend**: `PosPageCartItem.finalPrice`
- **Backend DTO**: `POSCheckoutItemRequest.finalPrice`
- **Database**: `order_items.final_price`

---

## 3. Item-Level Audit Trail

### Calculation Flow

```
originalPrice ($5.00)
    ↓ (admin overrides in edit modal)
currentPrice ($4.25) [15% employee discount]
    ↓ (system applies auto promotion if exists)
finalPrice ($4.25 or $3.40 if 20% promotion)
    ↓ (multiply by quantity)
totalPrice (item line total)

Discount amount = originalPrice - finalPrice per unit
Total discount = (originalPrice - finalPrice) × quantity
```

### Example: Employee Gets 15% Discount + 20% Promotion

| Field | Value | Note |
|-------|-------|------|
| Original Price | $5.00 | No change |
| Admin Override | $4.25 | 15% employee discount applied |
| Promotion Applied | 20% OFF | Auto promotion from system |
| Final Price | $3.40 | $4.25 × (1 - 20%) |
| Quantity | 2 | Items |
| Total Discount | $3.20 | ($5.00 - $3.40) × 2 |
| Total Price | $6.80 | $3.40 × 2 |

### Stored Audit Trail

Frontend `POSCheckoutItemRequest.auditTrail`:
```javascript
[
  {
    originalPrice: 5.00,
    overriddenPrice: 4.25,
    appliedPromotion: "20% PERCENTAGE",
    finalPrice: 3.40,
    modifiedAt: "2026-03-26T10:30:00Z",
    reason: "Employee 15% discount + Auto promotion 20% OFF"
  }
]
```

Backend stores this in `Order.businessNote` as:
```
AUDIT TRAIL: Admin Override + Promotion Applied
Original Price: $5.00 × 2 = $10.00
Admin Override: $5.00 → $4.25 (15% employee discount)
Auto Promotion Applied: 20% OFF = $1.70 discount per item
Final Price: $3.40 × 2 = $6.80
```

---

## 4. Order-Level Discount

### Types Supported

#### Fixed Amount Discount
```
Subtotal: $28.00
Order Discount (FIXED): -$5.00
Final Total: $23.00

Example: VIP customer gets $5 loyalty discount
```

#### Percentage Discount
```
Subtotal: $50.00
Order Discount (PERCENTAGE): -15% = $7.50
Final Total: $42.50

Example: Bulk order (5+ items) gets 15% discount
```

### Calculation Priority

```
Step 1: Calculate item totals
  └─ originalPrice × quantity = subtotal per item

Step 2: Apply item-level overrides & promotions
  └─ currentPrice/finalPrice × quantity = adjusted item total

Step 3: Sum all items
  └─ Subtotal = sum of all adjusted item totals

Step 4: Apply order-level discount
  └─ FIXED: Final = Subtotal - discountAmount
  └─ PERCENTAGE: Final = Subtotal × (1 - discountPercentage/100)

Step 5: Add delivery/tax (if applicable)
  └─ Total = Final + delivery + tax
```

### Frontend State Management

```typescript
interface OrderDiscount {
  type: "fixed" | "percentage";
  value: number;          // Dollar amount or percentage
  reason: string;         // Business reason (VIP, Bulk, etc.)
}

// Redux state in pos/page.tsx
const [orderDiscount, setOrderDiscount] = useState<OrderDiscount | null>(null);

// Applied in handleSubmitOrder()
const finalTotal = (() => {
  let total = cartSummary.finalTotal;
  if (orderDiscount) {
    if (orderDiscount.type === "fixed") {
      total = Math.max(0, total - orderDiscount.value);
    } else if (orderDiscount.type === "percentage") {
      total = total * (1 - (orderDiscount.value / 100));
    }
  }
  return total;
})();
```

### Backend Persistence

```java
// Order model
private BigDecimal discountAmount;  // Order-level discount
private String businessNote;        // Audit trail including reason

// Stored in businessNote:
"Order-Level Discount Applied: FIXED $5.00 | Reason: VIP Customer Loyalty"
"Order-Level Discount Applied: 15% PERCENTAGE = $7.50 | Reason: Bulk Order Discount"
```

---

## 5. Complete Request/Response Structure

### Frontend → Backend Request (POSCheckoutRequest)

```json
{
  "businessId": "uuid",
  "customerId": "uuid or null",
  "customerName": "string",
  "customerPhone": "string",

  "deliveryAddress": {
    "houseNumber": "string",
    "streetNumber": "string",
    "village": "string",
    "commune": "string",
    "district": "string",
    "province": "string"
  },

  "deliveryOption": {
    "name": "Pickup",
    "description": "string",
    "imageUrl": "string",
    "price": 0.00
  },

  "cart": {
    "businessId": "uuid",
    "businessName": "string",
    "items": [
      {
        "productId": "uuid",
        "productSizeId": "uuid or null",
        "quantity": 2,
        "productName": "Cappuccino",
        "productImageUrl": "string",
        "sizeName": "Medium",
        "status": "ACTIVE",

        "originalPrice": 5.00,
        "currentPrice": 4.25,
        "finalPrice": 3.40,
        "hasActivePromotion": true,
        "overridePrice": 4.25,
        "promotionType": "PERCENTAGE",
        "promotionValue": 20,

        "totalBeforeDiscount": 10.00,
        "discountAmount": 3.20,
        "totalPrice": 6.80,

        "auditTrail": [
          {
            "originalPrice": 5.00,
            "overriddenPrice": 4.25,
            "appliedPromotion": "20% PERCENTAGE",
            "modifiedAt": "2026-03-26T10:30:00Z",
            "reason": "Employee discount + auto promotion"
          }
        ]
      }
    ],

    "totalItems": 1,
    "totalQuantity": 2,
    "subtotalBeforeDiscount": 10.00,
    "subtotal": 6.80,
    "totalDiscount": 3.20,
    "finalTotal": 1.80  // After order-level discount
  },

  "payment": {
    "paymentMethod": "CASH",
    "paymentStatus": "PAID"
  },

  "orderStatus": "COMPLETED",
  "customerNote": "Special instructions",
  "businessNote": "Complete audit trail including all discounts"
}
```

---

## 6. Database Schema

### orders table
```sql
-- Pricing
subtotal NUMERIC          -- Items total before order discount
discount_amount NUMERIC   -- Order-level discount ($)
total_amount NUMERIC      -- Final total (subtotal - discount)

-- Audit
business_note TEXT        -- Complete modification history
payment_status ENUM       -- PAID, UNPAID, etc.
source VARCHAR            -- PUBLIC or POS
created_by UUID          -- Who created this order
```

### order_items table
```sql
-- Pricing Snapshot
current_price NUMERIC     -- After admin override (if any)
final_price NUMERIC       -- After promotions
unit_price NUMERIC        -- Same as final_price (backward compat)
quantity INTEGER
total_price NUMERIC       -- final_price × quantity

-- Promotion Details
has_promotion BOOLEAN
promotion_type VARCHAR    -- PERCENTAGE or FIXED_AMOUNT
promotion_value NUMERIC
promotion_from_date TIMESTAMP
promotion_to_date TIMESTAMP

-- Special Instructions
special_instructions TEXT -- Can contain override reason
```

---

## 7. Real-World Scenarios

### Scenario 1: Employee 15% Discount
**Situation**: Staff member buys coffee

| Item | Original | Override | Promo | Final | Qty | Total |
|------|----------|----------|-------|-------|-----|-------|
| Cappuccino | $5.00 | $4.25 | - | $4.25 | 1 | $4.25 |
| Pastry | $4.50 | - | - | $4.50 | 1 | $4.50 |
| **Order** | | | | | | |
| **Subtotal** | | | | | | $8.75 |
| **Discount** | | | | | | -$0.00 |
| **Total** | | | | | | $8.75 |

**Audit Trail**:
```
Admin Override Applied
Original Price: $5.00 × 1 = $5.00
Overridden to: $4.25 × 1 = $4.25
Reason: Employee 15% discount
No Promotion Applied
Final Total: $8.75
```

### Scenario 2: 20% Auto Promotion
**Situation**: Customer orders during promotion

| Item | Original | Override | Promo | Final | Qty | Total |
|------|----------|----------|-------|-------|-----|-------|
| Latte | $10.00 | - | -20% | $8.00 | 2 | $16.00 |
| **Order** | | | | | | |
| **Subtotal** | | | | | | $20.00 |
| **Discount** | | | | | | -$4.00 |
| **Total** | | | | | | $16.00 |

**Audit Trail**:
```
Auto Promotion Applied
Original Price: $10.00 × 2 = $20.00
Promotion: 20% OFF (PERCENTAGE) = $4.00 discount
Final Price After Promotion: $8.00 × 2 = $16.00
```

### Scenario 3: Stacked (Override + Promotion)
**Situation**: Admin overrides price, promotion also applies

| Item | Original | Override | Promo | Final | Qty | Total |
|------|----------|----------|-------|-------|-----|-------|
| Espresso | $6.25 | $5.00 | -30% | $3.50 | 2 | $7.00 |
| Muffin | $2.50 | - | - | $2.50 | 1 | $2.50 |
| **Order** | | | | | | |
| **Subtotal** | | | | | | $9.50 |
| **Discount** | | | | | | -$2.25 |
| **Total** | | | | | | $7.25 |

**Audit Trail**:
```
Admin Override + Promotion Applied
Original Price: $6.25 × 2 = $12.50
Admin Override: $5.00/each → Savings: $2.50
Auto Promotion: 30% OFF items (PERCENTAGE) = additional $3.75 discount
Final Price: $3.50 × 2 = $7.00
```

### Scenario 4: VIP Fixed Order Discount
**Situation**: VIP customer gets $5 loyalty discount on entire order

| Item | Original | Override | Promo | Final | Qty | Total |
|------|----------|----------|-------|-------|-----|-------|
| Cappuccino | $5.50 | - | - | $5.50 | 2 | $11.00 |
| Croissant | $4.00 | - | - | $4.00 | 2 | $8.00 |
| Tea | $3.50 | - | - | $3.50 | 1 | $3.50 |
| Cake | $5.50 | - | - | $5.50 | 1 | $5.50 |
| **Order** | | | | | | |
| **Subtotal** | | | | | | $28.00 |
| **Order Discount** | | | | FIXED -$5 | | |
| **Total** | | | | | | $23.00 |

**Audit Trail**:
```
Order-Level Discount Applied
Subtotal Before Discount: $28.00
Order-Level Discount: FIXED $5.00 (Type: fixed_amount)
Reason: VIP Customer Loyalty Discount
Final Total: $23.00
```

### Scenario 5: Bulk Order Percentage Discount
**Situation**: 5+ items ordered = 15% discount on entire order

| Item | Original | Override | Promo | Final | Qty | Total |
|------|----------|----------|-------|-------|-----|-------|
| Cappuccino | $6.00 | - | - | $6.00 | 3 | $18.00 |
| Latte | $6.50 | - | - | $6.50 | 2 | $13.00 |
| Biscuits Box | $9.50 | - | - | $9.50 | 2 | $19.00 |
| **Order** | | | | | | |
| **Subtotal** | | | | | | $50.00 |
| **Order Discount** | | | | 15% -$7.50 | | |
| **Total** | | | | | | $42.50 |

**Audit Trail**:
```
Order-Level Percentage Discount Applied
Subtotal Before Discount: $50.00
Order-Level Discount: 15% (Type: percentage) = $7.50 discount
Reason: Bulk Order Discount (5+ items)
Final Total: $42.50
```

---

## 8. Frontend Components

### POSMoreOptionsModal
- **Location**: `menu-scanner-frontend-client/src/components/pos-custom/pos-more-options-modal.tsx`
- **Purpose**: Collect order-level discount and customer note
- **Props**:
  - `open: boolean` - Modal visibility
  - `onOpenChange: (open: boolean) => void` - Close handler
  - `customerNote: string` - Current note
  - `onNoteChange: (note: string) => void` - Note update handler
  - `onDiscountApply?: (discount: {...}) => void` - Discount callback
- **Discount Callback**:
  ```typescript
  onDiscountApply({
    type: "fixed" | "percentage",
    value: number,
    reason: string
  })
  ```

### POS Page State
- **Location**: `menu-scanner-frontend-client/src/redux/features/business/store/pos/page.tsx`
- **State Management**:
  ```typescript
  const [orderDiscount, setOrderDiscount] = useState<{
    type: "fixed" | "percentage";
    value: number;
    reason: string;
  } | null>(null);
  ```
- **Cart Item Structure**:
  ```typescript
  interface PosPageCartItem {
    originalPrice?: number;    // Product's starting price
    currentPrice: number;      // After admin override
    finalPrice: number;        // After promotions
  }
  ```

---

## 9. Backend Components

### POSCheckoutRequest DTO
- **Location**: `menu-scanner-backend/src/main/java/com/emenu/features/order/dto/request/POSCheckoutRequest.java`
- **Structure**: Nested objects for clean separation
  - `deliveryAddress: POSCheckoutAddressRequest`
  - `deliveryOption: DeliveryOptionInfo`
  - `cart: CartSummary` (contains items array)
  - `payment: PaymentInfo`

### POSCheckoutItemRequest DTO
- **Location**: `menu-scanner-backend/src/main/java/com/emenu/features/order/dto/request/POSCheckoutItemRequest.java`
- **Key Fields**:
  - `originalPrice` - Captured for audit
  - `currentPrice` - Admin override
  - `finalPrice` - After promotions
  - `auditTrail` - List of modifications

### OrderServiceImpl
- **Method**: `createPOSCheckoutOrder(POSCheckoutRequest request)`
- **Location**: `menu-scanner-backend/src/main/java/com/emenu/features/order/service/impl/OrderServiceImpl.java` (line ~490+)
- **Process**:
  1. Validates nested request structure
  2. Creates Order with source='POS', status='COMPLETED'
  3. Extracts items from `request.getCart().getItems()`
  4. For each item:
     - Stores currentPrice (admin override)
     - Stores finalPrice (after promotions)
     - Calculates discounts
     - Creates OrderItem record
  5. Stores complete audit trail in Order.businessNote
  6. Creates OrderPayment with status=PAID
  7. Creates OrderStatusHistory=COMPLETED

---

## 10. Testing Checklist

### Item-Level Auditing
- [ ] Admin can override item price in edit modal
- [ ] System preserves originalPrice (from product catalog)
- [ ] System applies promotions to currentPrice (not originalPrice)
- [ ] Audit trail includes all three price points
- [ ] Discount calculation is correct: (original - final) × qty

### Order-Level Discounting
- [ ] Admin can apply fixed dollar discount from modal
- [ ] Admin can apply percentage discount from modal
- [ ] Modal shows discount reason/notes
- [ ] Final total reflects discount: subtotal - discount
- [ ] Discount is applied AFTER all item calculations

### Data Submission
- [ ] Frontend sends complete nested structure
- [ ] Backend receives nested cart/items array
- [ ] Backend extracts items from cart.items (not flat)
- [ ] Backend creates order with businessNote audit trail
- [ ] Backend creates order payment (PAID)

### Business Review
- [ ] Order businessNote shows clear before/after values
- [ ] Each item shows: original → override → final prices
- [ ] Order-level discount documented with reason
- [ ] All modifications traceable to admin action
- [ ] Timestamp of each modification recorded

### Enhanced Test Data
- [ ] enhanced-pos-test-data.sql loads successfully
- [ ] 5 real-world scenarios visible in orders table
- [ ] businessNote field shows proper audit trails
- [ ] Queries return correct discount amounts
- [ ] Sample data useful for business owner review

---

## 11. SQL Verification Queries

### View All POS Orders with Audit Trails
```sql
SELECT
  order_number,
  total_amount,
  discount_amount,
  business_note,
  created_at
FROM orders
WHERE source = 'POS' AND business_note LIKE '%AUDIT TRAIL%'
ORDER BY created_at DESC;
```

### View Item Details with Price History
```sql
SELECT
  o.order_number,
  oi.product_name,
  oi.quantity,
  oi.current_price,
  oi.final_price,
  oi.total_price,
  oi.has_promotion,
  oi.promotion_type,
  oi.promotion_value
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.source = 'POS'
ORDER BY o.created_at DESC;
```

### Summary Statistics
```sql
SELECT
  COUNT(*) as "Total POS Orders",
  COUNT(DISTINCT customer_id) as "Unique Customers",
  SUM(discount_amount) as "Total Discounts Applied",
  SUM(total_amount) as "Total Revenue",
  AVG(discount_amount) as "Avg Discount per Order"
FROM orders
WHERE source = 'POS';
```

---

## 12. Key Takeaways

✅ **Complete Transparency**: Every price change tracked from original → final
✅ **Multi-level Auditing**: Item-level + order-level discounts both supported
✅ **Business Accountability**: businessNote field stores complete modification history
✅ **Flexible Pricing**: Admins can override item prices, apply promotions, or add order discounts
✅ **Type Safety**: Enum-based payment methods (CASH) and status values
✅ **Unified Structure**: Frontend and backend use same nested request structure
✅ **Real-world Examples**: Enhanced test data shows practical scenarios

---

## Summary

The POS checkout system now provides complete before/after audit trails for all pricing modifications:

- **3-tier price tracking**: originalPrice → currentPrice → finalPrice
- **Item-level audits**: Product price overrides with promotion application
- **Order-level discounts**: Fixed amount ($) or percentage (%) with business reason
- **Complete accountability**: All changes documented in businessNote for review
- **Frontend/Backend alignment**: Unified nested structure for clean data flow

This ensures business owners have complete visibility into all administrative actions and can audit the entire pricing chain for accountability and compliance.
