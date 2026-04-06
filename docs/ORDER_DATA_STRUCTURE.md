# Complete Order Data Structure

## Overview
Complete order data structure with **ALL fields populated** - no null values. Includes the **orderFrom** field to distinguish between CUSTOMER orders (from checkout) and BUSINESS orders (from admin/POS).

---

## Key Fields

### **orderFrom** (NEW FIELD)
Indicates the source of the order:
- **CUSTOMER**: Order created from public checkout page
- **BUSINESS**: Order created from admin/POS system

### **createdBy & updatedBy**
Reflects the source:
- **CUSTOMER orders**: `customer-user`
- **BUSINESS orders**: `admin-user-###` or `staff-user-###`

### **isPriority**
- **CUSTOMER**: `false` (regular customers)
- **BUSINESS**: `true` (POS orders may be priority)

### **deviceInfo**
Different for each source:
- **CUSTOMER**: Mobile device info (iOS/Android, Mobile Safari)
- **BUSINESS**: Desktop/POS info (Windows, POS System)

---

## Complete Field List

```
Order Object
├── id: string (UUID)
├── createdAt: datetime
├── updatedAt: datetime
├── createdBy: string (customer-user / admin-user / staff-user)
├── updatedBy: string
│
├── orderNumber: string (ORD-YYYYMMDD-{SOURCE}-####)
├── orderFrom: string (CUSTOMER / BUSINESS) ★ NEW
│
├── Customer Info
│   ├── customerId: string (UUID)
│   ├── customerName: string
│   ├── customerPhone: string
│   └── customerEmail: string
│
├── Business Info
│   ├── businessId: string (UUID)
│   └── businessName: string
│
├── deliveryAddress: object
│   ├── id: string
│   ├── village: string
│   ├── commune: string
│   ├── district: string
│   ├── province: string
│   ├── streetNumber: string
│   ├── houseNumber: string
│   ├── landmark: string
│   ├── note: string
│   ├── latitude: number
│   ├── longitude: number
│   ├── isDefault: boolean
│   ├── addressType: string (HOME/OFFICE/RESTAURANT)
│   └── isActive: boolean
│
├── deliveryOption: object
│   ├── id: string
│   ├── name: string
│   ├── description: string
│   ├── imageUrl: string
│   ├── price: number
│   ├── estimatedMinutes: number
│   ├── estimatedMaxMinutes: number
│   ├── isActive: boolean
│   └── deliveryType: string (STANDARD/EXPRESS/DINE_IN)
│
├── Order Status
│   ├── orderStatus: string (PENDING/CONFIRMED/PREPARING/READY/DELIVERING/COMPLETED)
│   └── orderStatusHistory: array
│       └── each status object:
│           ├── status: string
│           ├── changedAt: datetime
│           ├── changedBy: string
│           └── note: string
│
├── Notes
│   ├── customerNote: string
│   └── businessNote: string
│
├── Pricing: object
│   ├── before: object
│   │   ├── totalItems: number
│   │   ├── subtotalBeforeDiscount: number
│   │   ├── subtotal: number
│   │   ├── totalDiscount: number
│   │   ├── deliveryFee: number
│   │   ├── taxAmount: number
│   │   └── finalTotal: number
│   ├── after: object (same structure as before)
│   ├── hadOrderLevelChangeFromPOS: boolean
│   ├── reason: string
│   ├── discountPercent: number
│   ├── taxPercent: number
│   └── currency: string
│
├── Payment: object
│   ├── id: string
│   ├── paymentMethod: string (CASH/CARD/BANK_TRANSFER/MOBILE_PAYMENT)
│   ├── paymentStatus: string (PENDING/PAID/FAILED/REFUNDED)
│   ├── paidAmount: number
│   ├── changeAmount: number
│   ├── paymentDate: datetime
│   ├── transactionId: string
│   └── notes: string
│
├── Items: array
│   └── each item object:
│       ├── id: string
│       ├── product: object
│       │   ├── id: string
│       │   ├── name: string
│       │   ├── imageUrl: string
│       │   ├── sizeId: string
│       │   ├── sizeName: string
│       │   ├── status: string (ACTIVE/INACTIVE)
│       │   └── category: string
│       ├── before: object
│       │   ├── currentPrice: number
│       │   ├── finalPrice: number
│       │   ├── hasActivePromotion: boolean
│       │   ├── quantity: number
│       │   ├── totalBeforeDiscount: number
│       │   ├── discountAmount: number
│       │   ├── totalPrice: number
│       │   ├── promotionType: string (PERCENTAGE/FIXED/NONE)
│       │   ├── promotionValue: number
│       │   ├── promotionFromDate: datetime
│       │   └── promotionToDate: datetime
│       ├── hadChangeFromPOS: boolean
│       ├── after: object (same as before, null if no change)
│       ├── reason: string
│       ├── notes: string
│       ├── specialInstructions: string
│       └── isAvailable: boolean
│
├── Timing
│   ├── estimatedDeliveryTime: datetime
│   └── actualDeliveryTime: datetime
│
├── Attributes
│   ├── isSpecialOrder: boolean
│   ├── isPriority: boolean (true for BUSINESS/POS orders)
│   └── source: string (CUSTOMER/BUSINESS)
│
└── deviceInfo: object
    ├── deviceType: string (MOBILE/DESKTOP/TABLET)
    ├── osType: string (iOS/Android/Windows/Mac)
    ├── appVersion: string
    ├── userAgent: string
    ├── ipAddress: string
    ├── timezone: string
    └── language: string
```

---

## Differences: CUSTOMER vs BUSINESS Orders

| Field | CUSTOMER | BUSINESS |
|-------|----------|----------|
| **orderFrom** | CUSTOMER | BUSINESS |
| **orderNumber** | ORD-20260403-WEB-#### | ORD-20260403-POS-#### |
| **createdBy** | customer-user | admin-user-### |
| **customerName** | Real customer name | Walk-in Customer |
| **deliveryOption** | Standard/Express Delivery | Dine-in / Delivery |
| **deliveryFee** | 2.0 (fee applied) | 0.0 (dine-in) |
| **isPriority** | false | true |
| **deviceType** | MOBILE | DESKTOP |
| **osType** | iOS/Android | Windows/Mac |
| **after pricing** | null (no changes) | May have changes if staff adjusted |
| **hadOrderLevelChangeFromPOS** | false | Usually true |

---

## Usage Examples

### Generate CUSTOMER Order (from checkout)
```java
Map<String, Object> order = OrderDataGenerator.generateCompleteOrder(OrderSource.CUSTOMER);
// Returns order with orderFrom = "CUSTOMER"
```

### Generate BUSINESS Order (from admin/POS)
```java
Map<String, Object> order = OrderDataGenerator.generateCompleteOrder(OrderSource.BUSINESS);
// Returns order with orderFrom = "BUSINESS"
```

---

## Sample Values

### No Null Fields - All Fields Have Values

✅ **Complete Data Example:**
```json
{
  "id": "96bff881-acc3-4998-a289-8aac6f7d7d42",
  "orderFrom": "CUSTOMER",
  "customerNote": "Please prepare carefully",
  "businessNote": "VIP customer",
  "pricing": {
    "before": { ...complete data... },
    "after": { ...complete data... }
  },
  "items": [
    {
      "id": "...",
      "before": { ...complete data... },
      "after": { ...complete data... },
      "notes": "Special instructions here"
    }
  ]
}
```

❌ **Never Use Null:**
```json
{
  "after": null,              // ❌ Bad
  "reason": "",              // ✅ Use empty string
  "customerNote": null,       // ❌ Bad
  "businessNote": "note",     // ✅ Always provide value
}
```

---

## Key Validations

1. **No null values** - Use empty strings `""` instead
2. **All dates** - Must be valid ISO 8601 format
3. **All numbers** - Must be >= 0 for prices/quantities
4. **orderFrom** - Must be either "CUSTOMER" or "BUSINESS"
5. **orderStatus** - Must be one of valid statuses
6. **Currency** - Always specify (USD, KHR, etc.)

---

## Files Reference

- **Java Generator**: `src/main/java/com/emenu/features/order/util/OrderDataGenerator.java`
- **CUSTOMER Example**: `docs/order-data-complete-example.json`
- **BUSINESS Example**: `docs/order-data-business-example.json`

---

## Next Steps

1. Use `OrderDataGenerator` to create test data
2. All fields are automatically populated
3. No manual null handling needed
4. Ready for API responses and database storage
