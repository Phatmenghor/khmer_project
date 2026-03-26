# Order Update API Documentation

## Overview

This document describes the order update system that supports:
- **POS Updates** (Admin): Full control to update prices, quantities, and promotions
- **Public Updates** (Customer): Limited - can only update notes
- **Order Source Tracking**: Identifies whether order came from POS or Public
- **Update History**: Complete audit trail of all modifications
- **Confirmation Workflow**: When POS updates an order, it enters a confirmation state

---

## Order Source Enum

```typescript
export enum OrderSource {
  PUBLIC = 'PUBLIC',  // Customer order from website/app
  POS = 'POS',        // Admin order from POS system
}
```

---

## Order Status - New Status Added

```typescript
OrderStatus.PENDING_POS_CONFIRMATION = 'PENDING_POS_CONFIRMATION'
```

**When:** Order enters this status when admin updates items from POS and `shouldAutoConfirm` is false
**Description:** Admin made changes in POS, waiting for confirmation before proceeding
**Next States:** Can move to CONFIRMED or CANCELLED

---

## API Endpoints

### 1. Create Order from POS (Checkout)

**Endpoint:** `POST /api/v1/orders/checkout-from-pos`

**Access:** Admin only (POS)

**Description:** Create a complete new order from POS with full admin capabilities

**Request Body:**
```typescript
{
  businessId: string;
  customerId?: string;           // Optional - existing customer ID
  customerName?: string;         // Optional - new customer name
  customerPhone?: string;        // Optional - new customer phone
  items: [
    {
      productId: string;
      sizeId?: string | null;
      quantity: number;
      overridePrice?: number;    // Admin can set custom price
      promotionType?: string;    // 'PERCENTAGE' | 'FIXED' | null
      promotionValue?: number;   // Discount value
    }
  ];
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
  paymentMethodId: string;
  paymentStatus?: 'PENDING' | 'PAID' | 'UNPAID' | 'PARTIALLY_PAID';
  customerNote?: string;
  businessNote?: string;
  adminId?: string;              // Who created this order
  autoConfirmStatus?: boolean;   // Auto confirm to CONFIRMED (default: true)
  discountAmount?: number;       // Additional discount
  taxAmount?: number;            // Custom tax
}
```

**Response:**
```typescript
{
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  source: 'POS';
  createdBy: string;
  createdAt: string;
}
```

**Status:** Order automatically created with:
- `source: 'POS'` - Marked as POS order
- `status: 'CONFIRMED'` (if autoConfirmStatus: true) or `'PENDING'` (if false)

**Example:**
```typescript
const order = await createPOSOrder({
  businessId: 'biz-123',
  customerName: 'Mr. Khmer',
  customerPhone: '012345678',
  items: [
    {
      productId: 'prod-1',
      quantity: 2,
      overridePrice: 5500,      // Override product price
      promotionType: 'PERCENTAGE',
      promotionValue: 10        // 10% discount
    }
  ],
  deliveryOptionId: 'delivery-1',
  deliveryAddress: { ... },
  paymentMethodId: 'payment-1',
  autoConfirmStatus: true,      // Skip confirmation, go direct to CONFIRMED
});
// Order created as: POS → CONFIRMED → PREPARING → ...
```

---

### 2. Update Existing Order Items from POS

**Endpoint:** `POST /api/v1/orders/{orderId}/update-items`

**Access:** Admin only (POS)

**Request Body:**
```typescript
{
  orderId: string;
  itemUpdates: [
    {
      itemId: string;
      newPrice?: number;           // New unit price
      newQuantity?: number;        // New quantity
      newPromotionType?: string;   // 'PERCENTAGE' | 'FIXED' | null
      newPromotionValue?: number;  // Discount amount
      reason?: string;             // Why this item was changed
    }
  ];
  reason?: string;          // General reason for all changes
  shouldAutoConfirm?: boolean;  // If false, order goes to PENDING_POS_CONFIRMATION
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  order: OrderResponse;  // Updated order with new status
  updateHistory: {
    id: string;
    orderId: string;
    source: 'POS';
    totalItemsModified: number;
    itemUpdates: [
      {
        id: string;
        itemId: string;
        productName: string;
        changes: [
          {
            field: 'PRICE' | 'QUANTITY' | 'PROMOTION';
            beforeValue: unknown;
            afterValue: unknown;
            description: string;  // "Price changed from 5000 to 5500"
          }
        ];
        updatedBy: { userId, name, ... };
        updatedAt: string;
        reason?: string;
      }
    ];
    createdAt: string;
    requiresConfirmation: boolean;
  };
  requiresConfirmation: boolean;
  statusBefore: string;
  statusAfter: string;
}
```

**Status Changes:**
- If `shouldAutoConfirm === true`:
  - Status: PENDING → CONFIRMED (or current status)
  - Order proceeds normally

- If `shouldAutoConfirm === false` (default):
  - Status: Any → PENDING_POS_CONFIRMATION
  - Requires admin confirmation before proceeding

**Example:**
```typescript
const request: UpdateOrderFromPOSRequest = {
  orderId: 'order-123',
  itemUpdates: [
    {
      itemId: 'item-1',
      newPrice: 5500,           // Changed from 5000
      newQuantity: 2,           // Changed from 1
      reason: 'Price adjustment after negotiation'
    }
  ],
  shouldAutoConfirm: false,  // Will require confirmation
};

const response = await updateOrderFromPOSService(request);
// order.orderStatus === 'PENDING_POS_CONFIRMATION'
```

---

### 3. Confirm/Reject POS Changes to Existing Order

**Endpoint:** `POST /api/v1/orders/{orderId}/confirm-pos-changes`

**Access:** Admin only

**Request Body:**
```typescript
{
  orderId: string;
  confirmed: boolean;      // true to confirm, false to reject
  adminNote?: string;      // Note for confirmation/rejection
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  order: OrderResponse;    // Order with updated status
  confirmed: boolean;
  statusBefore: 'PENDING_POS_CONFIRMATION';
  statusAfter: 'CONFIRMED' | 'PENDING';  // Depends on confirmation
  confirmedAt: string;
  confirmedBy: {
    userId: string;
    name: string;
  };
}
```

**Status Changes:**
- If `confirmed === true`:
  - Status: PENDING_POS_CONFIRMATION → CONFIRMED

- If `confirmed === false`:
  - Status: PENDING_POS_CONFIRMATION → PENDING
  - Order returns to previous unconfirmed state

**Example:**
```typescript
// Admin reviews changes and confirms
const request: ConfirmPOSOrderChangesRequest = {
  orderId: 'order-123',
  confirmed: true,
  adminNote: 'Prices adjusted as agreed'
};

const response = await confirmPOSOrderChangesService(request);
// order.orderStatus === 'CONFIRMED'
```

---

### 4. Get Order Update History

**Endpoint:** `GET /api/v1/orders/{orderId}/update-history`

**Access:** Admin + Owner Customer

**Response:**
```typescript
{
  orderId: string;
  totalUpdates: number;
  updates: [
    {
      id: string;
      orderId: string;
      source: 'POS' | 'PUBLIC';
      totalItemsModified: number;
      itemUpdates: [
        {
          id: string;
          orderId: string;
          itemId: string;
          productId: string;
          productName: string;
          productImageUrl: string;
          sizeName: string | null;
          changes: [
            {
              field: 'PRICE' | 'QUANTITY' | 'PROMOTION' | 'ITEM_REMOVED' | 'ITEM_ADDED';
              beforeValue: unknown;
              afterValue: unknown;
              description: string;
            }
          ];
          updatedBy: {
            userId: string;
            firstName: string;
            lastName: string;
            phoneNumber?: string;
            businessId?: string;
          };
          updatedAt: string;
          reason?: string;
        }
      ];
      createdAt: string;
      requiresConfirmation: boolean;
      confirmedAt?: string;
      confirmedBy?: {
        userId: string;
        firstName: string;
        lastName: string;
      };
    }
  ];
}
```

**Example:**
```typescript
const history = await fetchOrderUpdateHistoryService('order-123');

history.updates.forEach(update => {
  console.log(`Update on ${update.createdAt} from ${update.source}`);
  console.log(`Items modified: ${update.totalItemsModified}`);

  update.itemUpdates.forEach(item => {
    console.log(`${item.productName}:`);
    item.changes.forEach(change => {
      console.log(`  ${change.description}`);
    });
  });
});
```

---

## Order Update History Type Structure

```typescript
interface OrderItemUpdateChange {
  field: 'PRICE' | 'QUANTITY' | 'PROMOTION' | 'ITEM_REMOVED' | 'ITEM_ADDED';
  beforeValue: unknown;
  afterValue: unknown;
  description: string;  // Human readable
}

interface OrderItemUpdateHistoryResponse {
  id: string;
  orderId: string;
  itemId: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  sizeName: string | null;
  changes: OrderItemUpdateChange[];
  updatedBy: UserInfo;
  updatedAt: string;
  reason?: string;
}

interface OrderUpdateHistoryResponse {
  id: string;
  orderId: string;
  source: 'POS' | 'PUBLIC';
  totalItemsModified: number;
  itemUpdates: OrderItemUpdateHistoryResponse[];
  createdAt: string;
  requiresConfirmation: boolean;
  confirmedAt?: string;
  confirmedBy?: UserInfo;
}
```

---

## Access Control

| Operation | POS (Admin) | Public (Customer) |
|-----------|------------|-------------------|
| Create order | ✅ Yes | ✅ Yes |
| Update prices | ✅ Yes | ❌ No |
| Update quantities | ✅ Yes | ❌ No |
| Update promotions | ✅ Yes | ❌ No |
| Update notes | ✅ Yes | ✅ Yes (own notes) |
| View update history | ✅ Yes | ✅ Yes (own order) |
| Confirm changes | ✅ Yes | ❌ No |

---

## Order Status Workflow

### POS Update Flow

```
PENDING
   ↓
[Admin updates items from POS with shouldAutoConfirm: false]
   ↓
PENDING_POS_CONFIRMATION
   ↓
[Admin confirms changes]
   ↓
CONFIRMED
   ↓
PREPARING → READY → IN_TRANSIT → COMPLETED
```

### POS Update (Auto-Confirm) Flow

```
PENDING
   ↓
[Admin updates items from POS with shouldAutoConfirm: true]
   ↓
CONFIRMED (or continues in current status)
   ↓
PREPARING → READY → IN_TRANSIT → COMPLETED
```

---

## Frontend Integration Examples

### Update Order from POS

```typescript
const dispatch = useAppDispatch();

const handleUpdateOrderFromPOS = async () => {
  const request: UpdateOrderFromPOSRequest = {
    orderId: 'order-123',
    itemUpdates: [
      {
        itemId: 'item-1',
        newPrice: 5500,
        newQuantity: 2,
        reason: 'Price adjustment'
      }
    ],
    shouldAutoConfirm: false,  // Requires confirmation
  };

  try {
    const response = await dispatch(updateOrderFromPOSService(request)).unwrap();
    console.log('Order updated:', response.order);

    if (response.requiresConfirmation) {
      showNotification('Order awaiting admin confirmation');
    }
  } catch (error) {
    showError('Failed to update order');
  }
};
```

### Confirm POS Changes

```typescript
const handleConfirmPOSChanges = async (orderId: string) => {
  const request: ConfirmPOSOrderChangesRequest = {
    orderId,
    confirmed: true,
    adminNote: 'Changes approved'
  };

  try {
    const response = await dispatch(confirmPOSOrderChangesService(request)).unwrap();
    showNotification(`Order confirmed and moved to ${response.statusAfter}`);
  } catch (error) {
    showError('Failed to confirm changes');
  }
};
```

### Display Update History

```typescript
const handleViewUpdateHistory = async (orderId: string) => {
  try {
    const history = await dispatch(fetchOrderUpdateHistoryService(orderId)).unwrap();

    history.updates.forEach(update => {
      console.log(`Source: ${update.source}`);
      console.log(`Created: ${update.createdAt}`);

      update.itemUpdates.forEach(item => {
        item.changes.forEach(change => {
          console.log(`${item.productName}: ${change.description}`);
        });
      });
    });
  } catch (error) {
    showError('Failed to load update history');
  }
};
```

---

## Key Features

### 1. Order Source Tracking
- Every order knows if it came from POS or Public
- Allows different handling and permissions

### 2. Complete Audit Trail
- Every update is recorded with:
  - What changed (field, before, after)
  - Who made the change
  - When the change was made
  - Why it was changed (reason)

### 3. Confirmation Workflow
- POS changes don't auto-apply to order status
- Admin must review and confirm
- Prevents accidental price/quantity changes

### 4. Flexible Update Options
- `shouldAutoConfirm`: Control whether order auto-confirms
- `reason` fields: Track why changes were made
- Supports partial updates (only update needed fields)

### 5. Access Control
- POS: Full update capabilities
- Public: Only notes and read-only history
- Enforced at API level

---

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "error": "Invalid update request",
  "message": "itemUpdates must not be empty"
}
```

**403 Forbidden:**
```json
{
  "error": "Access denied",
  "message": "Only POS admins can update item prices"
}
```

**404 Not Found:**
```json
{
  "error": "Order not found",
  "message": "Order with ID order-123 not found"
}
```

**409 Conflict:**
```json
{
  "error": "Invalid status transition",
  "message": "Cannot update items on completed orders"
}
```

---

## Best Practices

1. **Always provide reason:** Include a reason when updating items for audit trail
2. **Use shouldAutoConfirm wisely:** Set to `false` for significant changes requiring review
3. **Check update history:** Before confirming changes, review what was modified
4. **Handle confirmation state:** UI should prompt admin to confirm pending changes
5. **Validate permissions:** Frontend should only show POS update buttons to admins
6. **Track user info:** Always populate updatedBy with current admin info

