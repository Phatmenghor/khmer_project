# 🚀 Complete E-Commerce Platform Guide - All Business Types & Implementation

This is the **single comprehensive guide** for building a flexible e-commerce system that supports ANY business type with complete JSON examples, requirements, architecture, and implementation details.

---

## 📑 Table of Contents

1. [System Overview](#-system-overview)
2. [All Business Types](#-all-business-types--7-complete-scenarios)
3. [Complete JSON Examples](#-complete-json-examples-for-all-business-types)
4. [Feature Visibility Control](#-feature-visibility-control---where-to-hidshow)
5. [System Architecture](#-system-architecture)
6. [Database Schema](#-database-schema)
7. [Changes Needed](#-changes-needed-from-current-code)
8. [API Endpoints](#-api-endpoints)
9. [Implementation Timeline](#-implementation-timeline)

---

## 🎯 System Overview

### What We're Building
A **single flexible e-commerce platform** that serves ANY business type without location complexity:
- ☕ Coffee shops (categories only, sizes)
- 🍽️ Restaurants (categories + subcategories, custom attributes)
- 👗 Clothing stores (full hierarchy with brands)
- 💻 Electronics (brand-focused)
- 💊 Pharmacies (brands, no variants)
- 🛒 Grocery stores (categories only, simple)
- 🚗 Car rentals (brands only, no categories)

### Core Philosophy
**One code base. Multiple business types. Zero code changes needed.**

Each business toggles features ON/OFF via `BusinessSettings` flags:
```
useCategories: true/false
useSubcategories: true/false  
useBrands: true/false
useVariants: true/false
```

---

## 📊 All Business Types – 7 Complete Scenarios

### 1️⃣ COFFEE SHOP ☕
**Configuration:**
```json
{
  "businessName": "Phatmenghor Coffee",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false,
  "structure": "Category → Product → Variants"
}
```

**What They Need:**
```
✅ Categories (Espresso Drinks, Iced Beverages, Pastries)
❌ Subcategories (hidden)
❌ Brands (hidden)
✅ Variants (Small, Medium, Large)
✅ Custom Attributes (size, temperature)

Product Example:
├─ Iced Latte
│  ├─ Small - $2.50 {size: "small"}
│  ├─ Medium - $3.50 {size: "medium"}
│  └─ Large - $4.50 {size: "large"}
```

**Customer View:**
Shows: Categories → Products → Size Selection
Hides: Brands, Subcategories

---

### 2️⃣ RESTAURANT 🍽️
**Configuration:**
```json
{
  "businessName": "Khmer Kitchen Restaurant",
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": false,
  "structure": "Category → Subcategory → Product → Variants"
}
```

**What They Need:**
```
✅ Categories (Main Dishes, Beverages, Desserts)
✅ Subcategories (Soups, Rice Dishes, Noodles)
❌ Brands (hidden)
✅ Variants (Protein type, Spice level)
✅ Custom Attributes (protein, spice, extras)

Product Example:
├─ Lok Lak (Main > Rice Dishes)
│  ├─ Beef - Mild - $6.50 {protein: "beef", spice: "mild"}
│  ├─ Chicken - Medium - $5.50 {protein: "chicken", spice: "medium"}
│  ├─ Tofu - Hot - $4.50 {protein: "tofu", spice: "hot"}
│  └─ Bundle: Family Dinner (Serves 4) - $24.99
```

**Customer View:**
Shows: Categories → Subcategories → Products → Variant Selection
Hides: Brands

---

### 3️⃣ CLOTHING STORE 👗
**Configuration:**
```json
{
  "businessName": "Fashion Hub",
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true,
  "structure": "Category → Subcategory + Brand → Product → Variants"
}
```

**What They Need:**
```
✅ Categories (Apparel, Footwear, Accessories)
✅ Subcategories (T-Shirts, Dresses, Shoes)
✅ Brands (Nike, Adidas, Gucci, Ralph Lauren)
✅ Variants (Color, Size)
✅ Custom Attributes (material, fit, color, size)

Product Example:
├─ Classic Cotton T-Shirt (Apparel > T-Shirts, Nike)
│  ├─ Red - Small - $19.99 {color: "red", size: "S"}
│  ├─ Red - Medium - $19.99 {color: "red", size: "M"}
│  ├─ Blue - Small - $19.99 {color: "blue", size: "S"}
│  └─ Blue - Large - $21.99 {color: "blue", size: "L"}
```

**Customer View:**
Shows: Categories → Subcategories → Brands → Products → Color/Size Selection
All filters available

---

### 4️⃣ ELECTRONICS 💻
**Configuration:**
```json
{
  "businessName": "Tech Store",
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true,
  "structure": "Brand-first OR Category-first"
}
```

**What They Need:**
```
✅ Categories (Phones, Computers, Accessories)
✅ Subcategories (iPhones, MacBooks)
✅ Brands (Apple, Samsung, Sony)
✅ Variants (Storage, Color)
✅ Custom Attributes (storage, processor, ram, color)

Product Example:
├─ iPhone 15 Pro (Phones > iPhones, Apple)
│  ├─ 128GB - Space Black - $999 {storage: "128GB", color: "space black"}
│  ├─ 256GB - Gold - $1,099 {storage: "256GB", color: "gold"}
│  ├─ 512GB - Silver - $1,299 {storage: "512GB", color: "silver"}
│  └─ 1TB - Deep Purple - $1,399 {storage: "1TB", color: "deep purple"}
```

**Customer View:**
Shows: Brands → Categories → Products → Variant Selection
All features available

---

### 5️⃣ PHARMACY 💊
**Configuration:**
```json
{
  "businessName": "HealthCare Pharmacy",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": true,
  "structure": "Category + Brand → Product (No variants)"
}
```

**What They Need:**
```
✅ Categories (Pain Relief, Cold & Flu, Vitamins, First Aid)
❌ Subcategories (hidden)
✅ Brands (Aspirin, Ibuprofen, Vitamin C)
❌ Variants (hidden - products are single items)
✅ Custom Attributes (strength, quantity, dosage)

Product Example:
├─ Aspirin 500mg (Pain Relief, Aspirin brand)
│  └─ Default - $5.99 (no variants needed)
│
├─ Ibuprofen 200mg (Pain Relief, Ibuprofen brand)
│  └─ Default - $6.99
│
└─ Vitamin C 1000mg (Vitamins, Vitamin C brand)
   └─ Default - $7.99
```

**Customer View:**
Shows: Categories → Brands → Products (No variant selector)
Hides: Subcategories

---

### 6️⃣ GROCERY STORE 🛒
**Configuration:**
```json
{
  "businessName": "FreshMart Grocery",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false,
  "structure": "Category → Product (Simple)"
}
```

**What They Need:**
```
✅ Categories (Vegetables, Fruits, Dairy, Bakery, Meat)
❌ Subcategories (hidden)
❌ Brands (hidden)
❌ Variants (hidden - show price per unit/weight)
✅ Custom Attributes (weight, unit type)

Product Example:
├─ Tomato - $0.99/lb
├─ Apple - $1.99/lb
├─ Milk (1L) - $3.99
├─ Bread (Loaf) - $2.99
└─ Chicken Breast - $5.99/lb
```

**Customer View:**
Shows: Categories → Products → Quantity Selection
Hides: Brands, Subcategories, Variants

---

### 7️⃣ CAR RENTAL 🚗
**Configuration:**
```json
{
  "businessName": "Drive Rental",
  "useCategories": false,
  "useSubcategories": false,
  "useBrands": true,
  "structure": "Brand → Product → Variants"
}
```

**What They Need:**
```
❌ Categories (hidden)
❌ Subcategories (hidden)
✅ Brands (Toyota, Honda, BMW, Mercedes)
✅ Variants (Transmission, Insurance options)
✅ Custom Attributes (model, year, transmission)

Product Example:
├─ Toyota Corolla 2024 (Toyota brand)
│  ├─ Manual - $45/day {transmission: "manual"}
│  ├─ Automatic - $55/day {transmission: "automatic"}
│  └─ Automatic + Insurance - $75/day {insurance: "included"}
```

**Customer View:**
Shows: Brands → Products → Variant Selection
Hides: Categories, Subcategories

---

### 📊 Flexibility Matrix

```
Business Type        | Categories | Subcategories | Brands | Variants | Custom Attributes
--------------------|:----------:|:-------------:|:------:|:--------:|:----------------:
Coffee Shop          |     ✅     |       ❌      |   ❌   |    ✅    |  ✅ (size, temp)
Restaurant           |     ✅     |       ✅      |   ❌   |    ✅    |  ✅ (spice, extra)
Clothing Store       |     ✅     |       ✅      |   ✅   |    ✅    |  ✅ (color, size)
Electronics Store    |     ✅     |       ✅      |   ✅   |    ✅    |  ✅ (specs)
Pharmacy             |     ✅     |       ❌      |   ✅   |    ❌    |  ✅ (dosage)
Jewelry Store        |     ✅     |       ✅      |   ✅   |    ✅    |  ✅ (material)
Grocery Store        |     ✅     |       ❌      |   ❌   |    ❌    |  ✅ (weight)
```

---

## 📦 Complete JSON Examples for All Business Types

### COFFEE SHOP - Iced Latte Product

```json
{
  "id": "p1",
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "name": "Iced Latte",
  "description": "Chilled latte with ice and milk",
  "price": 3.50,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "category": {
    "id": "c1",
    "name": "Iced Beverages"
  },
  
  "subcategory": null,
  "brand": null,
  
  "tags": ["cold", "bestseller", "vegan"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/iced-latte-1.jpg",
      "isPrimary": true,
      "altText": "Iced Latte in glass"
    },
    {
      "id": "img2",
      "url": "https://cdn.example.com/iced-latte-2.jpg",
      "isPrimary": false,
      "altText": "Iced Latte with milk"
    }
  ],
  
  "rating": 4.8,
  "reviewCount": 145,
  "topReviews": [
    {
      "id": "rev1",
      "userName": "John D.",
      "rating": 5,
      "title": "Best iced latte in town!",
      "comment": "Perfect balance of coffee and milk",
      "verified": true,
      "helpful": 23,
      "createdAt": "2024-04-20T10:30:00Z"
    }
  ],
  
  "hasSizes": true,
  
  "promotionType": "PERCENTAGE",
  "promotionValue": 10.0,
  "promotionActive": true,
  
  "stock": {
    "enabled": true,
    "status": "IN_STOCK",
    "totalQuantity": 150,
    "lowStockThreshold": 20,
    "isLowStock": false
  },
  
  "variants": [
    {
      "id": "v1",
      "name": "Small",
      "price": 2.50,
      "sku": "ILATTE-S",
      "attributes": {
        "size": "small",
        "volume": "12oz"
      },
      "finalPrice": 2.25,
      "stock": {
        "quantity": 45,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v2",
      "name": "Medium",
      "price": 3.50,
      "sku": "ILATTE-M",
      "attributes": {
        "size": "medium",
        "volume": "16oz"
      },
      "finalPrice": 3.15,
      "stock": {
        "quantity": 75,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v3",
      "name": "Large",
      "price": 4.50,
      "sku": "ILATTE-L",
      "attributes": {
        "size": "large",
        "volume": "20oz"
      },
      "finalPrice": 4.05,
      "stock": {
        "quantity": 30,
        "status": "IN_STOCK"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p2",
      "name": "Croissant",
      "price": 2.00,
      "imageUrl": "https://cdn.example.com/croissant.jpg",
      "reason": "often-bought-together"
    }
  ],
  
  "createdAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-04-22T10:30:00Z"
}
```

---

### RESTAURANT - Lok Lak with Bundle

```json
{
  "id": "p2",
  "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
  "name": "Lok Lak",
  "description": "Cambodian stir-fried beef with lime sauce",
  "price": 6.50,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "category": {
    "id": "c2",
    "name": "Main Dishes"
  },
  
  "subcategory": {
    "id": "s1",
    "name": "Rice Dishes"
  },
  
  "brand": null,
  
  "tags": ["bestseller", "spicy", "traditional"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/lok-lak-1.jpg",
      "isPrimary": true,
      "altText": "Lok Lak with rice"
    }
  ],
  
  "rating": 4.9,
  "reviewCount": 234,
  
  "hasSizes": true,
  
  "promotionType": "FIXED_AMOUNT",
  "promotionValue": 1.00,
  "promotionActive": true,
  
  "stock": {
    "enabled": true,
    "status": "IN_STOCK",
    "totalQuantity": 200
  },
  
  "variants": [
    {
      "id": "v1",
      "name": "Beef - Mild",
      "price": 6.50,
      "sku": "LOKLAK-BEEF-MILD",
      "attributes": {
        "protein": "beef",
        "spiceLevel": "mild"
      },
      "finalPrice": 5.50,
      "stock": {
        "quantity": 75,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v2",
      "name": "Chicken - Medium",
      "price": 5.50,
      "sku": "LOKLAK-CHICKEN-MEDIUM",
      "attributes": {
        "protein": "chicken",
        "spiceLevel": "medium"
      },
      "finalPrice": 4.50,
      "stock": {
        "quantity": 60,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v3",
      "name": "Tofu - Vegan",
      "price": 4.50,
      "sku": "LOKLAK-TOFU-VEGAN",
      "attributes": {
        "protein": "tofu",
        "spiceLevel": "medium",
        "dietary": "vegan"
      },
      "finalPrice": 4.50,
      "stock": {
        "quantity": 15,
        "status": "LOW_STOCK"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p3",
      "name": "Samlor Machu (Fish Soup)",
      "price": 5.00,
      "imageUrl": "https://cdn.example.com/samlor-machu.jpg",
      "reason": "often-bought-together"
    }
  ],
  
  "createdAt": "2024-02-01T00:00:00Z",
  "updatedAt": "2024-04-22T12:00:00Z"
}
```

### Restaurant Bundle/Combo

```json
{
  "id": "bundle-1",
  "businessId": "660cad56-cafd-4aba-baef-c4dcd53940d1",
  "name": "Family Dinner (Serves 4)",
  "description": "Complete meal for family of 4",
  "type": "BUNDLE",
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "bundlePrice": 24.99,
  "regularPrice": 28.50,
  "savingsPercent": 12.3,
  
  "items": [
    {
      "productId": "p2",
      "productName": "Lok Lak",
      "variantId": "v1",
      "variantName": "Beef - Medium",
      "quantity": 2,
      "totalPrice": 11.00
    },
    {
      "productId": "p4",
      "productName": "Spring Rolls",
      "variantId": "v1",
      "variantName": "6 pieces",
      "quantity": 1,
      "totalPrice": 4.50
    },
    {
      "productId": "p5",
      "productName": "Iced Tea",
      "variantId": "v1",
      "variantName": "Large x4",
      "quantity": 1,
      "totalPrice": 6.00
    },
    {
      "productId": "p6",
      "productName": "Dessert (Choice)",
      "variantId": null,
      "variantName": "Sticky Rice or Cake",
      "quantity": 1,
      "totalPrice": 3.50
    }
  ],
  
  "rating": 4.9,
  "reviewCount": 156,
  
  "createdAt": "2024-02-15T00:00:00Z",
  "updatedAt": "2024-04-22T12:00:00Z"
}
```

---

### CLOTHING STORE - Classic Cotton T-Shirt

```json
{
  "id": "p7",
  "businessId": "770cad56-cafd-4aba-baef-c4dcd53940d2",
  "name": "Classic Cotton T-Shirt",
  "description": "Comfortable 100% cotton t-shirt in multiple colors and sizes",
  "price": 19.99,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "category": {
    "id": "c3",
    "name": "Apparel"
  },
  
  "subcategory": {
    "id": "s2",
    "name": "T-Shirts"
  },
  
  "brand": {
    "id": "b1",
    "name": "Nike"
  },
  
  "tags": ["new-arrival", "bestseller", "on-sale", "eco-friendly"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/tshirt-front.jpg",
      "isPrimary": true,
      "altText": "T-Shirt front view"
    },
    {
      "id": "img2",
      "url": "https://cdn.example.com/tshirt-back.jpg",
      "isPrimary": false,
      "altText": "T-Shirt back view"
    },
    {
      "id": "img3",
      "url": "https://cdn.example.com/tshirt-detail.jpg",
      "isPrimary": false,
      "altText": "Fabric detail"
    }
  ],
  
  "rating": 4.7,
  "reviewCount": 892,
  "topReviews": [
    {
      "id": "rev1",
      "userName": "Emma R.",
      "rating": 5,
      "title": "Perfect fit and quality!",
      "comment": "Great material, true to size, vibrant colors",
      "verified": true,
      "helpful": 123,
      "createdAt": "2024-04-20T15:30:00Z"
    }
  ],
  
  "hasSizes": true,
  
  "promotionType": "FIXED_AMOUNT",
  "promotionValue": 2.00,
  "promotionActive": true,
  
  "stock": {
    "enabled": true,
    "status": "IN_STOCK",
    "totalQuantity": 450,
    "lowStockThreshold": 30
  },
  
  "variants": [
    {
      "id": "v1",
      "name": "Red - Small",
      "price": 19.99,
      "sku": "TSHIRT-RED-S",
      "attributes": {
        "color": "Red",
        "size": "S",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "finalPrice": 17.99,
      "stock": {
        "quantity": 28,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v2",
      "name": "Red - Medium",
      "price": 19.99,
      "sku": "TSHIRT-RED-M",
      "attributes": {
        "color": "Red",
        "size": "M",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "finalPrice": 17.99,
      "stock": {
        "quantity": 95,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v3",
      "name": "Blue - Small",
      "price": 19.99,
      "sku": "TSHIRT-BLUE-S",
      "attributes": {
        "color": "Blue",
        "size": "S",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "finalPrice": 17.99,
      "stock": {
        "quantity": 18,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v4",
      "name": "Blue - Medium",
      "price": 19.99,
      "sku": "TSHIRT-BLUE-M",
      "attributes": {
        "color": "Blue",
        "size": "M",
        "material": "100% Cotton",
        "fit": "Regular"
      },
      "finalPrice": 17.99,
      "stock": {
        "quantity": 142,
        "status": "IN_STOCK"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p8",
      "name": "Performance T-Shirt",
      "price": 24.99,
      "imageUrl": "https://cdn.example.com/performance-tshirt.jpg",
      "reason": "similar-category"
    },
    {
      "id": "p9",
      "name": "Classic Shorts",
      "price": 29.99,
      "imageUrl": "https://cdn.example.com/shorts.jpg",
      "reason": "often-bought-together"
    }
  ],
  
  "createdAt": "2024-01-20T00:00:00Z",
  "updatedAt": "2024-04-22T14:30:00Z"
}
```

---

### ELECTRONICS - iPhone 15 Pro

```json
{
  "id": "p10",
  "businessId": "880cad56-cafd-4aba-baef-c4dcd53940d3",
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with advanced camera system and A17 Pro chip",
  "price": 999.99,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "category": {
    "id": "c4",
    "name": "Phones"
  },
  
  "subcategory": {
    "id": "s3",
    "name": "iPhones"
  },
  
  "brand": {
    "id": "b2",
    "name": "Apple"
  },
  
  "tags": ["flagship", "latest", "premium", "5g"],
  
  "images": [
    {
      "id": "img1",
      "url": "https://cdn.example.com/iphone15-front.jpg",
      "isPrimary": true,
      "altText": "iPhone 15 Pro front"
    },
    {
      "id": "img2",
      "url": "https://cdn.example.com/iphone15-back.jpg",
      "isPrimary": false,
      "altText": "iPhone 15 Pro back"
    }
  ],
  
  "rating": 4.8,
  "reviewCount": 1245,
  "topReviews": [
    {
      "id": "rev1",
      "userName": "Tech Lover",
      "rating": 5,
      "title": "Best iPhone ever!",
      "comment": "Camera system is incredible",
      "verified": true,
      "helpful": 456,
      "createdAt": "2024-04-19T12:00:00Z"
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
    "lowStockThreshold": 50
  },
  
  "variants": [
    {
      "id": "v1",
      "name": "128GB - Space Black",
      "price": 999.99,
      "sku": "IPH15PRO-128GB-BK",
      "attributes": {
        "storage": "128GB",
        "color": "Space Black",
        "processor": "A17 Pro",
        "display": "6.1 inch"
      },
      "stock": {
        "quantity": 85,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v2",
      "name": "256GB - Space Black",
      "price": 1099.99,
      "sku": "IPH15PRO-256GB-BK",
      "attributes": {
        "storage": "256GB",
        "color": "Space Black",
        "processor": "A17 Pro",
        "display": "6.1 inch"
      },
      "stock": {
        "quantity": 102,
        "status": "IN_STOCK"
      }
    },
    {
      "id": "v3",
      "name": "512GB - Gold",
      "price": 1299.99,
      "sku": "IPH15PRO-512GB-GOLD",
      "attributes": {
        "storage": "512GB",
        "color": "Gold",
        "processor": "A17 Pro",
        "display": "6.1 inch"
      },
      "stock": {
        "quantity": 45,
        "status": "IN_STOCK"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p11",
      "name": "iPhone 15 Pro Max",
      "price": 1099.99,
      "imageUrl": "https://cdn.example.com/iphone15-max.jpg",
      "reason": "similar-category"
    },
    {
      "id": "p12",
      "name": "Apple Phone Case",
      "price": 39.99,
      "imageUrl": "https://cdn.example.com/case.jpg",
      "reason": "often-bought-together"
    }
  ],
  
  "createdAt": "2024-01-10T00:00:00Z",
  "updatedAt": "2024-04-22T16:00:00Z"
}
```

---

### PHARMACY - Aspirin 500mg (No Variants)

```json
{
  "id": "p13",
  "businessId": "990cad56-cafd-4aba-baef-c4dcd53940d4",
  "name": "Aspirin 500mg",
  "description": "Effective pain reliever and fever reducer. Contains 100 tablets.",
  "price": 5.99,
  "status": "ACTIVE",
  "visibility": "PUBLIC",
  
  "category": {
    "id": "c5",
    "name": "Pain Relief"
  },
  
  "subcategory": null,
  
  "brand": {
    "id": "b3",
    "name": "Aspirin"
  },
  
  "tags": ["pain-relief", "fever-reducer", "popular"],
  
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
      "userName": "Health Conscious",
      "rating": 5,
      "title": "Works great!",
      "comment": "Fast acting and effective",
      "verified": true,
      "helpful": 78,
      "createdAt": "2024-04-18T11:00:00Z"
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
    "lowStockThreshold": 50
  },
  
  "variants": [
    {
      "id": "v1",
      "name": "Default",
      "price": 5.99,
      "sku": "ASPIRIN-500MG-100",
      "attributes": {
        "strength": "500mg",
        "quantity": "100 tablets"
      },
      "stock": {
        "quantity": 500,
        "status": "IN_STOCK"
      }
    }
  ],
  
  "relatedProducts": [
    {
      "id": "p14",
      "name": "Ibuprofen 200mg",
      "price": 6.99,
      "imageUrl": "https://cdn.example.com/ibuprofen.jpg",
      "reason": "similar-category"
    },
    {
      "id": "p15",
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

## 🎨 Feature Visibility Control - Where to Hide/Show

### The Problem
Different businesses need different features. Coffee shops don't need brands. Pharmacies don't need variants. How do we show/hide features in code?

### The Solution
Use `BusinessSettings` flags throughout the entire codebase:

```json
{
  "businessId": "550cad56-cafd-4aba-baef-c4dcd53940d0",
  "businessName": "Phatmenghor Coffee",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false
}
```

---

### BACKEND - Hide/Show Based on Settings

#### 1. ProductService - Conditional Data Loading

```java
// src/main/java/com/emenu/features/main/services/ProductService.java

public ProductResponse getProductForBusiness(
    UUID productId,
    UUID businessId,
    BusinessSettings settings
) {
    Product product = productRepository.findById(productId).orElseThrow();
    ProductResponse response = ProductResponse.from(product);
    
    // Hide category if business doesn't use categories
    if (!settings.getUseCategories()) {
        response.setCategory(null);
        response.setCategoryId(null);
    }
    
    // Hide subcategory if business doesn't use subcategories
    if (!settings.getUseSubcategories()) {
        response.setSubcategory(null);
        response.setSubcategoryId(null);
    }
    
    // Hide brand if business doesn't use brands
    if (!settings.getUseBrands()) {
        response.setBrand(null);
        response.setBrandId(null);
    }
    
    return response;
}

// Get products by category (only if business uses categories)
public List<ProductResponse> getProductsByCategory(
    UUID businessId,
    UUID categoryId,
    BusinessSettings settings
) {
    // Return empty if business doesn't use categories
    if (!settings.getUseCategories()) {
        return Collections.emptyList();
    }
    
    return productRepository
        .findByBusinessIdAndCategoryIdAndStatus(businessId, categoryId, ACTIVE)
        .stream()
        .map(p -> getProductForBusiness(p.getId(), businessId, settings))
        .toList();
}
```

#### 2. CategoryController - Conditional Listing

```java
// src/main/java/com/emenu/features/main/controllers/CategoryController.java

@GetMapping("/business/{businessId}")
public ResponseEntity<List<CategoryResponse>> getCategories(
    @PathVariable UUID businessId
) {
    BusinessSettings settings = businessService.getSettings(businessId);
    
    // Don't return any categories if business doesn't use them
    if (!settings.getUseCategories()) {
        return ResponseEntity.ok(Collections.emptyList());
    }
    
    List<Category> categories = categoryRepository.findByBusinessId(businessId);
    return ResponseEntity.ok(
        categories.stream()
            .map(CategoryResponse::from)
            .toList()
    );
}
```

#### 3. BrandController - Conditional Listing

```java
// src/main/java/com/emenu/features/main/controllers/BrandController.java

@GetMapping("/business/{businessId}")
public ResponseEntity<List<BrandResponse>> getBrands(
    @PathVariable UUID businessId
) {
    BusinessSettings settings = businessService.getSettings(businessId);
    
    // Don't return any brands if business doesn't use them
    if (!settings.getUseBrands()) {
        return ResponseEntity.ok(Collections.emptyList());
    }
    
    List<Brand> brands = brandRepository.findByBusinessId(businessId);
    return ResponseEntity.ok(
        brands.stream()
            .map(BrandResponse::from)
            .toList()
    );
}
```

---

### FRONTEND - Hide/Show Using React Conditional Rendering

#### 1. Product Detail Page

```typescript
// src/app/(public)/products/[id]/page.tsx

import { useSelector } from 'react-redux';
import { selectSettings } from '@/redux/features/business/selectors/business-selectors';

export default function ProductDetailPage({ params }) {
  const { data: product } = useQuery(['product', params.id], ...);
  const settings = useSelector(selectSettings);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p className="price">${product.price}</p>
      
      {/* CATEGORY - Show only if business uses categories */}
      {settings?.useCategories && product.category && (
        <div className="category-section">
          <Badge>{product.category.name}</Badge>
        </div>
      )}
      
      {/* SUBCATEGORY - Show only if business uses subcategories */}
      {settings?.useSubcategories && product.subcategory && (
        <div className="subcategory-section">
          <span className="breadcrumb">
            {product.category.name} > {product.subcategory.name}
          </span>
        </div>
      )}
      
      {/* BRAND - Show only if business uses brands */}
      {settings?.useBrands && product.brand && (
        <div className="brand-section">
          <img src={product.brand.imageUrl} alt={product.brand.name} />
          <p className="brand-name">Brand: {product.brand.name}</p>
        </div>
      )}
      
      {/* VARIANTS/SIZES - Always show if product has variants */}
      {product.variants && product.variants.length > 0 && (
        <ProductVariantSelector variants={product.variants} />
      )}
      
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
}
```

#### 2. Header Navigation

```typescript
// src/components/shared/header/header.tsx

import { useSelector } from 'react-redux';
import { selectSettings } from '@/redux/features/business/selectors/business-selectors';

export function Header() {
  const { data: categories } = useQuery(['categories', businessId], ...);
  const settings = useSelector(selectSettings);
  
  return (
    <header className="header">
      <div className="nav">
        {/* HOME - Always show */}
        <Link href="/">Home</Link>
        
        {/* CATEGORIES - Show only if used */}
        {settings?.useCategories && categories && (
          <DropdownMenu>
            <DropdownTrigger>Categories</DropdownTrigger>
            <DropdownContent>
              {categories.map(cat => (
                <Link key={cat.id} href={`/category/${cat.id}`}>
                  {cat.name}
                </Link>
              ))}
            </DropdownContent>
          </DropdownMenu>
        )}
        
        {/* BRANDS - Show only if used */}
        {settings?.useBrands && (
          <Link href="/brands">Brands</Link>
        )}
        
        {/* SEARCH - Always show */}
        <SearchBar />
        
        {/* CART - Always show */}
        <CartIcon />
      </div>
    </header>
  );
}
```

#### 3. Product Card Component

```typescript
// src/components/shared/card/product-card.tsx

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const settings = useSelector(selectSettings);
  
  return (
    <Card className="product-card">
      <img src={product.imageUrl} alt={product.name} />
      <h3>{product.name}</h3>
      
      {/* Category Badge - Hidden if not used */}
      {settings?.useCategories && product.category && (
        <Badge className="category-badge">
          {product.category.name}
        </Badge>
      )}
      
      {/* Brand Badge - Hidden if not used */}
      {settings?.useBrands && product.brand && (
        <Badge className="brand-badge">
          {product.brand.name}
        </Badge>
      )}
      
      <p className="price">${product.price}</p>
      <StarRating rating={product.rating} />
      
      <button onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </Card>
  );
}
```

#### 4. Admin Product Form

```typescript
// src/app/admin/products/[id]/edit/page.tsx

export function ProductEditForm({ product, businessId }) {
  const settings = useSelector(selectSettings);
  const form = useForm();
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Name - Always show */}
      <input {...form.register('name')} placeholder="Product Name" />
      
      {/* Category - Show only if business uses it */}
      {settings?.useCategories && (
        <div>
          <label>Category *</label>
          <Select {...form.register('categoryId')}>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
      )}
      
      {/* Subcategory - Show only if business uses it */}
      {settings?.useSubcategories && (
        <div>
          <label>Subcategory</label>
          <Select {...form.register('subcategoryId')}>
            {subcategories.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </Select>
        </div>
      )}
      
      {/* Brand - Show only if business uses it */}
      {settings?.useBrands && (
        <div>
          <label>Brand</label>
          <Select {...form.register('brandId')}>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>
      )}
      
      {/* Variants - Show if product has variants */}
      <VariantManager variants={product.variants} />
      
      <button type="submit">Save</button>
    </form>
  );
}
```

---

### REDUX - Store and Select Settings

```typescript
// src/redux/features/business/store/slices/business-slice.ts

const initialState = {
  settings: {
    businessId: null,
    businessName: null,
    useCategories: true,
    useSubcategories: false,
    useBrands: true
  }
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setBusinessSettings: (state, action) => {
      state.settings = action.payload;
    }
  }
});

// Selectors
export const selectSettings = (state) => state.business.settings;
export const selectUseCategories = (state) => state.business.settings.useCategories;
export const selectUseSubcategories = (state) => state.business.settings.useSubcategories;
export const selectUseBrands = (state) => state.business.settings.useBrands;
```

---

## 🏗️ System Architecture

### Technology Stack
```
Frontend:  Next.js 14 + React + TypeScript + Redux + Tailwind CSS
Backend:   Spring Boot 3 + Java 17 + Spring Data JPA
Database:  PostgreSQL 14+ (Flyway migrations)
Auth:      JWT Tokens
API:       REST (JSON)
Images:    CDN or local storage
```

### System Flow

```
Customer Browsing:
1. Customer visits App
2. Frontend fetches BusinessSettings
3. Redux stores useCategories, useSubcategories, useBrands flags
4. Frontend requests Products from API
5. Backend checks BusinessSettings flags
6. Backend conditionally includes/excludes category, subcategory, brand
7. Frontend renders UI with only visible sections

Admin Management:
1. Admin logs in
2. Admin navigates to Settings
3. Admin toggles useCategories, useSubcategories, useBrands
4. Settings saved to database
5. All subsequent API calls use new settings
6. UI automatically updates based on settings
```

---

## 🗄️ Database Schema

### BusinessSettings Table
```sql
CREATE TABLE business_settings (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL UNIQUE REFERENCES businesses(id),
  
  use_categories BOOLEAN DEFAULT true,
  use_subcategories BOOLEAN DEFAULT false,
  use_brands BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  brand_id UUID REFERENCES brands(id),
  
  visibility VARCHAR(50) DEFAULT 'PUBLIC',
  rating DECIMAL(3, 1),
  review_count INTEGER DEFAULT 0,
  
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Product Variants Table
```sql
CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  name VARCHAR(255),
  price DECIMAL(10, 2),
  sku VARCHAR(255),
  
  attributes JSONB,  -- Flexible: {size: "medium", color: "red", temp: "cold"}
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subcategories Table
```sql
CREATE TABLE subcategories (
  id UUID PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Brands Table
```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Additional Tables (New)
```sql
CREATE TABLE product_images (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  image_url VARCHAR(500),
  is_primary BOOLEAN DEFAULT false,
  alt_text VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_reviews (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  user_id UUID NOT NULL REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_tags (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  tag VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE related_products (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  related_product_id UUID NOT NULL REFERENCES products(id),
  reason VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, related_product_id)
);

CREATE TABLE product_bundles (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255),
  description TEXT,
  bundle_price DECIMAL(10, 2),
  regular_price DECIMAL(10, 2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bundle_items (
  id UUID PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES product_bundles(id),
  product_id UUID NOT NULL REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 Changes Needed from Current Code

### Phase 1: Database (Add columns + new tables)

```sql
-- Modify products table
ALTER TABLE products ADD COLUMN visibility VARCHAR(50) DEFAULT 'PUBLIC';
ALTER TABLE products ADD COLUMN rating DECIMAL(3, 1);
ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;

-- Modify categories table
ALTER TABLE categories ADD COLUMN image_url VARCHAR(500);

-- Add to business_settings
ALTER TABLE business_settings ADD COLUMN use_categories BOOLEAN DEFAULT true;
ALTER TABLE business_settings ADD COLUMN use_subcategories BOOLEAN DEFAULT false;
ALTER TABLE business_settings ADD COLUMN use_brands BOOLEAN DEFAULT true;

-- Create new tables (product_images, product_reviews, product_tags, etc.)
-- See schema above
```

### Phase 2: Backend Models (Add 7 new entities)

**Files to create:**
- `ProductImage.java`
- `ProductTag.java`
- `RelatedProduct.java`
- `ProductReview.java`
- `ProductBundle.java`
- `BundleItem.java`
- `ProductVariant.java` (rename from ProductSize)

**Files to modify:**
- `Product.java` (add fields: visibility, rating, reviewCount, images, tags, reviews)
- `Category.java` (add field: imageUrl)
- `BusinessSettings.java` (add fields: useCategories, useSubcategories, useBrands)

### Phase 3: Backend Services (Add 6 new services)

**Files to create:**
- `ProductImageService.java`
- `ProductReviewService.java`
- `ProductTagService.java`
- `RelatedProductService.java`
- `ProductBundleService.java`
- `ProductFilterService.java`

**Files to modify:**
- `ProductService.java` (add methods like `getProductForBusiness()`, `filterByTags()`, `filterByPrice()`)

### Phase 4: API Endpoints (20+ new endpoints)

**New endpoints:**
```
GET/POST   /api/products/{id}/images
GET/POST   /api/products/{id}/reviews
GET/POST   /api/products/{id}/tags
GET        /api/products/{id}/related
GET        /api/products/filter?tags=&minPrice=&maxPrice=&rating=
GET/POST   /api/bundles/
GET/POST   /api/bundles/{id}
```

### Phase 5: Frontend Components (15+ new components)

**Files to create:**
- `ProductGallery.tsx` (image carousel)
- `ProductReviewSection.tsx`
- `ProductReviewForm.tsx`
- `ProductFilters.tsx`
- `ProductRelatedSection.tsx`
- `PriceRangeFilter.tsx`
- `BundleCard.tsx`
- `BundleForm.tsx`
- And more...

**Files to modify:**
- Product detail page (add reviews, gallery, related products)
- Product grid page (add filters)
- Admin product form (conditional fields)

### Phase 6: Redux Integration

**Files to create:**
- `filters-slice.ts` (store filter state)
- `reviews-slice.ts` (store reviews)
- `bundles-slice.ts` (store bundles)

**Files to modify:**
- `business-slice.ts` (add useCategories, useSubcategories, useBrands)
- `products-slice.ts` (handle filtered products)

---

## 🔌 API Endpoints

### Product Endpoints
```
GET    /api/products                           - List all
GET    /api/products/{id}                      - Get single
POST   /api/products                           - Create
PUT    /api/products/{id}                      - Update
DELETE /api/products/{id}                      - Delete

GET    /api/products/{id}/reviews              - Get reviews
POST   /api/products/{id}/reviews              - Create review
GET    /api/products/{id}/images               - Get images
POST   /api/products/{id}/images               - Upload image
GET    /api/products/{id}/related              - Get related products

GET    /api/products/filter?tags=...           - Filter by tags
GET    /api/products/filter?minPrice=...       - Filter by price
GET    /api/products/search?q=...              - Search
```

### Category Endpoints
```
GET    /api/categories/business/{businessId}   - List for business
GET    /api/categories/{id}                    - Get single
POST   /api/categories                         - Create
PUT    /api/categories/{id}                    - Update
DELETE /api/categories/{id}                    - Delete
```

### Brand Endpoints
```
GET    /api/brands/business/{businessId}       - List for business
GET    /api/brands/{id}                        - Get single
POST   /api/brands                             - Create
PUT    /api/brands/{id}                        - Update
DELETE /api/brands/{id}                        - Delete
```

### Bundle Endpoints
```
GET    /api/bundles/business/{businessId}      - List bundles
GET    /api/bundles/{id}                       - Get bundle details
POST   /api/bundles                            - Create bundle
PUT    /api/bundles/{id}                       - Update bundle
DELETE /api/bundles/{id}                       - Delete bundle
```

### Business Settings Endpoints
```
GET    /api/business-settings/{businessId}     - Get settings
PUT    /api/business-settings/{businessId}     - Update settings
```

---

## ⏱️ Implementation Timeline

### Week 1: Database & Backend Models
- [ ] Create database migration (Flyway)
- [ ] Create 7 new entity classes
- [ ] Create 6 new repositories
- [ ] Create DTOs for all entities

### Week 2: Backend Services
- [ ] Implement ProductService methods
- [ ] Implement ReviewService
- [ ] Implement BundleService
- [ ] Implement FilterService

### Week 3: API Endpoints
- [ ] Create ProductController endpoints
- [ ] Create ReviewController
- [ ] Create BundleController
- [ ] Create FilterController

### Week 4: Frontend Components
- [ ] ProductGallery component
- [ ] ReviewSection component
- [ ] ProductFilters component
- [ ] BundleCard component

### Week 5: Frontend Pages & Integration
- [ ] Update product detail page
- [ ] Update product grid page
- [ ] Update search page
- [ ] Add filter logic

### Week 6: Redux & Admin
- [ ] Create Redux slices for filters, reviews, bundles
- [ ] Create admin settings page
- [ ] Create admin product form with conditional fields
- [ ] Testing

### Week 7: Polish & Deployment
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] Bug fixes
- [ ] Deploy to production

---

## ✅ Implementation Checklist

### Backend
- [ ] Add database columns to business_settings
- [ ] Create 6 new tables for images, reviews, tags, bundles, etc.
- [ ] Create 7 new entity classes
- [ ] Create 6 new repository interfaces
- [ ] Create 6 new service classes
- [ ] Update ProductService with getProductForBusiness()
- [ ] Create DTOs for all responses
- [ ] Create 20+ API endpoints
- [ ] Add conditional logic to all endpoints

### Frontend
- [ ] Fetch settings on app load
- [ ] Store settings in Redux
- [ ] Create useBusinessSettings hook
- [ ] Update Header component (conditional nav)
- [ ] Update ProductCard component (conditional fields)
- [ ] Update ProductDetailPage (reviews, gallery, related)
- [ ] Update ProductsPage (filters)
- [ ] Create ProductFilters component
- [ ] Create ReviewSection component
- [ ] Create ProductGallery component
- [ ] Create BundleCard component
- [ ] Update admin forms (conditional fields)

### Testing
- [ ] Test all endpoints
- [ ] Test all pages
- [ ] Test filters
- [ ] Test conditional rendering
- [ ] Mobile responsive testing

---

## 🎯 Real-World Examples

### Coffee Shop Implementation:
```
API Response for Iced Latte:
{
  "name": "Iced Latte",
  "category": { "id": "c1", "name": "Iced Beverages" },
  "subcategory": null,        ← Hidden by backend
  "brand": null,               ← Hidden by backend
  "variants": [...]
}

Frontend renders:
- Category badge ✅
- No subcategory ❌
- No brand ❌
- Variants ✅
```

### Clothing Store Implementation:
```
API Response for T-Shirt:
{
  "name": "Classic Cotton T-Shirt",
  "category": { "id": "c3", "name": "Apparel" },
  "subcategory": { "id": "s2", "name": "T-Shirts" },
  "brand": { "id": "b1", "name": "Nike" },
  "variants": [...]
}

Frontend renders:
- Category badge ✅
- Subcategory ✅
- Brand badge ✅
- Variants ✅
- Filters ✅
```

---

## 📊 Final Summary

| Feature | Status | Phase |
|---------|--------|-------|
| Database Schema | ❌ | 1 |
| Backend Models | ❌ | 1 |
| Repositories | ❌ | 2 |
| Services | ❌ | 2 |
| API Endpoints | ❌ | 3 |
| Frontend Components | ❌ | 4 |
| Redux Integration | ❌ | 6 |
| Admin Features | ❌ | 6 |
| Testing | ❌ | 7 |

**Total Implementation Time: 5-7 weeks**

---

## 🚀 Next Steps

1. Start with **Phase 1: Database** (Create migration file)
2. Move to **Phase 2: Backend Models** (Create entities)
3. Then **Phase 3: Services** (Business logic)
4. Then **Phase 4: API Endpoints** (REST endpoints)
5. Then **Phase 5: Frontend** (React components)
6. Finally **Phase 6-7: Polish & Deploy**

**Ready to build?** Start with Phase 1! 🎯
