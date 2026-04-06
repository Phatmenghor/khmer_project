# OrderFrom Implementation Guide

## Overview
The `orderFrom` field identifies whether an order was created from the **public checkout page (CUSTOMER)** or from the **admin/POS system (BUSINESS)**.

---

## Enum Definition

### Backend (Java)
```java
public enum OrderFromEnum {
    CUSTOMER("Customer"),      // Public checkout
    BUSINESS("Business");      // Admin/POS
}
```

### Frontend (TypeScript)
```typescript
export enum OrderFromEnum {
  CUSTOMER = 'CUSTOMER',
  BUSINESS = 'BUSINESS',
}
```

---

## Implementation Locations

### Admin Page (Create Order)
**File**: `src/app/(admin)/orders/create/page.tsx`

When creating an order from the admin panel:

```typescript
import { OrderFromEnum } from '@/enums/order.enum';

export default function AdminCreateOrderPage() {
  const handleCreateOrder = async (formData: any) => {
    const orderRequest = {
      customerId: formData.customerId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      deliveryAddressId: formData.deliveryAddressId,
      deliveryOptionId: formData.deliveryOptionId,
      customerNote: formData.customerNote,
      items: formData.items,
      orderFrom: OrderFromEnum.BUSINESS, // ★ Set to BUSINESS for admin orders
    };

    const response = await dispatch(createOrder(orderRequest)).unwrap();
    // Order created with orderFrom = BUSINESS
  };

  return (
    <div>
      {/* Order creation form */}
    </div>
  );
}
```

### Public Checkout Page
**File**: `src/app/(public)/checkout/page.tsx`

When creating an order from public checkout:

```typescript
import { OrderFromEnum } from '@/enums/order.enum';

export default function CheckoutPage() {
  const handlePlaceOrder = async (formData: any) => {
    const orderRequest = {
      customerId: user.id,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      deliveryAddressId: selectedAddress.id,
      deliveryOptionId: selectedOption.id,
      customerNote: formData.notes,
      items: cartItems.map(item => ({
        productId: item.productId,
        productSizeId: item.sizeId,
        quantity: item.quantity,
      })),
      orderFrom: OrderFromEnum.CUSTOMER, // ★ Set to CUSTOMER for checkout orders
    };

    const response = await dispatch(createOrder(orderRequest)).unwrap();
    // Order created with orderFrom = CUSTOMER
  };

  return (
    <div>
      {/* Checkout form */}
    </div>
  );
}
```

---

## Order Response Structure

All orders return with the orderFrom field set automatically:

```json
{
  "code": 0,
  "data": {
    "id": "...",
    "orderNumber": "ORD-20260403-WEB-0088",
    "orderFrom": "CUSTOMER",
    "customerId": "...",
    "customerName": "John Customer",
    "items": [...],
    "orderStatus": "PENDING",
    "pricing": {...},
    "payment": {...},
    "deviceInfo": {...}
  }
}
```

---

## Display Logic in Components

### Show Order Source Badge

```typescript
import { OrderFromEnum, OrderFromLabels, getOrderFromLabel } from '@/enums/order.enum';

export function OrderBadge({ order }: { order: Order }) {
  const isCustomer = order.orderFrom === OrderFromEnum.CUSTOMER;
  const bgColor = isCustomer ? 'bg-blue-100' : 'bg-orange-100';
  const textColor = isCustomer ? 'text-blue-800' : 'text-orange-800';

  return (
    <span className={`${bgColor} ${textColor} px-3 py-1 rounded-full text-sm`}>
      {getOrderFromLabel(order.orderFrom)}
    </span>
  );
}
```

### Conditional Styling Based on Source

```typescript
export function OrderCard({ order }: { order: OrderSummary }) {
  const isBusinessOrder = order.orderFrom === OrderFromEnum.BUSINESS;

  return (
    <div className={`order-card ${isBusinessOrder ? 'border-orange-300' : 'border-blue-300'}`}>
      <div className="flex justify-between items-center">
        <h3>{order.orderNumber}</h3>
        <OrderBadge order={order} />
      </div>
      <p className="text-gray-600">{order.customerName}</p>
      <p className="text-lg font-bold">${order.totalPrice}</p>
      {isBusinessOrder && (
        <div className="mt-2 bg-orange-50 p-2 rounded">
          <p className="text-sm font-semibold text-orange-800">Admin Order</p>
          <p className="text-xs text-orange-700">Created from POS System</p>
        </div>
      )}
    </div>
  );
}
```

### Filter Orders by Source

```typescript
import { isCustomerOrder, isBusinessOrder } from '@/enums/order.enum';

export function OrdersFilter() {
  const orders = useSelector(selectOrders);
  const [selectedSource, setSelectedSource] = useState<OrderFromEnum | 'ALL'>('ALL');

  const filteredOrders = useMemo(() => {
    if (selectedSource === 'ALL') return orders;
    return orders.filter(order => order.orderFrom === selectedSource);
  }, [orders, selectedSource]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSelectedSource('ALL')}
          className={selectedSource === 'ALL' ? 'active' : ''}
        >
          All Orders
        </button>
        <button
          onClick={() => setSelectedSource(OrderFromEnum.CUSTOMER)}
          className={selectedSource === OrderFromEnum.CUSTOMER ? 'active' : ''}
        >
          Customer Orders
        </button>
        <button
          onClick={() => setSelectedSource(OrderFromEnum.BUSINESS)}
          className={selectedSource === OrderFromEnum.BUSINESS ? 'active' : ''}
        >
          Business Orders
        </button>
      </div>

      {/* Orders list */}
      {filteredOrders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
```

---

## Differences Between CUSTOMER and BUSINESS Orders

| Aspect | CUSTOMER | BUSINESS |
|--------|----------|----------|
| **orderFrom** | CUSTOMER | BUSINESS |
| **orderNumber** | ORD-YYYYMMDD-WEB-#### | ORD-YYYYMMDD-POS-#### |
| **createdBy** | customer-user | admin-user / staff-user |
| **Source** | Public checkout page | Admin/POS system |
| **Device** | Mobile/Tablet | Desktop/POS Terminal |
| **Delivery Fee** | Applied (e.g., $2) | May be $0 (dine-in) |
| **isPriority** | false | true (usually) |
| **after pricing** | null | May have values if adjusted |
| **hadChangeFromPOS** | false | true (if changed) |

---

## Helper Functions

```typescript
import {
  isCustomerOrder,
  isBusinessOrder,
  getOrderFromLabel,
  getOrderStatusLabel,
  getOrderStatusColor,
} from '@/enums/order.enum';

// Usage:
if (isCustomerOrder(order)) {
  // Handle customer order from checkout
}

if (isBusinessOrder(order)) {
  // Handle business order from admin/POS
}

const label = getOrderFromLabel(order.orderFrom); // "Customer (Checkout)" or "Business (Admin/POS)"
const status = getOrderStatusLabel(order.orderStatus); // "Pending", "Completed", etc.
const color = getOrderStatusColor(order.orderStatus); // "yellow", "green", etc.
```

---

## Database Field

In the orders table, the `orderFrom` field should be stored as a VARCHAR or ENUM:

```sql
ALTER TABLE orders ADD COLUMN order_from VARCHAR(20) DEFAULT 'CUSTOMER';

-- Or using enum (preferred)
CREATE TYPE order_from_enum AS ENUM ('CUSTOMER', 'BUSINESS');
ALTER TABLE orders ADD COLUMN order_from order_from_enum DEFAULT 'CUSTOMER';
```

---

## API Endpoint Considerations

The order creation endpoint should:

1. **Automatically set orderFrom** based on the source:
   - If request comes from `/checkout` → CUSTOMER
   - If request comes from `/admin/orders` → BUSINESS

2. **Or accept orderFrom** in the request body and validate it

3. **Populate related fields** automatically:
   - createdBy (from authenticated user)
   - createdAt / updatedAt (system timestamp)
   - isPriority (true for BUSINESS orders)
   - deviceInfo (from request headers)

```java
@PostMapping("/orders")
public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
    @Valid @RequestBody CreateOrderRequest request,
    HttpServletRequest httpRequest) {
  
  // Determine orderFrom based on source
  OrderFromEnum orderFrom = request.getOrderFrom();
  
  // Set device info from request
  String userAgent = httpRequest.getHeader("User-Agent");
  DeviceInfo deviceInfo = parseDeviceInfo(userAgent, httpRequest.getRemoteAddr());
  
  // Create order
  Order order = orderService.createOrder(request, orderFrom, deviceInfo);
  
  return ResponseEntity.ok(ApiResponse.success("Order created", order));
}
```

---

## Testing

Use the provided generators to create test data:

```java
// Generate CUSTOMER order
Order customerOrder = OrderDataGenerator.generateCompleteOrder(OrderSource.CUSTOMER);

// Generate BUSINESS order
Order businessOrder = OrderDataGenerator.generateCompleteOrder(OrderSource.BUSINESS);
```

Or use the SQL test data file:
```bash
mysql -u user -p database < comprehensive-test-data.sql
```

---

## Summary

✅ **orderFrom field** clearly identifies order source  
✅ **CUSTOMER** = Public checkout page  
✅ **BUSINESS** = Admin/POS system  
✅ **All fields populated** - No null values  
✅ **Type-safe** enums and interfaces  
✅ **Helper functions** for UI logic  
✅ **Complete test data** available  

Both checkout and admin pages can now distinguish between customer orders and staff-created orders!
