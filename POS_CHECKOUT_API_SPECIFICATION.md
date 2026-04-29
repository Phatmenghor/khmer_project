# POS Checkout API Specification

## Endpoint
**POST** `/api/v1/orders/checkout-from-pos`

## Request Body Structure

### Complete Request Example
```json
{
  "businessId": "business-123",
  "deliveryAddress": {
    "village": "Village Name",
    "commune": "Commune Name",
    "district": "District Name",
    "province": "Province Name",
    "streetNumber": "123",
    "houseNumber": "House 45",
    "note": "Gate on left",
    "latitude": 11.5564,
    "longitude": 104.8282
  },
  "deliveryOption": {
    "name": "Delivery",
    "description": "Standard Delivery",
    "imageUrl": "https://...",
    "price": 5.00
  },
  "cart": {
    "businessId": "business-123",
    "businessName": "Business Name",
    "items": [
      {
        "productId": "product-1",
        "productName": "Product Name",
        "productImageUrl": "https://...",
        "productSizeId": "size-1",
        "sizeName": "Large",
        "quantity": 2,
        "customizations": [
          {
            "id": "custom-1",
            "productCustomizationId": "custom-1",
            "name": "Extra Cheese",
            "priceAdjustment": 2.50
          }
        ],
        "customizationIds": ["custom-1"],
        "finalPrice": 12.50,
        "totalPrice": 25.00,
        "sku": "SKU123",
        "barcode": "123456789"
      }
    ],
    "totalItems": 1,
    "totalQuantity": 2,
    "subtotal": 25.00,
    "customizationTotal": 5.00,
    "finalTotal": 35.00
  },
  "pricing": {
    "subtotal": 25.00,
    "customizationTotal": 5.00,
    "deliveryFee": 5.00,
    "taxPercentage": 10,
    "taxAmount": 3.50,
    "discountAmount": 0,
    "discountType": null,
    "discountReason": null,
    "finalTotal": 38.50
  },
  "payment": {
    "paymentMethod": "CASH",
    "paymentStatus": "PAID"
  },
  "orderStatus": "PENDING",
  "customerNote": "Please ring doorbell twice",
  "businessNote": "Created via POS System"
}
```

## Request Fields

### Root Level
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| businessId | string | Yes | Business ID for the order |
| deliveryAddress | object | No | Delivery address details |
| deliveryOption | object | Yes | Selected delivery option |
| cart | object | Yes | Cart items and totals |
| pricing | object | Yes | **CRITICAL: Complete pricing breakdown** |
| payment | object | Yes | Payment method and status |
| orderStatus | string | No | Order status (default: PENDING) |
| customerNote | string | No | Customer notes |
| businessNote | string | No | Business notes |

### Pricing Object (CRITICAL - ALL FIELDS MUST BE STORED)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subtotal | number | Yes | Sum of all product prices (before customizations and fees) |
| customizationTotal | number | Yes | Total cost of all add-ons/customizations |
| deliveryFee | number | Yes | Delivery cost |
| **taxPercentage** | number | Yes | **Tax percentage from business settings (e.g., 10 for 10%)** |
| **taxAmount** | number | Yes | **Calculated tax amount (subtotal * taxPercentage / 100)** |
| discountAmount | number | No | Order-level discount amount |
| discountType | string | No | Type of discount (fixed or percentage) |
| discountReason | string | No | Reason for discount |
| finalTotal | number | Yes | Final total after all adjustments |

### Cart Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| businessId | string | Yes | Business ID |
| businessName | string | No | Business name |
| items | array | Yes | Array of cart items |
| totalItems | number | Yes | Number of items in cart |
| totalQuantity | number | Yes | Total quantity (sum of all quantities) |
| subtotal | number | Yes | Sum of all item prices |
| customizationTotal | number | Yes | **Sum of all customization price adjustments** |
| finalTotal | number | Yes | Final cart total |

### Cart Item Object
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productId | string | Yes | Product ID |
| productName | string | No | Product name for display |
| productImageUrl | string | No | Product image URL |
| productSizeId | string | No | Selected size ID (null if no size) |
| sizeName | string | No | Size name for display |
| quantity | number | Yes | Item quantity |
| **customizations** | array | No | **Full customization objects with details** |
| customizationIds | array | No | Array of customization IDs |
| finalPrice | number | Yes | Price per unit including customizations |
| totalPrice | number | Yes | finalPrice * quantity |
| sku | string | No | Product SKU |
| barcode | string | No | Product barcode |

### Customization Object (in cart items)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Customization ID |
| productCustomizationId | string | Yes | Product customization ID |
| name | string | Yes | Customization name (e.g., "Extra Cheese") |
| priceAdjustment | number | Yes | Price adjustment amount |

## Response Structure

### Success Response (201)
```json
{
  "data": {
    "id": "order-123",
    "orderNumber": "POS-2024-001",
    "subtotal": 25.00,
    "customizationTotal": 5.00,
    "deliveryFee": 5.00,
    "taxPercentage": 10,
    "taxAmount": 3.50,
    "discountAmount": 0,
    "totalAmount": 38.50,
    "orderStatus": "PENDING",
    "source": "POS",
    "paymentMethod": "CASH",
    "paymentStatus": "PAID",
    "createdBy": "admin-user-123",
    "createdAt": "2024-04-29T10:30:00Z",
    "customerName": null,
    "customerPhone": null
  }
}
```

### Required Response Fields
| Field | Type | Description |
|-------|------|-------------|
| id | string | Order ID in database |
| orderNumber | string | Human-readable order number |
| subtotal | number | Order subtotal |
| customizationTotal | number | Total customization cost |
| deliveryFee | number | Delivery fee |
| **taxPercentage** | number | **Tax percentage that was applied** |
| **taxAmount** | number | **Actual tax amount calculated and stored** |
| discountAmount | number | Discount applied |
| totalAmount | number | Final order total |
| orderStatus | string | Order status |
| source | string | Should be "POS" |
| paymentMethod | string | Payment method |
| paymentStatus | string | Payment status |
| createdBy | string | User who created order |
| createdAt | string | Creation timestamp |

## Database Storage Requirements

### Order Table Should Store
- ✅ `taxPercentage` (from pricing.taxPercentage)
- ✅ `taxAmount` (from pricing.taxAmount)
- ✅ `customizationTotal` (from cart.customizationTotal)
- ✅ `subtotal` (from cart.subtotal)
- ✅ `deliveryFee` (from pricing.deliveryFee)
- ✅ `discountAmount` (from pricing.discountAmount)
- ✅ `discountType` (from pricing.discountType)
- ✅ `discountReason` (from pricing.discountReason)
- ✅ `finalTotal` (from pricing.finalTotal)
- ✅ `source` (should be "POS" for orders from POS system)

### Order Items Table Should Store
For each item in cart:
- ✅ `customizations` (full array of customization objects)
- ✅ `customizationIds` (array of IDs for quick lookup)
- ✅ `finalPrice` (includes customization adjustments)
- ✅ `totalPrice` (finalPrice * quantity)
- ✅ `sku`
- ✅ `barcode`

## Implementation Checklist for Backend

- [ ] Accept `taxPercentage` in pricing object
- [ ] Accept `taxAmount` in pricing object
- [ ] Accept `customizationTotal` in cart object
- [ ] Accept `customizations` array in cart items (with id, name, priceAdjustment)
- [ ] Store `taxPercentage` in orders table
- [ ] Store `taxAmount` in orders table
- [ ] Store `customizationTotal` in orders table
- [ ] Store full customization objects in order items
- [ ] Return `taxPercentage` in response
- [ ] Return `taxAmount` in response
- [ ] Return `customizationTotal` in response
- [ ] Validate that `taxAmount` = `subtotal * taxPercentage / 100`
- [ ] Validate that `finalTotal` includes all components (subtotal + delivery + tax - discount)
- [ ] Set `source` to "POS" for orders from this endpoint

## Notes
- Tax must be calculated and stored at time of order creation
- Business tax percentage is configured in business settings
- All monetary values should be stored as decimals with precision
- This is critical for financial reporting and audit trails
