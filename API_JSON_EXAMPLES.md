# Complete API JSON Examples - All Scenarios

## 1. BUSINESS SETTINGS (Determines what each business uses)

### Coffee Shop Settings
```json
{
  "id": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "businessName": "Phatmenghor Coffee",
  "logoBusinessUrl": "https://cdn.example.com/coffee-logo.jpg",
  "taxPercentage": 10.0,
  "primaryColor": "#57823D",
  "enableStock": "ENABLED",
  "contactAddress": "No. 123 Sihanouk Boulevard, Phnom Penh, Cambodia",
  "contactPhone": "+855 23 999 9999",
  "contactEmail": "info@phatmenghor.com",
  
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false,
  
  "businessHours": [
    {
      "id": "e1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6",
      "day": "MONDAY",
      "openingTime": "06:00",
      "closingTime": "22:00"
    },
    {
      "id": "e1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o7",
      "day": "TUESDAY",
      "openingTime": "06:00",
      "closingTime": "22:00"
    }
  ],
  
  "socialMedia": [
    {
      "id": "550cad56-cafd-4aba-baef-c4dcd53940f0",
      "name": "Facebook",
      "linkUrl": "https://facebook.com/phatmenghor"
    },
    {
      "id": "550cad56-cafd-4aba-baef-c4dcd53940f1",
      "name": "Instagram",
      "linkUrl": "https://instagram.com/phatmenghor_official"
    }
  ]
}
```

### Clothing Store Settings
```json
{
  "id": "660cad56-cafd-4aba-baef-c4dcd53940d1",
  "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
  "businessName": "Fashion Hub",
  "logoBusinessUrl": "https://cdn.example.com/fashion-logo.jpg",
  "taxPercentage": 5.0,
  "primaryColor": "#FF6B9D",
  "enableStock": "ENABLED",
  "contactAddress": "No. 456 Pub Street, Siem Reap, Cambodia",
  "contactPhone": "+855 63 888 8888",
  "contactEmail": "contact@fashionhub.com",
  
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true,
  
  "businessHours": [
    {
      "id": "e1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o8",
      "day": "MONDAY",
      "openingTime": "09:00",
      "closingTime": "21:00"
    }
  ],
  
  "socialMedia": [
    {
      "id": "660cad56-cafd-4aba-baef-c4dcd53940f0",
      "name": "Facebook",
      "linkUrl": "https://facebook.com/fashionhub"
    },
    {
      "id": "660cad56-cafd-4aba-baef-c4dcd53940f1",
      "name": "Instagram",
      "linkUrl": "https://instagram.com/fashionhub_official"
    }
  ]
}
```

---

## 2. CATEGORIES (Different by Business)

### Categories for Coffee Shop
```json
[
  {
    "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
    "name": "Espresso Drinks",
    "imageUrl": "https://cdn.example.com/espresso.jpg",
    "status": "ACTIVE"
  },
  {
    "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
    "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
    "name": "Iced Beverages",
    "imageUrl": "https://cdn.example.com/iced.jpg",
    "status": "ACTIVE"
  },
  {
    "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
    "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
    "name": "Pastries & Snacks",
    "imageUrl": "https://cdn.example.com/pastries.jpg",
    "status": "ACTIVE"
  }
]
```

### Categories for Clothing Store
```json
[
  {
    "id": "c2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
    "name": "Apparel",
    "imageUrl": "https://cdn.example.com/apparel.jpg",
    "status": "ACTIVE"
  },
  {
    "id": "c2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
    "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
    "name": "Footwear",
    "imageUrl": "https://cdn.example.com/shoes.jpg",
    "status": "ACTIVE"
  }
]
```

---

## 3. SUBCATEGORIES (Only if useSubcategories = true)

### Subcategories for Apparel
```json
[
  {
    "id": "s1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
    "categoryId": "c2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "T-Shirts",
    "imageUrl": "https://cdn.example.com/tshirts.jpg",
    "status": "ACTIVE"
  },
  {
    "id": "s1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
    "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
    "categoryId": "c2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Shirts & Blouses",
    "imageUrl": "https://cdn.example.com/shirts.jpg",
    "status": "ACTIVE"
  },
  {
    "id": "s1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
    "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
    "categoryId": "c2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Dresses",
    "imageUrl": "https://cdn.example.com/dresses.jpg",
    "status": "ACTIVE"
  }
]
```

---

## 4. BRANDS (Only if useBrands = true)

```json
[
  {
    "id": "b1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
    "name": "Nike",
    "imageUrl": "https://cdn.example.com/nike-logo.jpg",
    "description": "Athletic wear and footwear",
    "status": "ACTIVE"
  },
  {
    "id": "b1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
    "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
    "name": "Adidas",
    "imageUrl": "https://cdn.example.com/adidas-logo.jpg",
    "description": "Sports and lifestyle brand",
    "status": "ACTIVE"
  },
  {
    "id": "b1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
    "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
    "name": "Gucci",
    "imageUrl": "https://cdn.example.com/gucci-logo.jpg",
    "description": "Luxury fashion brand",
    "status": "ACTIVE"
  }
]
```

---

## 5. PRODUCTS - SCENARIO 1: Coffee Shop (Simple)

### Single Product with Variants (Sizes)
```json
{
  "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "name": "Espresso",
  "description": "Strong and bold single shot espresso",
  "price": 2.50,
  "status": "ACTIVE",
  
  "category": {
    "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Espresso Drinks",
    "imageUrl": "https://cdn.example.com/espresso.jpg"
  },
  
  "subcategory": null,
  "brand": null,
  
  "imageUrl": "https://cdn.example.com/espresso.jpg",
  "hasSizes": true,
  
  "promotionType": null,
  "promotionValue": null,
  
  "variants": [
    {
      "id": "v1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "name": "Single Shot",
      "price": 1.50,
      "sku": "ESP-SINGLE",
      "barcode": "123456789",
      "attributes": {
        "size": "single",
        "temperature": "hot"
      },
      "promotionType": null,
      "minimumStockLevel": 10
    },
    {
      "id": "v1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "name": "Double Shot",
      "price": 2.50,
      "sku": "ESP-DOUBLE",
      "barcode": "123456790",
      "attributes": {
        "size": "double",
        "temperature": "hot"
      },
      "promotionType": null,
      "minimumStockLevel": 10
    }
  ]
}
```

### Coffee with Multiple Variants
```json
{
  "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "name": "Iced Latte",
  "description": "Chilled latte with ice and milk",
  "price": 3.50,
  "status": "ACTIVE",
  
  "category": {
    "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
    "name": "Iced Beverages",
    "imageUrl": "https://cdn.example.com/iced.jpg"
  },
  
  "subcategory": null,
  "brand": null,
  
  "imageUrl": "https://cdn.example.com/iced-latte.jpg",
  "hasSizes": true,
  
  "promotionType": "PERCENTAGE",
  "promotionValue": 10.0,
  "promotionFromDate": "2024-04-01T00:00:00Z",
  "promotionToDate": "2024-04-30T23:59:59Z",
  
  "variants": [
    {
      "id": "v2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "name": "Small",
      "price": 2.50,
      "sku": "ILATTE-S",
      "barcode": "223456789",
      "attributes": {
        "size": "small",
        "temperature": "cold",
        "volume": "12oz"
      },
      "promotionType": "PERCENTAGE",
      "promotionValue": 10.0,
      "minimumStockLevel": 5
    },
    {
      "id": "v2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "name": "Medium",
      "price": 3.50,
      "sku": "ILATTE-M",
      "barcode": "223456790",
      "attributes": {
        "size": "medium",
        "temperature": "cold",
        "volume": "16oz"
      },
      "promotionType": "PERCENTAGE",
      "promotionValue": 10.0,
      "minimumStockLevel": 5
    },
    {
      "id": "v2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "name": "Large",
      "price": 4.50,
      "sku": "ILATTE-L",
      "barcode": "223456791",
      "attributes": {
        "size": "large",
        "temperature": "cold",
        "volume": "20oz"
      },
      "promotionType": "PERCENTAGE",
      "promotionValue": 10.0,
      "minimumStockLevel": 5
    }
  ]
}
```

---

## 6. PRODUCTS - SCENARIO 2: Clothing Store (Complex)

### T-Shirt with Multiple Attributes
```json
{
  "id": "p2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
  "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
  "name": "Classic Cotton T-Shirt",
  "description": "Comfortable 100% cotton t-shirt available in multiple colors and sizes",
  "price": 19.99,
  "status": "ACTIVE",
  
  "category": {
    "id": "c2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Apparel",
    "imageUrl": "https://cdn.example.com/apparel.jpg"
  },
  
  "subcategory": {
    "id": "s1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "T-Shirts",
    "imageUrl": "https://cdn.example.com/tshirts.jpg"
  },
  
  "brand": {
    "id": "b1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Nike",
    "imageUrl": "https://cdn.example.com/nike-logo.jpg"
  },
  
  "imageUrl": "https://cdn.example.com/tshirt-classic.jpg",
  "hasSizes": true,
  
  "promotionType": "FIXED_AMOUNT",
  "promotionValue": 2.00,
  "promotionFromDate": "2024-04-15T00:00:00Z",
  "promotionToDate": "2024-05-15T23:59:59Z",
  
  "variants": [
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "name": "Red - Small",
      "price": 19.99,
      "sku": "TSHIRT-RED-S",
      "barcode": "323456789",
      "attributes": {
        "color": "Red",
        "size": "S",
        "material": "100% Cotton"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "minimumStockLevel": 10
    },
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "name": "Red - Medium",
      "price": 19.99,
      "sku": "TSHIRT-RED-M",
      "barcode": "323456790",
      "attributes": {
        "color": "Red",
        "size": "M",
        "material": "100% Cotton"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "minimumStockLevel": 10
    },
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "name": "Red - Large",
      "price": 19.99,
      "sku": "TSHIRT-RED-L",
      "barcode": "323456791",
      "attributes": {
        "color": "Red",
        "size": "L",
        "material": "100% Cotton"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "minimumStockLevel": 10
    },
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o4",
      "name": "Blue - Small",
      "price": 19.99,
      "sku": "TSHIRT-BLUE-S",
      "barcode": "323456792",
      "attributes": {
        "color": "Blue",
        "size": "S",
        "material": "100% Cotton"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "minimumStockLevel": 10
    },
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o5",
      "name": "Blue - Medium",
      "price": 19.99,
      "sku": "TSHIRT-BLUE-M",
      "barcode": "323456793",
      "attributes": {
        "color": "Blue",
        "size": "M",
        "material": "100% Cotton"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "minimumStockLevel": 10
    },
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6",
      "name": "Black - Small",
      "price": 21.99,
      "sku": "TSHIRT-BLACK-S",
      "barcode": "323456794",
      "attributes": {
        "color": "Black",
        "size": "S",
        "material": "100% Cotton"
      },
      "promotionType": null,
      "minimumStockLevel": 8
    }
  ]
}
```

---

## 7. CART ITEMS (Different Products)

```json
{
  "id": "cart-550cad56-cafd-4aba",
  "userId": "user-550cad56-cafd-4aba",
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "items": [
    {
      "id": "cart-item-1",
      "productId": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "productName": "Espresso",
      "productImageUrl": "https://cdn.example.com/espresso.jpg",
      "sizeName": "Double Shot",
      "productSizeId": "v1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "quantity": 2,
      "currentPrice": 2.50,
      "finalPrice": 2.50,
      "totalPrice": 5.00,
      "hasPromotion": false,
      "promotionType": null,
      "promotionValue": null,
      "attributes": {
        "size": "double",
        "temperature": "hot"
      }
    },
    {
      "id": "cart-item-2",
      "productId": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "productName": "Iced Latte",
      "productImageUrl": "https://cdn.example.com/iced-latte.jpg",
      "sizeName": "Large",
      "productSizeId": "v2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "quantity": 1,
      "currentPrice": 4.50,
      "finalPrice": 4.05,
      "totalPrice": 4.05,
      "hasPromotion": true,
      "promotionType": "PERCENTAGE",
      "promotionValue": 10.0,
      "attributes": {
        "size": "large",
        "temperature": "cold",
        "volume": "20oz"
      }
    }
  ],
  "subtotal": 9.05,
  "totalQuantity": 3,
  "createdAt": "2024-04-22T10:30:00Z",
  "updatedAt": "2024-04-22T10:30:00Z"
}
```

---

## 8. CHECKOUT REQUEST & RESPONSE

### Checkout Request
```json
{
  "selectedAddressId": "addr-550cad56-cafd-4aba",
  "selectedDeliveryOptionId": "delivery-1",
  "selectedPaymentOptionId": "payment-1",
  "customerNote": "Please ring the bell twice"
}
```

### Order Response (After Checkout)
```json
{
  "id": "order-550cad56-cafd-4aba-baef",
  "orderNumber": "ORD-2024-00001",
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "customerId": "user-550cad56-cafd-4aba",
  "orderStatus": {
    "name": "PENDING",
    "description": "Order received, waiting for confirmation"
  },
  
  "pricing": {
    "subtotal": 9.05,
    "discountAmount": 0.45,
    "deliveryFee": 2.50,
    "tax": 0.90,
    "finalTotal": 12.00
  },
  
  "delivery": {
    "address": {
      "id": "addr-550cad56-cafd-4aba",
      "streetNumber": "123",
      "houseNumber": "A",
      "village": "Boeung Keng Kang I",
      "commune": "Chamkar Mon",
      "district": "Daun Penh",
      "province": "Phnom Penh",
      "fullAddress": "123A Sihanouk Boulevard, Boeung Keng Kang I, Chamkar Mon, Daun Penh, Phnom Penh"
    },
    "deliveryOption": {
      "id": "delivery-1",
      "name": "Standard Delivery",
      "price": 2.50,
      "estimatedTime": "30-45 minutes"
    }
  },
  
  "payment": {
    "paymentMethod": "CASH_ON_DELIVERY",
    "paymentStatus": "PENDING"
  },
  
  "items": [
    {
      "id": "order-item-1",
      "productId": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "productName": "Espresso",
      "productImageUrl": "https://cdn.example.com/espresso.jpg",
      "productSizeId": "v1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "sizeName": "Double Shot",
      "quantity": 2,
      "currentPrice": 2.50,
      "finalPrice": 2.50,
      "totalPrice": 5.00,
      "hasPromotion": false,
      "sku": "ESP-DOUBLE",
      "barcode": "123456790",
      "attributes": {
        "size": "double",
        "temperature": "hot"
      }
    },
    {
      "id": "order-item-2",
      "productId": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "productName": "Iced Latte",
      "productImageUrl": "https://cdn.example.com/iced-latte.jpg",
      "productSizeId": "v2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "sizeName": "Large",
      "quantity": 1,
      "currentPrice": 4.50,
      "finalPrice": 4.05,
      "totalPrice": 4.05,
      "hasPromotion": true,
      "promotionType": "PERCENTAGE",
      "promotionValue": 10.0,
      "sku": "ILATTE-L",
      "barcode": "223456791",
      "attributes": {
        "size": "large",
        "temperature": "cold",
        "volume": "20oz"
      }
    }
  ],
  
  "customerNote": "Please ring the bell twice",
  "orderFrom": "CUSTOMER",
  
  "createdAt": "2024-04-22T10:35:00Z",
  "updatedAt": "2024-04-22T10:35:00Z"
}
```

---

## 9. CATEGORIES LIST RESPONSE

```json
{
  "content": [
    {
      "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Espresso Drinks",
      "imageUrl": "https://cdn.example.com/espresso.jpg",
      "status": "ACTIVE",
      "productCount": 5
    },
    {
      "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Iced Beverages",
      "imageUrl": "https://cdn.example.com/iced.jpg",
      "status": "ACTIVE",
      "productCount": 3
    }
  ],
  "pagination": {
    "totalElements": 2,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 10. PRODUCTS LIST BY CATEGORY

```json
{
  "content": [
    {
      "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Espresso",
      "description": "Strong and bold single shot espresso",
      "price": 2.50,
      "status": "ACTIVE",
      "category": {
        "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
        "name": "Espresso Drinks"
      },
      "subcategory": null,
      "brand": null,
      "imageUrl": "https://cdn.example.com/espresso.jpg",
      "hasSizes": true,
      "promotionType": null,
      "hasPromotion": false,
      "variantCount": 2,
      "rating": 4.8,
      "reviewCount": 45
    },
    {
      "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Americano",
      "description": "Espresso diluted with hot water",
      "price": 2.00,
      "status": "ACTIVE",
      "category": {
        "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
        "name": "Espresso Drinks"
      },
      "subcategory": null,
      "brand": null,
      "imageUrl": "https://cdn.example.com/americano.jpg",
      "hasSizes": true,
      "promotionType": "PERCENTAGE",
      "promotionValue": 15.0,
      "hasPromotion": true,
      "variantCount": 2,
      "rating": 4.5,
      "reviewCount": 32
    }
  ],
  "pagination": {
    "totalElements": 5,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 11. BRANDS LIST RESPONSE

```json
{
  "content": [
    {
      "id": "b1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
      "name": "Nike",
      "imageUrl": "https://cdn.example.com/nike-logo.jpg",
      "description": "Athletic wear and footwear",
      "status": "ACTIVE",
      "productCount": 25
    },
    {
      "id": "b1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
      "name": "Adidas",
      "imageUrl": "https://cdn.example.com/adidas-logo.jpg",
      "description": "Sports and lifestyle brand",
      "status": "ACTIVE",
      "productCount": 18
    }
  ],
  "pagination": {
    "totalElements": 3,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 12. DELIVERY OPTIONS

```json
{
  "content": [
    {
      "id": "delivery-1",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Standard Delivery",
      "description": "Regular delivery service",
      "price": 2.50,
      "estimatedDeliveryTime": "30-45 minutes",
      "status": "ACTIVE"
    },
    {
      "id": "delivery-2",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Express Delivery",
      "description": "Fast delivery service",
      "price": 5.00,
      "estimatedDeliveryTime": "15-20 minutes",
      "status": "ACTIVE"
    },
    {
      "id": "delivery-3",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Pickup",
      "description": "Pickup from store",
      "price": 0.00,
      "estimatedDeliveryTime": "Ready in 10 minutes",
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "totalElements": 3,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 13. PAYMENT OPTIONS

```json
{
  "content": [
    {
      "id": "payment-1",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Cash on Delivery",
      "paymentOptionType": "CASH_ON_DELIVERY",
      "description": "Pay when your order arrives",
      "status": "ACTIVE"
    },
    {
      "id": "payment-2",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Mobile Money",
      "paymentOptionType": "MOBILE_MONEY",
      "description": "Pay using mobile money service",
      "status": "ACTIVE"
    },
    {
      "id": "payment-3",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Bank Transfer",
      "paymentOptionType": "BANK_TRANSFER",
      "description": "Direct bank transfer",
      "status": "ACTIVE"
    },
    {
      "id": "payment-4",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "name": "Credit Card",
      "paymentOptionType": "CREDIT_CARD",
      "description": "Pay using credit or debit card",
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "totalElements": 4,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 14. USER LOCATIONS (ADDRESSES)

```json
{
  "content": [
    {
      "id": "addr-550cad56-cafd-4aba",
      "userId": "user-550cad56-cafd-4aba",
      "village": "Boeung Keng Kang I",
      "commune": "Chamkar Mon",
      "district": "Daun Penh",
      "province": "Phnom Penh",
      "streetNumber": "123",
      "houseNumber": "A",
      "note": "Near the blue gate",
      "latitude": 11.5564,
      "longitude": 104.9282,
      "fullAddress": "123A Sihanouk Boulevard, Boeung Keng Kang I, Chamkar Mon, Daun Penh, Phnom Penh",
      "isDefault": true,
      "createdAt": "2024-04-01T10:00:00Z"
    },
    {
      "id": "addr-550cad56-cafd-4abb",
      "userId": "user-550cad56-cafd-4aba",
      "village": "Boeung Salang",
      "commune": "Toul Kork",
      "district": "Chamkar Mon",
      "province": "Phnom Penh",
      "streetNumber": "456",
      "houseNumber": "B",
      "note": "Office location",
      "latitude": 11.5620,
      "longitude": 104.9320,
      "fullAddress": "456B Norodom Boulevard, Boeung Salang, Toul Kork, Chamkar Mon, Phnom Penh",
      "isDefault": false,
      "createdAt": "2024-04-10T14:30:00Z"
    }
  ],
  "pagination": {
    "totalElements": 2,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 15. USER PROFILE (WITH BUSINESS MODAL)

```json
{
  "id": "user-550cad56-cafd-4aba",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+855 12 345 678",
  "profileImageUrl": "https://cdn.example.com/profile.jpg",
  "dateOfBirth": "1990-05-15",
  "status": "ACTIVE",
  
  "userBusinesses": [
    {
      "id": "ub1",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "businessName": "Phatmenghor Coffee",
      "businessLogo": "https://cdn.example.com/coffee-logo.jpg",
      "userRole": "OWNER",
      "joinedDate": "2024-01-15",
      "status": "ACTIVE"
    },
    {
      "id": "ub2",
      "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
      "businessName": "Fashion Hub",
      "businessLogo": "https://cdn.example.com/fashion-logo.jpg",
      "userRole": "MANAGER",
      "joinedDate": "2024-03-01",
      "status": "ACTIVE"
    }
  ]
}
```

---

## 16. ADMIN DASHBOARD - BUSINESS SETTINGS FORM

```json
{
  "id": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "businessName": "Phatmenghor Coffee",
  "logoBusinessUrl": "https://cdn.example.com/coffee-logo.jpg",
  "taxPercentage": 10.0,
  "primaryColor": "#57823D",
  "enableStock": "ENABLED",
  "contactAddress": "No. 123 Sihanouk Boulevard, Phnom Penh, Cambodia",
  "contactPhone": "+855 23 999 9999",
  "contactEmail": "info@phatmenghor.com",
  
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false,
  
  "businessHours": [
    {
      "id": "e1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6",
      "day": "MONDAY",
      "openingTime": "06:00",
      "closingTime": "22:00"
    },
    {
      "id": "e1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o7",
      "day": "TUESDAY",
      "openingTime": "06:00",
      "closingTime": "22:00"
    }
  ],
  
  "socialMedia": [
    {
      "id": "550cad56-cafd-4aba-baef-c4dcd53940f0",
      "name": "Facebook",
      "linkUrl": "https://facebook.com/phatmenghor"
    },
    {
      "id": "550cad56-cafd-4aba-baef-c4dcd53940f1",
      "name": "Instagram",
      "linkUrl": "https://instagram.com/phatmenghor_official"
    },
    {
      "id": "550cad56-cafd-4aba-baef-c4dcd53940f2",
      "name": "Telegram",
      "linkUrl": "https://t.me/phatmenghor"
    }
  ]
}
```

---

## 17. SEARCH RESULTS (Products by Keyword)

```json
{
  "content": [
    {
      "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "businessName": "Phatmenghor Coffee",
      "name": "Espresso",
      "description": "Strong and bold single shot espresso",
      "price": 2.50,
      "imageUrl": "https://cdn.example.com/espresso.jpg",
      "category": "Espresso Drinks",
      "brand": null,
      "rating": 4.8,
      "reviewCount": 45,
      "matchRelevance": 100
    },
    {
      "id": "p3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
      "businessName": "Fashion Hub",
      "name": "Espresso Brown T-Shirt",
      "description": "Premium cotton t-shirt in espresso brown color",
      "price": 25.00,
      "imageUrl": "https://cdn.example.com/brown-tshirt.jpg",
      "category": "Apparel",
      "brand": "Nike",
      "rating": 4.5,
      "reviewCount": 28,
      "matchRelevance": 75
    }
  ],
  "pagination": {
    "totalElements": 2,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

## 18. BANNERS

```json
{
  "content": [
    {
      "id": "banner-1",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "imageUrl": "https://cdn.example.com/banner-spring-sale.jpg",
      "status": "ACTIVE",
      "createdAt": "2024-04-01T00:00:00Z"
    },
    {
      "id": "banner-2",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "imageUrl": "https://cdn.example.com/banner-new-drinks.jpg",
      "status": "ACTIVE",
      "createdAt": "2024-04-10T00:00:00Z"
    },
    {
      "id": "banner-3",
      "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
      "imageUrl": "https://cdn.example.com/banner-loyalty.jpg",
      "status": "INACTIVE",
      "createdAt": "2024-03-15T00:00:00Z"
    }
  ],
  "pagination": {
    "totalElements": 3,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

---

This covers all scenarios for your website! You can now see:
- ✅ Simple coffee shop setup
- ✅ Complex clothing store with all attributes
- ✅ Flexible variant system
- ✅ Checkout flow
- ✅ Admin settings
- ✅ All API responses

**Would you like me to:**
1. Create actual TypeScript interfaces for these?
2. Generate SQL INSERT statements for test data?
3. Create API endpoint examples?
