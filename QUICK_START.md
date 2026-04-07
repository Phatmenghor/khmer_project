# Quick Start Guide - Pricing Updates Implementation

## ✅ Completed

### Backend API
- [x] OrderPricingSnapshot DTO - Updated field names
- [x] OrderItemPricingSnapshot DTO - Updated field names
- [x] OrderPricingInfo DTO - Removed duplicate discountType
- [x] OrderMapper - Proper calculation of item-level and order-level discounts
- [x] Database Migration V5 - Added discount_type column
- [x] Database Migration V6 - Generated comprehensive test data

### Frontend Type Definitions
- [x] order-response.ts - Updated to new field names
- [x] order-api-response.ts - Updated to new field names
- [x] order.types.ts - Updated to new field names
- [x] pos-page-type.ts - Updated to new field names
- [x] pos-checkout-request.ts - Updated to new field names

### Frontend UI Components
- [x] Order Detail Page (`orders/[id]/page.tsx`) - Now displays before snapshot pricing

### Documentation
- [x] API_RESPONSE_STRUCTURE.md - Field mapping reference
- [x] COMPLETE_API_RESPONSE_EXAMPLE.md - Full JSON example with formulas
- [x] UPDATES_SUMMARY.md - Comprehensive change reference
- [x] comprehensive-test-data.sql - Standalone test data file

---

## 🔄 In Progress / Not Started

### POS Page Updates
- [ ] Update pricing calculation logic to use new field names
- [ ] Update cart summary to use discountAmount
- [ ] Update discount metadata to use promotionType/promotionValue
- [ ] Test POS order creation with new schema

### Cart & Checkout Pages
- [ ] Update cart state to use new field names
- [ ] Update checkout summary display
- [ ] Update order creation request payload

### Order Admin Table & Status Pages
- [ ] Update any pricing displays in admin tables
- [ ] Update status history displays

---

## 🚀 How to Test

### 1. Run Database Migrations
```bash
cd menu-scanner-backend
mvn clean flyway:clean flyway:migrate
```

### 2. Regenerate Test Data
```bash
# Using Flyway (automatic with migration)
# OR manually run:
psql -U postgres -d khmer_project < comprehensive-test-data.sql
```

### 3. Start Backend
```bash
mvn spring-boot:run
```

### 4. Test API Endpoints

#### Get Order Detail
```bash
curl http://localhost:8080/api/v1/orders/[order-id]
```

Expected response structure:
```json
{
  "id": "...",
  "orderNumber": "ORD-20260407-001",
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
    },
    "hadOrderLevelChangeFromPOS": true,
    "after": {
      "subtotal": 214.1,
      "discountAmount": 27.9,
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 3,
      "finalTotal": 221.1
    }
  },
  "items": [
    {
      "id": "...",
      "before": {
        "currentPrice": 46,
        "finalPrice": 41.4,
        "quantity": 2,
        "discountAmount": 9.2,
        "totalPrice": 82.8,
        "hasActivePromotion": true,
        "promotionType": "PERCENTAGE",
        "promotionValue": 10
      }
    }
  ]
}
```

### 5. Test Frontend

#### Start Frontend
```bash
cd menu-scanner-frontend-client
npm run dev
```

#### Check Order Detail Page
- Navigate to `/orders/[any-order-id]`
- Verify pricing displays with new field names
- Check that before snapshot is displayed correctly

---

## 📊 Field Reference

### Pricing Snapshot Fields
```typescript
interface OrderPricingSnapshot {
  totalItems: number;              // Number of items in order
  subtotalBeforeDiscount: number;  // Sum of original prices
  subtotal: number;                // After discounts applied
  discountAmount: number;          // ✅ NEW NAME (was totalDiscount)
  hasActivePromotion: boolean;     // ✅ NEW FIELD
  promotionType: string | null;    // ✅ NEW FIELD - "PERCENTAGE" or "FIXED_AMOUNT"
  promotionValue: number | null;   // ✅ NEW FIELD
  deliveryFee: number;
  taxAmount: number;
  finalTotal: number;
}
```

### Item Pricing Snapshot Fields
```typescript
interface OrderItemPricingSnapshot {
  currentPrice: number;        // Base price per unit
  finalPrice: number;          // Price after promotion
  quantity: number;
  discountAmount: number;      // ✅ NEW NAME (was totalDiscount)
  totalPrice: number;          // finalPrice × quantity
  hasActivePromotion: boolean; // ✅ NEW FIELD
  promotionType: string | null;   // ✅ NEW FIELD
  promotionValue: number | null;  // ✅ NEW FIELD
}
```

---

## 🔍 Common Issues & Solutions

### Issue: "totalDiscount is not defined"
**Solution**: Replace with `discountAmount`
```typescript
// Before
order.pricing.totalDiscount

// After
order.pricing.before.discountAmount  // or
order.pricing.after.discountAmount
```

### Issue: "discountType is not defined"
**Solution**: Use `promotionType` in the snapshot
```typescript
// Before
order.pricing.discountType

// After
order.pricing.before.promotionType  // or
order.pricing.after.promotionType
```

### Issue: Pricing doesn't match between before/after
**Make sure to check `hadOrderLevelChangeFromPOS`**:
```typescript
const displayPricing = order.pricing.hadOrderLevelChangeFromPOS
  ? order.pricing.after      // Show after snapshot if changed
  : order.pricing.before;    // Show before snapshot otherwise
```

---

## 📝 Commit History

```
e2a57a0 Add comprehensive updates summary and documentation
20e4e70 Add comprehensive test data generation script
6d993a0 Update frontend type definitions to use new pricing field names
2c557a3 Add API response structure documentation
9e67b9c Add V6 migration: regenerate test data
47ed577 Fix OrderMapper: remove discountType from OrderPricingInfo
7d9f077 Update frontend to use standardized pricing field names
2be828f Standardize pricing field names across order and item level
```

---

## 📞 Next Steps

1. **Update POS Page** - Convert pricing calculations to use new field names
2. **Update Cart/Checkout** - Ensure cart state uses new names
3. **Run Full Test Suite** - Test all order flows
4. **Deploy** - Push to production with database migrations

---

## 📚 Reference Documents

- `API_RESPONSE_STRUCTURE.md` - Complete API reference
- `COMPLETE_API_RESPONSE_EXAMPLE.md` - Full JSON with calculations
- `UPDATES_SUMMARY.md` - Detailed change reference
- `comprehensive-test-data.sql` - Test data generation

