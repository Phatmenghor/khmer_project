# Complete API Response Structure - Full Example

## GET /api/v1/orders/{id} - Order Detail Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655550000",
  "orderNumber": "ORD-20260407-001",
  "orderFrom": "CUSTOMER",
  "orderStatus": "COMPLETED",
  "createdAt": "2026-04-07T10:30:00Z",
  
  "customerId": "550e8400-e29b-41d4-a716-446655550002",
  "customerName": "John Doe",
  "customerPhone": "555-0001",
  "customerEmail": "john@example.com",
  "customerNote": "Please ring doorbell twice",
  
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "businessName": "Phatmenghor Business",
  "businessNote": "POS Entry",
  
  "deliveryAddress": {
    "id": "uuid",
    "houseNumber": "123",
    "streetNumber": "Main St",
    "village": "Phnom Penh",
    "commune": "Phnom Penh",
    "district": "Khan Chamkarmon",
    "province": "Phnom Penh",
    "latitude": 11.5564,
    "longitude": 104.9282,
    "note": "Near the market",
    "locationImages": ["url1", "url2"]
  },
  
  "deliveryOption": {
    "name": "Standard Delivery",
    "description": "2-3 hour delivery",
    "price": 2
  },
  
  // ========== PRICING DETAILS ==========
  "pricing": {
    // BEFORE SNAPSHOT (Item-level discounts already applied)
    "before": {
      "totalItems": 6,
      "subtotalBeforeDiscount": 242,          // Sum of all item original prices
      "subtotal": 217.1,                      // After item promotional discounts
      "discountAmount": 24.9,                 // Sum of item-level discounts
      "hasActivePromotion": true,
      "promotionType": "PERCENTAGE",
      "promotionValue": 10,                   // 10% average discount from items
      "deliveryFee": 2,                       // Delivery cost
      "taxAmount": 5,                         // Tax on subtotal
      "finalTotal": 224.1                     // 217.1 + 2 + 5
    },
    
    // Was order modified from POS?
    "hadOrderLevelChangeFromPOS": true,
    
    // AFTER SNAPSHOT (If hadOrderLevelChangeFromPOS is true)
    "after": {
      "totalItems": 6,
      "subtotalBeforeDiscount": 242,          // Original sum (unchanged)
      "subtotal": 214.1,                      // After item discounts (217.1) - order discount (3)
      "discountAmount": 27.9,                 // Item discounts (24.9) + order discount (3)
      "hasActivePromotion": true,
      "promotionType": "FIXED_AMOUNT",        // Order-level discount type
      "promotionValue": 3,                    // Order-level discount amount
      "deliveryFee": 2,
      "taxAmount": 5,
      "finalTotal": 221.1                     // 214.1 + 2 + 5
    },
    
    "reason": "Loyalty promotion ($3 off)"
  },
  
  // ========== PAYMENT INFO ==========
  "payment": {
    "paymentMethod": "CASH",
    "paymentStatus": "PAID"
  },
  
  // ========== ORDER ITEMS ==========
  "items": [
    {
      "id": "item-uuid-1",
      "product": {
        "id": "product-uuid",
        "name": "Coffee",
        "imageUrl": "url",
        "sku": "SKU123",
        "barcode": "BC123",
        "sizeName": "Large"
      },
      
      // BEFORE SNAPSHOT (Original state)
      "before": {
        "currentPrice": 46,                   // Unit price before promotion
        "finalPrice": 41.4,                   // Unit price after promotion (46 * 0.9)
        "quantity": 2,
        "discountAmount": 4.6,                // (46 - 41.4) * 2 = 9.2? No: just 4.6 per item
        "totalPrice": 82.8,                   // 41.4 * 2
        "hasActivePromotion": true,
        "promotionType": "PERCENTAGE",
        "promotionValue": 10                  // 10% discount
      },
      
      // Was item modified?
      "hadChangeFromPOS": true,
      
      // AFTER SNAPSHOT (If hadChangeFromPOS is true)
      "after": {
        "currentPrice": 50.6,                 // Unit price increased (46 * 1.1)
        "finalPrice": 45.54,                  // After promotion (50.6 * 0.9)
        "quantity": 2,
        "discountAmount": 5.06,               // (50.6 - 45.54) * 2 = 10.12? No: 5.06 
        "totalPrice": 91.08,                  // 45.54 * 2
        "hasActivePromotion": true,
        "promotionType": "PERCENTAGE",
        "promotionValue": 10
      },
      
      "reason": "Price adjustment"
    },
    // ... more items
  ],
  
  // ========== STATUS HISTORY ==========
  "statusHistory": [
    {
      "id": "history-uuid",
      "orderStatus": "PENDING",
      "changedAt": "2026-04-07T10:30:00Z",
      "changedBy": {
        "id": "user-uuid",
        "fullName": "Admin User",
        "phoneNumber": "555-9999"
      },
      "note": "Order received"
    },
    {
      "id": "history-uuid-2",
      "orderStatus": "COMPLETED",
      "changedAt": "2026-04-07T12:45:00Z",
      "changedBy": null,
      "note": "Order completed"
    }
  ]
}
```

## Field Explanations

### Pricing Snapshot Fields

| Field | Type | Location | Example | Explanation |
|-------|------|----------|---------|-------------|
| `totalItems` | Integer | before/after | 6 | Number of items in order |
| `subtotalBeforeDiscount` | BigDecimal | before/after | 242 | Sum of all item currentPrice × quantity |
| `subtotal` | BigDecimal | before/after | 217.1 / 214.1 | After all applicable discounts |
| `discountAmount` | BigDecimal | before/after | 24.9 / 27.9 | Sum of all discounts (item + order level) |
| `hasActivePromotion` | Boolean | before/after | true | Is there any discount? |
| `promotionType` | String | before/after | "PERCENTAGE" / "FIXED_AMOUNT" | Type of discount |
| `promotionValue` | BigDecimal | before/after | 10 / 3 | Discount amount or percentage |
| `deliveryFee` | BigDecimal | before/after | 2 | Delivery cost (constant) |
| `taxAmount` | BigDecimal | before/after | 5 | Tax on subtotal (constant) |
| `finalTotal` | BigDecimal | before/after | 224.1 / 221.1 | **subtotal + deliveryFee + taxAmount** |

### Calculation Flow

```
BEFORE Snapshot (Item-level discounts):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
subtotalBeforeDiscount = 242
  ↓ (apply item-level promotions: 10% average)
subtotal = 217.1
discountAmount = 24.9 (242 - 217.1)
  ↓ (add delivery + tax)
finalTotal = 217.1 + 2 + 5 = 224.1


AFTER Snapshot (Order-level discount applied):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
subtotalBeforeDiscount = 242 (unchanged)
  ↓ (apply item-level promotions: 10% average)
subtotal_after_items = 217.1
  ↓ (apply order-level discount: $3 FIXED_AMOUNT)
subtotal = 217.1 - 3 = 214.1
discountAmount = 24.9 + 3 = 27.9 (combined)
promotionType = "FIXED_AMOUNT" (order-level type)
promotionValue = 3 (order-level amount)
  ↓ (add delivery + tax)
finalTotal = 214.1 + 2 + 5 = 221.1
```

## Key Points

1. **deliveryFee** and **taxAmount** are **constant** across before/after - they don't change
2. **subtotalBeforeDiscount** is **constant** - it's the original sum
3. **subtotal** changes - it reflects current discounts applied
4. **finalTotal** = subtotal + deliveryFee + taxAmount (not a separate field, calculated)
5. **discountAmount** accumulates (item + order level in after snapshot)
6. When **hadOrderLevelChangeFromPOS** = false, there is NO "after" snapshot

## Frontend Usage Pattern

```typescript
// Display pricing
const { before, after, hadOrderLevelChangeFromPOS } = pricing;

// Show before state
console.log(`Items: ${before.totalItems}`);
console.log(`Original: ${before.subtotalBeforeDiscount}`);
console.log(`After discounts: ${before.subtotal}`);
console.log(`Delivery: ${before.deliveryFee}`);
console.log(`Tax: ${before.taxAmount}`);
console.log(`Total: ${before.finalTotal}`);

// Show after state if changed
if (hadOrderLevelChangeFromPOS && after) {
  console.log(`New total after order discount: ${after.finalTotal}`);
  console.log(`Order discount: ${after.promotionValue} ${after.promotionType}`);
}
```
