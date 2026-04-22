# 🎯 Complete Product JSON Examples - ALL Features Included

This shows the **full product structure** with all recommended features integrated.

---

## 1. COMPLETE PRODUCT - COFFEE SHOP

### Full Product with All Features
```json
{
  "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "name": "Iced Latte",
  "description": "Chilled latte with ice and milk",
  "price": 3.50,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": null,
  
  "category": {
    "id": "c1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
    "name": "Iced Beverages"
  },
  
  "subcategory": null,
  "brand": null,
  
  "tags": ["cold", "bestseller", "vegan", "new", "seasonal"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/iced-latte-1.jpg",
      "isPrimary": true,
      "altText": "Iced Latte in glass with ice"
    },
    {
      "id": "img2",
      "url": "https://cdn.example.com/iced-latte-2.jpg",
      "isPrimary": false,
      "altText": "Iced Latte with milk being poured"
    },
    {
      "id": "img3",
      "url": "https://cdn.example.com/iced-latte-3.jpg",
      "isPrimary": false,
      "altText": "Iced Latte on wooden table"
    }
  ],
  
  "rating": 4.8,
  "reviewCount": 145,
  "topReviews": [
    {
      "id": "rev1",
      "userId": "user-123",
      "userName": "John D.",
      "rating": 5,
      "title": "Best iced latte in town!",
      "comment": "Perfect balance of coffee and milk. Refreshing and smooth!",
      "createdAt": "2024-04-20T10:30:00Z",
      "verified": true,
      "helpful": 23,
      "images": [
        "https://cdn.example.com/review-img1.jpg"
      ]
    },
    {
      "id": "rev2",
      "userId": "user-456",
      "userName": "Sarah M.",
      "rating": 4,
      "title": "Great taste, a bit pricey",
      "comment": "Tastes amazing but wish it was a bit cheaper for the size",
      "createdAt": "2024-04-18T14:15:00Z",
      "verified": true,
      "helpful": 12,
      "images": []
    },
    {
      "id": "rev3",
      "userId": "user-789",
      "userName": "Mike K.",
      "rating": 5,
      "title": "Daily go-to drink",
      "comment": "I get this every morning. Never disappoints!",
      "createdAt": "2024-04-15T08:00:00Z",
      "verified": true,
      "helpful": 18,
      "images": []
    }
  ],
  
  "hasSizes": true,
  
  "promotionType": "PERCENTAGE",
  "promotionValue": 10.0,
  "promotionFromDate": "2024-04-01T00:00:00Z",
  "promotionToDate": "2024-04-30T23:59:59Z",
  "promotionActive": true,
  
  "stock": {
    "enabled": true,
    "status": "IN_STOCK",
    "totalQuantity": 150,
    "lowStockThreshold": 20,
    "isLowStock": false,
    "estimatedRestock": null
  },
  
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
      "finalPrice": 2.25,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 45,
        "status": "IN_STOCK"
      }
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
      "finalPrice": 3.15,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 75,
        "status": "IN_STOCK"
      }
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
      "finalPrice": 4.05,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 30,
        "status": "IN_STOCK"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o4",
      "name": "Croissant",
      "price": 2.00,
      "imageUrl": "https://cdn.example.com/croissant.jpg",
      "reason": "often-bought-together"
    },
    {
      "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o5",
      "name": "Cold Brew",
      "price": 3.00,
      "imageUrl": "https://cdn.example.com/cold-brew.jpg",
      "reason": "similar-category"
    }
  ],
  
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-04-22T10:30:00Z"
}
```

---

## 2. COMPLETE PRODUCT - RESTAURANT WITH BUNDLE

### Restaurant Main Dish Product
```json
{
  "id": "p2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
  "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
  "name": "Lok Lak",
  "description": "Cambodian stir-fried beef with lime dipping sauce, served with rice",
  "price": 6.50,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "category": {
    "id": "c2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Main Dishes"
  },
  
  "subcategory": {
    "id": "s1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
    "name": "Rice Dishes"
  },
  
  "brand": null,
  
  "tags": ["bestseller", "spicy", "gluten-free-option", "traditional"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/lok-lak-1.jpg",
      "isPrimary": true,
      "altText": "Lok Lak with rice and lime sauce"
    },
    {
      "id": "img2",
      "url": "https://cdn.example.com/lok-lak-2.jpg",
      "isPrimary": false,
      "altText": "Close-up of Lok Lak meat"
    }
  ],
  
  "rating": 4.9,
  "reviewCount": 234,
  "topReviews": [
    {
      "id": "rev1",
      "userId": "user-123",
      "userName": "Sokha T.",
      "rating": 5,
      "title": "Authentic Cambodian taste!",
      "comment": "Just like my grandmother used to make. Perfect spice level!",
      "createdAt": "2024-04-20T19:00:00Z",
      "verified": true,
      "helpful": 45,
      "images": ["https://cdn.example.com/review-lok-lak.jpg"]
    }
  ],
  
  "hasSizes": true,
  
  "promotionType": "FIXED_AMOUNT",
  "promotionValue": 1.00,
  "promotionFromDate": "2024-04-15T00:00:00Z",
  "promotionToDate": "2024-05-15T23:59:59Z",
  "promotionActive": true,
  
  "stock": {
    "enabled": true,
    "status": "IN_STOCK",
    "totalQuantity": 200,
    "lowStockThreshold": 30,
    "isLowStock": false,
    "estimatedRestock": null
  },
  
  "variants": [
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "name": "Beef - Mild",
      "price": 6.50,
      "sku": "LOKLAK-BEEF-MILD",
      "barcode": "323456789",
      "attributes": {
        "protein": "beef",
        "spiceLevel": "mild",
        "servingSize": "1 plate"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 1.00,
      "finalPrice": 5.50,
      "minimumStockLevel": 10,
      "stock": {
        "quantity": 75,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "name": "Beef - Medium",
      "price": 6.50,
      "sku": "LOKLAK-BEEF-MEDIUM",
      "barcode": "323456790",
      "attributes": {
        "protein": "beef",
        "spiceLevel": "medium",
        "servingSize": "1 plate"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 1.00,
      "finalPrice": 5.50,
      "minimumStockLevel": 10,
      "stock": {
        "quantity": 90,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "name": "Beef - Hot",
      "price": 6.50,
      "sku": "LOKLAK-BEEF-HOT",
      "barcode": "323456791",
      "attributes": {
        "protein": "beef",
        "spiceLevel": "hot",
        "servingSize": "1 plate"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 1.00,
      "finalPrice": 5.50,
      "minimumStockLevel": 10,
      "stock": {
        "quantity": 35,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o4",
      "name": "Chicken - Mild",
      "price": 5.50,
      "sku": "LOKLAK-CHICKEN-MILD",
      "barcode": "323456792",
      "attributes": {
        "protein": "chicken",
        "spiceLevel": "mild",
        "servingSize": "1 plate"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 1.00,
      "finalPrice": 4.50,
      "minimumStockLevel": 10,
      "stock": {
        "quantity": 60,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o5",
      "name": "Tofu - Vegan",
      "price": 4.50,
      "sku": "LOKLAK-TOFU-VEGAN",
      "barcode": "323456793",
      "attributes": {
        "protein": "tofu",
        "spiceLevel": "medium",
        "servingSize": "1 plate",
        "dietary": "vegan"
      },
      "promotionType": null,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 15,
        "status": "LOW_STOCK",
        "estimatedRestock": "2024-04-25T00:00:00Z"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6",
      "name": "Samlor Machu (Fish Soup)",
      "price": 5.00,
      "imageUrl": "https://cdn.example.com/samlor-machu.jpg",
      "reason": "often-bought-together"
    },
    {
      "id": "p2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o7",
      "name": "Iced Tea",
      "price": 1.50,
      "imageUrl": "https://cdn.example.com/iced-tea.jpg",
      "reason": "often-bought-together"
    }
  ],
  
  "createdAt": "2024-02-01T00:00:00Z",
  "updatedAt": "2024-04-22T12:00:00Z"
}
```

### Restaurant Bundle/Combo Product
```json
{
  "id": "bundle-1",
  "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
  "name": "Family Dinner (Serves 4)",
  "description": "Complete meal for family of 4. Includes 2 main dishes, spring rolls, and drinks",
  "type": "BUNDLE",
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "tags": ["family-deal", "popular", "value-for-money"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/family-dinner-bundle.jpg",
      "isPrimary": true,
      "altText": "Family Dinner Bundle display"
    }
  ],
  
  "bundlePrice": 24.99,
  "regularPrice": 28.50,
  "savingsAmount": 3.51,
  "savingsPercent": 12.3,
  
  "items": [
    {
      "productId": "p2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "productName": "Lok Lak",
      "variantId": "v3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "variantName": "Beef - Medium",
      "quantity": 2,
      "individualPrice": 6.50,
      "totalPrice": 13.00
    },
    {
      "productId": "p2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o8",
      "productName": "Spring Rolls",
      "variantId": "v4a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "variantName": "6 pieces",
      "quantity": 1,
      "individualPrice": 4.50,
      "totalPrice": 4.50
    },
    {
      "productId": "p2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o7",
      "productName": "Iced Tea",
      "variantId": "v5a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "variantName": "Large x4",
      "quantity": 1,
      "individualPrice": 6.00,
      "totalPrice": 6.00
    },
    {
      "productId": "p2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o9",
      "productName": "Dessert (Choice)",
      "variantId": null,
      "variantName": "Sticky Rice or Cake",
      "quantity": 1,
      "individualPrice": 3.50,
      "totalPrice": 3.50
    }
  ],
  
  "stock": {
    "enabled": true,
    "status": "IN_STOCK",
    "totalQuantity": 80,
    "lowStockThreshold": 15,
    "isLowStock": false
  },
  
  "rating": 4.9,
  "reviewCount": 156,
  
  "createdAt": "2024-02-15T00:00:00Z",
  "updatedAt": "2024-04-22T12:00:00Z"
}
```

---

## 3. COMPLETE PRODUCT - CLOTHING STORE

### Clothing Product with All Features
```json
{
  "id": "p4a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
  "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
  "name": "Classic Cotton T-Shirt",
  "description": "Comfortable 100% cotton t-shirt available in multiple colors and sizes. Perfect for everyday wear.",
  "price": 19.99,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "category": {
    "id": "c3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Apparel"
  },
  
  "subcategory": {
    "id": "s2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "T-Shirts"
  },
  
  "brand": {
    "id": "b1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Nike"
  },
  
  "tags": ["new-arrival", "bestseller", "on-sale", "eco-friendly", "cotton"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/tshirt-front.jpg",
      "isPrimary": true,
      "altText": "Classic T-Shirt front view"
    },
    {
      "id": "img2",
      "url": "https://cdn.example.com/tshirt-back.jpg",
      "isPrimary": false,
      "altText": "Classic T-Shirt back view"
    },
    {
      "id": "img3",
      "url": "https://cdn.example.com/tshirt-detail.jpg",
      "isPrimary": false,
      "altText": "Classic T-Shirt fabric detail"
    },
    {
      "id": "img4",
      "url": "https://cdn.example.com/tshirt-worn.jpg",
      "isPrimary": false,
      "altText": "Classic T-Shirt worn by model"
    }
  ],
  
  "rating": 4.7,
  "reviewCount": 892,
  "reviewBreakdown": {
    "5star": 650,
    "4star": 180,
    "3star": 45,
    "2star": 12,
    "1star": 5
  },
  "topReviews": [
    {
      "id": "rev1",
      "userId": "user-1001",
      "userName": "Emma R.",
      "rating": 5,
      "title": "Perfect fit and quality!",
      "comment": "Great material, true to size, and the colors are vibrant. Very happy with my purchase!",
      "createdAt": "2024-04-20T15:30:00Z",
      "verified": true,
      "helpful": 123,
      "images": ["https://cdn.example.com/review-tshirt-1.jpg", "https://cdn.example.com/review-tshirt-2.jpg"]
    },
    {
      "id": "rev2",
      "userId": "user-1002",
      "userName": "James L.",
      "rating": 4,
      "title": "Good quality, slightly pricey",
      "comment": "Really nice t-shirt but a bit more expensive than competitors. Still worth it for the quality.",
      "createdAt": "2024-04-18T10:15:00Z",
      "verified": true,
      "helpful": 67
    },
    {
      "id": "rev3",
      "userId": "user-1003",
      "userName": "Sofia P.",
      "rating": 5,
      "title": "My go-to t-shirt!",
      "comment": "Bought 3 different colors. Wear them all the time. Excellent durability.",
      "createdAt": "2024-04-15T18:45:00Z",
      "verified": true,
      "helpful": 98
    }
  ],
  
  "hasSizes": true,
  
  "promotionType": "FIXED_AMOUNT",
  "promotionValue": 2.00,
  "promotionFromDate": "2024-04-15T00:00:00Z",
  "promotionToDate": "2024-05-15T23:59:59Z",
  "promotionActive": true,
  
  "stock": {
    "enabled": true,
    "status": "IN_STOCK",
    "totalQuantity": 450,
    "lowStockThreshold": 30,
    "isLowStock": false,
    "estimatedRestock": null
  },
  
  "variants": [
    {
      "id": "v6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "name": "Red - Small",
      "price": 19.99,
      "sku": "TSHIRT-RED-S",
      "barcode": "423456789",
      "attributes": {
        "color": "Red",
        "size": "S",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "finalPrice": 17.99,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 28,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "name": "Red - Medium",
      "price": 19.99,
      "sku": "TSHIRT-RED-M",
      "barcode": "423456790",
      "attributes": {
        "color": "Red",
        "size": "M",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "finalPrice": 17.99,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 95,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "name": "Red - Large",
      "price": 19.99,
      "sku": "TSHIRT-RED-L",
      "barcode": "423456791",
      "attributes": {
        "color": "Red",
        "size": "L",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "finalPrice": 17.99,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 67,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o4",
      "name": "Blue - Small",
      "price": 19.99,
      "sku": "TSHIRT-BLUE-S",
      "barcode": "423456792",
      "attributes": {
        "color": "Blue",
        "size": "S",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "finalPrice": 17.99,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 18,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o5",
      "name": "Blue - Medium",
      "price": 19.99,
      "sku": "TSHIRT-BLUE-M",
      "barcode": "423456793",
      "attributes": {
        "color": "Blue",
        "size": "M",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "finalPrice": 17.99,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 142,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6",
      "name": "Blue - Large",
      "price": 19.99,
      "sku": "TSHIRT-BLUE-L",
      "barcode": "423456794",
      "attributes": {
        "color": "Blue",
        "size": "L",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "promotionType": "FIXED_AMOUNT",
      "promotionValue": 2.00,
      "finalPrice": 17.99,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 88,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o7",
      "name": "Black - Small",
      "price": 21.99,
      "sku": "TSHIRT-BLACK-S",
      "barcode": "423456795",
      "attributes": {
        "color": "Black",
        "size": "S",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "promotionType": null,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 5,
        "status": "LOW_STOCK",
        "estimatedRestock": "2024-04-28T00:00:00Z"
      }
    },
    {
      "id": "v6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o8",
      "name": "Black - Medium",
      "price": 21.99,
      "sku": "TSHIRT-BLACK-M",
      "barcode": "423456796",
      "attributes": {
        "color": "Black",
        "size": "M",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "promotionType": null,
      "minimumStockLevel": 5,
      "stock": {
        "quantity": 56,
        "status": "IN_STOCK"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p4a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "name": "Performance T-Shirt",
      "price": 24.99,
      "imageUrl": "https://cdn.example.com/performance-tshirt.jpg",
      "reason": "similar-category"
    },
    {
      "id": "p4a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "name": "Classic Shorts",
      "price": 29.99,
      "imageUrl": "https://cdn.example.com/shorts.jpg",
      "reason": "often-bought-together"
    },
    {
      "id": "p4a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o4",
      "name": "Basic Socks Pack",
      "price": 9.99,
      "imageUrl": "https://cdn.example.com/socks.jpg",
      "reason": "often-bought-together"
    }
  ],
  
  "createdAt": "2024-01-20T00:00:00Z",
  "updatedAt": "2024-04-22T14:30:00Z"
}
```

---

## 4. COMPLETE PRODUCT - ELECTRONICS

### Electronics Product
```json
{
  "id": "p5a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
  "businessId": "770cad56-cafd-4aba-baef-c4dcd53940d2",
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced camera system, A17 Pro chip, and stunning display. Available in multiple storage options.",
  "price": 999.99,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "category": {
    "id": "c4a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Phones"
  },
  
  "subcategory": {
    "id": "s3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "iPhones"
  },
  
  "brand": {
    "id": "b2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Apple"
  },
  
  "tags": ["flagship", "latest", "premium", "5g", "camera-pro"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/iphone15-front.jpg",
      "isPrimary": true,
      "altText": "iPhone 15 Pro front view - Space Black"
    },
    {
      "id": "img2",
      "url": "https://cdn.example.com/iphone15-back.jpg",
      "isPrimary": false,
      "altText": "iPhone 15 Pro back with camera system"
    },
    {
      "id": "img3",
      "url": "https://cdn.example.com/iphone15-side.jpg",
      "isPrimary": false,
      "altText": "iPhone 15 Pro side view showing titanium frame"
    },
    {
      "id": "img4",
      "url": "https://cdn.example.com/iphone15-specs.jpg",
      "isPrimary": false,
      "altText": "iPhone 15 Pro specifications view"
    }
  ],
  
  "rating": 4.8,
  "reviewCount": 1245,
  "reviewBreakdown": {
    "5star": 980,
    "4star": 210,
    "3star": 35,
    "2star": 15,
    "1star": 5
  },
  "topReviews": [
    {
      "id": "rev1",
      "userId": "user-2001",
      "userName": "Tech Lover",
      "rating": 5,
      "title": "Best iPhone ever!",
      "comment": "The camera system is incredible. The display is stunning. Worth every penny!",
      "createdAt": "2024-04-19T12:00:00Z",
      "verified": true,
      "helpful": 456
    },
    {
      "id": "rev2",
      "userId": "user-2002",
      "userName": "Alex K.",
      "rating": 4,
      "title": "Great phone, steep price",
      "comment": "Amazing features and performance but the price is quite high. Still satisfied though.",
      "createdAt": "2024-04-15T09:30:00Z",
      "verified": true,
      "helpful": 234
    }
  ],
  
  "hasSizes": true,
  
  "promotionType": null,
  "promotionValue": null,
  "promotionActive": false,
  
  "stock": {
    "enabled": true,
    "status": "IN_STOCK",
    "totalQuantity": 320,
    "lowStockThreshold": 50,
    "isLowStock": false,
    "estimatedRestock": null
  },
  
  "variants": [
    {
      "id": "v7a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "name": "128GB - Space Black",
      "price": 999.99,
      "sku": "IPH15PRO-128GB-BK",
      "barcode": "523456789",
      "attributes": {
        "storage": "128GB",
        "color": "Space Black",
        "processor": "A17 Pro",
        "display": "6.1 inch"
      },
      "promotionType": null,
      "minimumStockLevel": 10,
      "stock": {
        "quantity": 85,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v7a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "name": "256GB - Space Black",
      "price": 1099.99,
      "sku": "IPH15PRO-256GB-BK",
      "barcode": "523456790",
      "attributes": {
        "storage": "256GB",
        "color": "Space Black",
        "processor": "A17 Pro",
        "display": "6.1 inch"
      },
      "promotionType": null,
      "minimumStockLevel": 10,
      "stock": {
        "quantity": 102,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v7a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "name": "512GB - Gold",
      "price": 1299.99,
      "sku": "IPH15PRO-512GB-GOLD",
      "barcode": "523456791",
      "attributes": {
        "storage": "512GB",
        "color": "Gold",
        "processor": "A17 Pro",
        "display": "6.1 inch"
      },
      "promotionType": null,
      "minimumStockLevel": 10,
      "stock": {
        "quantity": 45,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v7a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o4",
      "name": "1TB - Silver",
      "price": 1399.99,
      "sku": "IPH15PRO-1TB-SILVER",
      "barcode": "523456792",
      "attributes": {
        "storage": "1TB",
        "color": "Silver",
        "processor": "A17 Pro",
        "display": "6.1 inch"
      },
      "promotionType": null,
      "minimumStockLevel": 10,
      "stock": {
        "quantity": 88,
        "status": "IN_STOCK"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p5a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "name": "iPhone 15 Pro Max",
      "price": 1099.99,
      "imageUrl": "https://cdn.example.com/iphone15-max.jpg",
      "reason": "similar-category"
    },
    {
      "id": "p5a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "name": "iPhone 15",
      "price": 799.99,
      "imageUrl": "https://cdn.example.com/iphone15.jpg",
      "reason": "similar-category"
    },
    {
      "id": "p5a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o4",
      "name": "Apple Phone Case",
      "price": 39.99,
      "imageUrl": "https://cdn.example.com/case.jpg",
      "reason": "often-bought-together"
    },
    {
      "id": "p5a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o5",
      "name": "Apple Screen Protector",
      "price": 29.99,
      "imageUrl": "https://cdn.example.com/protector.jpg",
      "reason": "often-bought-together"
    }
  ],
  
  "createdAt": "2024-01-10T00:00:00Z",
  "updatedAt": "2024-04-22T16:00:00Z"
}
```

---

## 5. COMPLETE PRODUCT - PHARMACY (NO VARIANTS)

### Pharmacy Product
```json
{
  "id": "p6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
  "businessId": "880cad56-cafd-4aba-baef-c4dcd53940d3",
  "name": "Aspirin 500mg",
  "description": "Effective pain reliever and fever reducer. Contains 100 tablets.",
  "price": 5.99,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "category": {
    "id": "c5a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Pain Relief"
  },
  
  "subcategory": null,
  
  "brand": {
    "id": "b3a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
    "name": "Aspirin"
  },
  
  "tags": ["pain-relief", "fever-reducer", "popular", "affordable"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/aspirin-500mg.jpg",
      "isPrimary": true,
      "altText": "Aspirin 500mg bottle"
    }
  ],
  
  "rating": 4.6,
  "reviewCount": 342,
  "topReviews": [
    {
      "id": "rev1",
      "userId": "user-3001",
      "userName": "Health Conscious",
      "rating": 5,
      "title": "Works great!",
      "comment": "Fast acting and effective. Great price for the quantity.",
      "createdAt": "2024-04-18T11:00:00Z",
      "verified": true,
      "helpful": 78
    }
  ],
  
  "hasSizes": false,
  
  "promotionType": null,
  "promotionValue": null,
  "promotionActive": false,
  
  "stock": {
    "enabled": true,
    "status": "IN_STOCK",
    "totalQuantity": 500,
    "lowStockThreshold": 50,
    "isLowStock": false,
    "estimatedRestock": null
  },
  
  "variants": [
    {
      "id": "v8a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o1",
      "name": "Default",
      "price": 5.99,
      "sku": "ASPIRIN-500MG-100",
      "barcode": "623456789",
      "attributes": {
        "strength": "500mg",
        "quantity": "100 tablets"
      },
      "promotionType": null,
      "minimumStockLevel": 20,
      "stock": {
        "quantity": 500,
        "status": "IN_STOCK"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "name": "Ibuprofen 200mg",
      "price": 6.99,
      "imageUrl": "https://cdn.example.com/ibuprofen.jpg",
      "reason": "similar-category"
    },
    {
      "id": "p6a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o3",
      "name": "Paracetamol 500mg",
      "price": 4.99,
      "imageUrl": "https://cdn.example.com/paracetamol.jpg",
      "reason": "similar-category"
    }
  ],
  
  "createdAt": "2024-01-05T00:00:00Z",
  "updatedAt": "2024-04-22T09:00:00Z"
}
```

---

## 6. FILTER/SEARCH FACETS RESPONSE

### How search results show facets
```json
{
  "query": "coffee",
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  
  "results": [
    {
      "id": "p1a2b3c4",
      "name": "Iced Latte",
      "price": 3.50,
      "rating": 4.8,
      "imageUrl": "...",
      "tags": ["cold", "bestseller"]
    },
    {
      "id": "p1a2b3c4",
      "name": "Espresso",
      "price": 2.50,
      "rating": 4.7,
      "imageUrl": "...",
      "tags": ["hot", "strong"]
    }
  ],
  
  "pagination": {
    "totalElements": 8,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 20
  },
  
  "facets": {
    "category": [
      {
        "id": "c1",
        "name": "Espresso Drinks",
        "count": 5,
        "selected": false
      },
      {
        "id": "c2",
        "name": "Iced Beverages",
        "count": 3,
        "selected": false
      }
    ],
    
    "tags": [
      {
        "name": "bestseller",
        "count": 6,
        "selected": false
      },
      {
        "name": "vegan",
        "count": 4,
        "selected": false
      },
      {
        "name": "cold",
        "count": 3,
        "selected": false
      },
      {
        "name": "hot",
        "count": 5,
        "selected": false
      }
    ],
    
    "priceRange": [
      {
        "label": "$0 - $3",
        "min": 0,
        "max": 3,
        "count": 4,
        "selected": false
      },
      {
        "label": "$3 - $5",
        "min": 3,
        "max": 5,
        "count": 4,
        "selected": false
      },
      {
        "label": "$5+",
        "min": 5,
        "max": 999,
        "count": 0,
        "selected": false
      }
    ],
    
    "rating": [
      {
        "label": "4+ stars",
        "minRating": 4,
        "count": 7,
        "selected": false
      },
      {
        "label": "3+ stars",
        "minRating": 3,
        "count": 8,
        "selected": false
      }
    ]
  }
}
```

---

## 7. COMPLETE CART WITH RECOMMENDED PRODUCTS

```json
{
  "cartId": "cart-550cad56",
  "userId": "user-550cad56",
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  
  "items": [
    {
      "id": "cart-item-1",
      "productId": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "productName": "Iced Latte",
      "productImageUrl": "https://cdn.example.com/iced-latte-1.jpg",
      "productRating": 4.8,
      "productTags": ["cold", "bestseller", "vegan"],
      "variantId": "v2a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o2",
      "variantName": "Medium",
      "quantity": 2,
      "currentPrice": 3.50,
      "finalPrice": 3.15,
      "totalPrice": 6.30,
      "hasPromotion": true,
      "promotionType": "PERCENTAGE",
      "promotionValue": 10.0,
      "attributes": {
        "size": "medium",
        "temperature": "cold",
        "volume": "16oz"
      }
    },
    {
      "id": "cart-item-2",
      "productId": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o4",
      "productName": "Croissant",
      "productImageUrl": "https://cdn.example.com/croissant.jpg",
      "productRating": 4.5,
      "productTags": ["pastry", "popular"],
      "variantId": null,
      "variantName": null,
      "quantity": 1,
      "currentPrice": 2.00,
      "finalPrice": 2.00,
      "totalPrice": 2.00,
      "hasPromotion": false,
      "attributes": {}
    }
  ],
  
  "subtotal": 8.30,
  "totalQuantity": 3,
  "discountAmount": 0.30,
  
  "recommendedProducts": [
    {
      "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o5",
      "name": "Cold Brew",
      "price": 3.00,
      "rating": 4.7,
      "imageUrl": "https://cdn.example.com/cold-brew.jpg",
      "reason": "similar-category",
      "reasonLabel": "Similar to what you selected"
    },
    {
      "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o6",
      "name": "Donut",
      "price": 1.50,
      "rating": 4.6,
      "imageUrl": "https://cdn.example.com/donut.jpg",
      "reason": "often-bought-together",
      "reasonLabel": "Frequently bought with Croissant"
    },
    {
      "id": "p1a2b3c4-d5e6-f7g8-h9i0-j1k2l3m4n5o7",
      "name": "Cappuccino",
      "price": 3.50,
      "rating": 4.8,
      "imageUrl": "https://cdn.example.com/cappuccino.jpg",
      "reason": "bestseller",
      "reasonLabel": "Our bestseller"
    }
  ],
  
  "createdAt": "2024-04-22T10:00:00Z",
  "updatedAt": "2024-04-22T10:30:00Z"
}
```

---

## ✅ SUMMARY - FEATURES INCLUDED IN ALL PRODUCTS

| Feature | Purpose | Included |
|---------|---------|:--------:|
| **Images** | Multiple photos for trust | ✅ |
| **Ratings & Reviews** | Social proof & feedback | ✅ |
| **Tags** | Easy filtering | ✅ |
| **Stock Management** | Inventory tracking | ✅ |
| **Promotions** | Discounts & offers | ✅ |
| **Variants** | Sizes, colors, options | ✅ |
| **Custom Attributes** | Flexible data (spice, storage, etc) | ✅ |
| **Related Products** | Recommendations | ✅ |
| **Bundles** | Combo products | ✅ (Restaurant) |
| **Category/Brand Hierarchy** | Organization | ✅ |
| **Low Stock Alerts** | Availability warnings | ✅ |
| **Visibility Controls** | Publish/hide timing | ✅ |

---

## 🎯 READY FOR IMPLEMENTATION

This JSON structure covers:
- ✅ All business types (Coffee, Restaurant, Clothing, Electronics, Pharmacy)
- ✅ All features (Images, Reviews, Tags, Stock, Promotions, Bundles, Recommendations)
- ✅ Dynamic attributes per business type
- ✅ Complete variant management
- ✅ Realistic data examples
- ✅ Search/filter capabilities

**Is this complete structure what you want to build?** 🚀
