# POS Order System - Coffee Shop Edition

## Overview

POS orders are **in-shop orders** (like coffee shop counter orders):

1. **Shop staff takes order at POS register**
   - Scans items, sets quantities
   - Applies discounts if needed
   - Gets payment
   - Submits order

2. **Order is COMPLETE when submitted**
   - All details finalized
   - Ready to prepare immediately
   - Starts as `CONFIRMED` status
   - Goes straight to `PREPARING` → `READY` → pickup

---

## Key Differences: POS vs Customer Orders

| Aspect | POS (In-Shop) | Customer (Online) |
|--------|---------------|------------------|
| **Who creates** | Shop staff at register | Customer online |
| **Data entry** | All done at counter | Customer enters details |
| **Status at creation** | `COMPLETED` (all data finalized) | `PENDING` (awaiting confirmation) |
| **Next step** | Order data is complete | Admin confirms & prepares |
| **Payment** | Usually already paid | May be pending |
| **Endpoint** | `/checkout-from-pos` | `/checkout` |
| **Delivery** | Pickup or delivery | Delivery only |

---

## How It Works (Coffee Shop Example)

**Shop Staff at Counter:**
```
1. Customer orders: "2 cappuccino, 1 latte"
2. Staff enters into POS
3. POS shows: Items, Prices, Total = 15,000 Riel
4. Customer pays
5. Staff clicks "Submit"
   ↓
6. Order CREATED
   - Order ID: Generated same as public orders
   - Order Number: #ORD-2024-0001 (same sequence as public)
   - Status: COMPLETED
   - Source: POS (differentiator)
7. Kitchen/Barista sees: "ORDER #ORD-2024-0001 - COMPLETED - [POS]"
   - 2 cappuccino
   - 1 latte
8. Barista starts preparing
9. Ready? → Hand to customer
```

**Key Point:**
- ✅ Order ID generated same as public orders
- ✅ Order number sequence same as public orders (#ORD-2024-0001, 0002, etc.)
- ✅ Only difference: `source: 'POS'` tag to identify origin

---

## API Endpoints

### 1. Create Order from POS

**Endpoint:** `POST /api/v1/orders/checkout-from-pos`

**Access:** Admin only (POS system)

**Description:** Create a complete order from POS with all details pre-configured by admin

**Request Body:**
```typescript
{
  // Business & Customer Info
  businessId: string;
  customerId?: string;           // Existing customer ID (optional)
  customerName?: string;         // New customer name (optional)
  customerPhone?: string;        // New customer phone (optional)

  // Order Items (with full admin control)
  items: [
    {
      productId: string;
      sizeId?: string | null;
      quantity: number;
      overridePrice?: number;    // Admin sets custom price if needed
      promotionType?: string;    // 'PERCENTAGE' | 'FIXED' | null
      promotionValue?: number;   // Discount amount/percentage
    }
  ];

  // Delivery Details
  deliveryOptionId: string;
  deliveryAddress: {
    village: string;
    commune: string;
    district: string;
    province: string;
    streetNumber: string;
    houseNumber: string;
    note?: string;
    latitude?: number;
    longitude?: number;
  };

  // Payment Details
  paymentMethodId: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';

  // Notes
  customerNote?: string;
  businessNote?: string;

  // Optional Adjustments
  discountAmount?: number;
  taxAmount?: number;
}
```

**Response:**
```typescript
{
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: 'CONFIRMED';      // Always CONFIRMED (ready for kitchen)
  source: 'POS';                 // Always 'POS' for this endpoint
  createdBy: string;             // Staff who created it
  createdAt: string;
}
```

**Status After Creation:**
- Order immediately becomes: `CONFIRMED` (ready to prepare)
- Staff verified all details at counter
- Kitchen immediately sees the order
- Proceeds to: `PREPARING` → `READY` → `IN_TRANSIT` → `COMPLETED`

---

### 2. Get All Orders (Admin)

**Endpoint:** `POST /api/v1/orders/all`

**Access:** Admin only

**Description:** Fetch all orders (both POS-created and customer-created) with filtering options

**Request Body:**
```typescript
{
  pageNo: number;
  pageSize: number;
  search?: string;           // Search by order number, customer name, etc.
  orderStatus?: string;      // Filter by status
  paymentStatus?: string;    // Filter by payment
  source?: 'POS' | 'PUBLIC'; // NEW: Filter by order source
}
```

**Response:**
```typescript
{
  pageNo: number;
  pageSize: number;
  totalElements: number;
  content: [
    {
      id: string;
      orderNumber: string;
      customerId: string;
      customerName: string;
      customerPhone: string;
      businessId: string;
      businessName: string;
      deliveryAddress: { ... };
      deliveryOption: { ... };
      orderStatus: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
      source: 'POS' | 'PUBLIC';    // NEW: Shows order origin
      customerNote: string;
      businessNote: string | null;
      pricing: {
        totalItems: number;
        subtotalBeforeDiscount: number;
        subtotal: number;
        totalDiscount: number;
        deliveryFee: number;
        taxAmount: number;
        finalTotal: number;
      };
      payment: {
        paymentMethod: string;
        paymentStatus: string;
      };
      items: [
        {
          id: string;
          product: { id, name, imageUrl, sizeId, sizeName, status };
          currentPrice: number;
          finalPrice: number;
          quantity: number;
          hasActivePromotion: boolean;
          promotionType: string | null;
          promotionValue: number | null;
        }
      ];
      statusHistory: [
        {
          id: string;
          statusName: string;
          statusDescription: string | null;
          note: string | null;
          changedBy: { userId, firstName, lastName, phoneNumber, businessId };
          changedAt: string;
        }
      ];
      createdAt: string;
      updatedAt: string;
      createdBy: string;
      updatedBy: string;
    }
  ];
}
```

**Key Field:** `source: 'POS' | 'PUBLIC'`
- Shows whether order was created from POS or by customer
- Helps admin identify order origin

---

### 3. Get Order by ID

**Endpoint:** `GET /api/v1/orders/{orderId}`

**Access:** Admin + Order owner

**Description:** Fetch complete order details

**Response:**
```typescript
// Same as order in list above
// Returns full OrderResponse with source field
```

**Returns all details including:**
- ✅ All items with pricing
- ✅ Delivery information
- ✅ Payment status
- ✅ Status history
- ✅ Source (POS vs PUBLIC)
- ✅ Created by/Updated by

---

### 4. Update Order Status

**Endpoint:** `PUT /api/v1/orders/{orderId}`

**Access:** Admin only

**Request Body:**
```typescript
{
  orderStatus?: string;         // Change status
  paymentStatus?: string;       // Update payment status
  businessNote?: string;        // Add admin notes
}
```

**Response:** Updated OrderResponse

---

### 5. Customer Update Own Order

**Endpoint:** `PUT /api/v1/orders/{orderId}`

**Access:** Order owner (customer) only

**Request Body:**
```typescript
{
  customerNote?: string;        // Can only update customer note
}
```

**Response:** Updated OrderResponse

---

## Order Source Field

**NEW: All orders now include `source` field**

```typescript
export enum OrderSource {
  PUBLIC = 'PUBLIC',  // Created by customer via website/app
  POS = 'POS',        // Created by admin via POS system
}
```

### Usage in Admin Dashboard:

```typescript
// Filter orders by source
const posOrders = orders.filter(o => o.source === 'POS');
const customerOrders = orders.filter(o => o.source === 'PUBLIC');

// Show different UI based on source
if (order.source === 'POS') {
  // Show POS admin info (who created, when, etc.)
  showAdminBadge(order.createdBy);
} else {
  // Show customer info
  showCustomerBadge(order.customerName);
}
```

---

## Frontend Hooks

### `usePOSCheckout()` - Create Orders

```typescript
const { createPOSOrder, isCreating, error } = usePOSCheckout();

// Create order
const order = await createPOSOrder({
  businessId: 'biz-123',
  customerName: 'Mr. Khmer',
  customerPhone: '012345678',
  items: [
    {
      productId: 'prod-1',
      quantity: 2,
      overridePrice: 5500,
      promotionType: 'PERCENTAGE',
      promotionValue: 10
    }
  ],
  deliveryOptionId: 'delivery-1',
  deliveryAddress: { ... },
  paymentMethodId: 'payment-1'
});

// order.source === 'POS'
// order.orderStatus === 'CONFIRMED' or 'PENDING'
```

---

## Status Workflow

### POS Order (Created via `/checkout-from-pos`)
```
PENDING or CONFIRMED (as configured in POS)
  ↓
PREPARING (admin starts preparing)
  ↓
READY (ready for pickup/delivery)
  ↓
IN_TRANSIT (delivery in progress)
  ↓
COMPLETED (delivered/completed)
```

### Customer Order (Created via `/checkout`)
```
PENDING (awaiting admin confirmation)
  ↓
CONFIRMED (admin confirmed)
  ↓
PREPARING → READY → IN_TRANSIT → COMPLETED
```

---

## Key Differences: POS vs Customer Orders

| Feature | POS Order | Customer Order |
|---------|-----------|----------------|
| **Created by** | Admin in POS | Customer online |
| **Source** | `'POS'` | `'PUBLIC'` |
| **Admin control** | Full (prices, promotions, etc.) | None |
| **Initial status** | Always `COMPLETED` | Always `PENDING` |
| **Order ID generation** | Same as customer orders | Same as POS orders |
| **Order number sequence** | Shared with customer orders | Shared with POS orders |
| **Creation endpoint** | `/checkout-from-pos` | `/checkout` |
| **Update endpoint** | Same `/orders/{id}` PUT | Same (notes only) |
| **Audit trail** | Admin who created | Customer who created |

---

## Database Changes Needed

### Order Table
- ✅ Add `source` column: `ENUM('POS', 'PUBLIC')`
- ✅ Add index on `source` for filtering
- All other fields unchanged

### No Separate Tables Needed
- Single order management endpoint handles both
- Differentiation via `source` field

---

## Implementation Summary

**What Changed:**
1. ✅ Added `source` field to all orders
2. ✅ One POS checkout endpoint: `/checkout-from-pos`
3. ✅ One order management endpoint (handles both POS and customer)
4. ✅ Removed complex update/confirm workflow
5. ✅ Simplified to CRUD operations

**What Stays:**
- ✅ Customer checkout endpoint: `/checkout`
- ✅ Order status workflow
- ✅ Admin order management
- ✅ Payment tracking
- ✅ Order history

**Result:**
- ✅ Cleaner, simpler API
- ✅ Easier to maintain
- ✅ Same powerful functionality
- ✅ Clear source tracking


---

## ⭐ Critical: ID & Number Generation

**POS and PUBLIC orders MUST use the SAME ID generation:**

```
Both use:
✅ Same UUID generation for order ID
✅ Same order number format: ORD-YYYYMMDD-XXXXXX
✅ Shared counter across all orders

Format Breakdown:
ORD-20260323-000001
├─ ORD = prefix
├─ 20260323 = date (YYYYMMDD)
└─ 000001 = sequence (auto-increment)

Example sequence (mixed, same day):
ORD-20260323-000001 ← PUBLIC (customer online)
ORD-20260323-000002 ← POS (from counter)
ORD-20260323-000003 ← PUBLIC (customer online)
ORD-20260323-000004 ← POS (from counter)

Next day:
ORD-20260324-000001 ← Sequence resets with new date
ORD-20260324-000002 ← PUBLIC

Only difference:
source: 'POS' or source: 'PUBLIC'
```

**NO separate ID prefixes**
- Use unified format: `ORD-YYYYMMDD-XXXXXX`
- Source field differentiates them

