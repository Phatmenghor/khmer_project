# 📚 COMPLETE E-COMMERCE SYSTEM - FULL REVIEW GUIDE

**One document. Everything you need. Ready to implement.**

---

# Table of Contents

1. [System Overview](#system-overview)
2. [All 7 Business Types](#all-7-business-types)
3. [Coffee Shop Customization (Size + Sugar + Milk + Shots)](#coffee-shop-customization-detailed)
4. [Complete JSON Examples](#complete-json-examples)
5. [Feature Visibility Control](#feature-visibility-control)
6. [System Architecture](#system-architecture)
7. [Database Schema](#database-schema)
8. [API Endpoints](#api-endpoints)
9. [Implementation Checklist](#implementation-checklist)

---

# System Overview

## What We're Building

A **single flexible e-commerce platform** for ANY business type:

- ☕ Coffee shops
- 🍽️ Restaurants
- 👗 Clothing stores
- 💻 Electronics
- 💊 Pharmacies
- 🛒 Grocery stores
- 🚗 Car rentals

## Core Concept

**One code base. Multiple business types. ZERO code changes.**

Each business toggles features:

```json
{
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true
}
```

---

# All 7 Business Types

## 1️⃣ COFFEE SHOP ☕

```json
{
  "businessName": "Phatmenghor Coffee",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false,
  "structure": "Category → Product → Variants"
}
```

**Features:**
- ✅ Categories (Espresso Drinks, Iced Beverages, Pastries)
- ❌ Subcategories (hidden)
- ❌ Brands (hidden)
- ✅ Variants (Small, Medium, Large)
- ✅ Custom Attributes (size, temperature, sugar, milk)

**Example:**
```
Iced Latte
├─ Small - $2.50 {size: "small"}
├─ Medium - $3.50 {size: "medium"}
└─ Large - $4.50 {size: "large"}
+ Customizations: Sugar, Milk Type, Extra Shots
```

---

## 2️⃣ RESTAURANT 🍽️

```json
{
  "businessName": "Khmer Kitchen",
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": false,
  "structure": "Category → Subcategory → Product → Variants"
}
```

**Features:**
- ✅ Categories (Main Dishes, Beverages, Desserts)
- ✅ Subcategories (Soups, Rice Dishes, Noodles)
- ❌ Brands (hidden)
- ✅ Variants (Protein, Spice Level)
- ✅ Bundles/Combos (Family Dinner)

**Example:**
```
Lok Lak (Main Dishes > Rice Dishes)
├─ Beef - Mild - $6.50
├─ Chicken - Medium - $5.50
├─ Tofu - Hot - $4.50
└─ Bundle: Family Dinner - $24.99
```

---

## 3️⃣ CLOTHING STORE 👗

```json
{
  "businessName": "Fashion Hub",
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true,
  "structure": "Category → Subcategory + Brand → Product → Variants"
}
```

**Features:**
- ✅ Categories (Apparel, Footwear, Accessories)
- ✅ Subcategories (T-Shirts, Shoes, Hats)
- ✅ Brands (Nike, Adidas, Gucci)
- ✅ Variants (Color, Size)

**Example:**
```
Classic Cotton T-Shirt (Apparel > T-Shirts, Nike)
├─ Red - Small - $19.99
├─ Red - Medium - $19.99
├─ Blue - Small - $19.99
└─ Blue - Medium - $19.99
```

---

## 4️⃣ ELECTRONICS 💻

```json
{
  "businessName": "Tech Store",
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true,
  "structure": "Brand-first OR Category-first"
}
```

**Features:**
- ✅ Categories (Phones, Computers, Accessories)
- ✅ Subcategories (iPhones, MacBooks)
- ✅ Brands (Apple, Samsung, Sony)
- ✅ Variants (Storage, Color)

**Example:**
```
iPhone 15 Pro (Phones > iPhones, Apple)
├─ 128GB - Space Black - $999
├─ 256GB - Gold - $1,099
├─ 512GB - Silver - $1,299
└─ 1TB - Purple - $1,399
```

---

## 5️⃣ PHARMACY 💊

```json
{
  "businessName": "HealthCare Pharmacy",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": true,
  "structure": "Category + Brand → Product (No variants)"
}
```

**Features:**
- ✅ Categories (Pain Relief, Cold & Flu, Vitamins)
- ❌ Subcategories (hidden)
- ✅ Brands (Aspirin, Ibuprofen, Vitamin C)
- ❌ Variants (hidden - single items)

**Example:**
```
Pain Relief
├─ Aspirin (brand)
│  └─ Aspirin 500mg - $5.99
├─ Ibuprofen (brand)
│  └─ Ibuprofen 200mg - $6.99
└─ Paracetamol (brand)
   └─ Paracetamol 500mg - $4.99
```

---

## 6️⃣ GROCERY STORE 🛒

```json
{
  "businessName": "FreshMart Grocery",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false,
  "structure": "Category → Product (Simple)"
}
```

**Features:**
- ✅ Categories (Vegetables, Fruits, Dairy, Meat)
- ❌ Subcategories (hidden)
- ❌ Brands (hidden)
- ❌ Variants (hidden - price per unit)

**Example:**
```
Vegetables
├─ Tomato - $0.99/lb
├─ Onion - $0.79/lb
└─ Cucumber - $1.50 each

Dairy
├─ Milk (1L) - $3.99
├─ Cheese - $6.99
└─ Yogurt - $2.99
```

---

## 7️⃣ CAR RENTAL 🚗

```json
{
  "businessName": "Drive Rental",
  "useCategories": false,
  "useSubcategories": false,
  "useBrands": true,
  "structure": "Brand → Product → Variants"
}
```

**Features:**
- ❌ Categories (hidden)
- ❌ Subcategories (hidden)
- ✅ Brands (Toyota, Honda, BMW, Mercedes)
- ✅ Variants (Transmission, Insurance)

**Example:**
```
Toyota (brand)
├─ Toyota Corolla 2024
│  ├─ Manual - $45/day
│  ├─ Automatic - $55/day
│  └─ Auto + Insurance - $75/day
└─ Toyota Camry
   └─ Standard - $65/day
```

---

### Flexibility Matrix

```
Business Type    | Categories | Subcategories | Brands | Variants | Custom Attributes
-----------------|:----------:|:-------------:|:------:|:--------:|:----------------:
Coffee Shop      |     ✅     |       ❌      |   ❌   |    ✅    |  ✅ (size, temp)
Restaurant       |     ✅     |       ✅      |   ❌   |    ✅    |  ✅ (spice)
Clothing         |     ✅     |       ✅      |   ✅   |    ✅    |  ✅ (color, size)
Electronics      |     ✅     |       ✅      |   ✅   |    ✅    |  ✅ (storage)
Pharmacy         |     ✅     |       ❌      |   ✅   |    ❌    |  ✅ (dosage)
Grocery          |     ✅     |       ❌      |   ❌   |    ❌    |  ✅ (weight)
Car Rental       |     ❌     |       ❌      |   ✅   |    ✅    |  ✅ (model)
```

---

# Coffee Shop Customization Detailed

## The Problem

Coffee shops have TWO types of options:

1. **Sizes** (Small, Medium, Large) - Different prices
2. **Customizations** (Sugar, Milk, Shots) - Add-ons during order

How to handle both?

---

## Solution: Size Variants + Customization Options

### Step 1: Size Variants (Database)

```sql
-- Products Table
INSERT INTO products (id, name, business_id, price) VALUES
('p1', 'Iced Latte', 'biz-coffee-1', 3.50);

-- Product Variants (Sizes)
INSERT INTO product_variants (id, product_id, name, price, sku, attributes) VALUES
('v1', 'p1', 'Small', 2.50, 'ILATTE-S', '{"size": "small", "volume": "12oz"}'),
('v2', 'p1', 'Medium', 3.50, 'ILATTE-M', '{"size": "medium", "volume": "16oz"}'),
('v3', 'p1', 'Large', 4.50, 'ILATTE-L', '{"size": "large", "volume": "20oz"}');
```

### Step 2: Customization Options (Database)

```sql
-- Product Customizations
INSERT INTO product_customizations (id, product_id, customization_key, name, customization_type) VALUES
('c1', 'p1', 'sugar', 'Sugar Level', 'CHOICE'),
('c2', 'p1', 'milk', 'Milk Type', 'CHOICE'),
('c3', 'p1', 'shots', 'Extra Shots', 'CHOICE');

-- Customization Options
INSERT INTO customization_options (id, customization_id, option_key, option_name, price_adjustment) VALUES
-- Sugar
('s1', 'c1', 'no-sugar', 'No Sugar', 0.00),
('s2', 'c1', 'normal', 'Normal (Default)', 0.00),
('s3', 'c1', 'extra', 'Extra Sugar', 0.25),
('s4', 'c1', 'very-sweet', 'Very Sweet', 0.50),

-- Milk
('m1', 'c2', 'regular', 'Regular (Default)', 0.00),
('m2', 'c2', 'almond', 'Almond Milk', 0.50),
('m3', 'c2', 'oat', 'Oat Milk', 0.75),
('m4', 'c2', 'coconut', 'Coconut Milk', 0.75),

-- Shots
('sh1', 'c3', 'no-extra', 'No Extra (Default)', 0.00),
('sh2', 'c3', 'plus-1', '+1 Shot', 0.75),
('sh3', 'c3', 'plus-2', '+2 Shots', 1.50);
```

### Step 3: Customer Journey

**Customer sees:**

```
┌─────────────────────────┐
│ Iced Latte              │
│ $2.50 - $4.50          │
├─────────────────────────┤
│ Select Size:            │
│ ○ Small  - $2.50       │
│ ○ Medium - $3.50       │
│ ○ Large  - $4.50       │
│                        │
│ [Next → Customize]     │
└─────────────────────────┘

THEN:

┌─────────────────────────┐
│ Iced Latte - Medium     │
│ Base Price: $3.50       │
├─────────────────────────┤
│ Sugar Level:            │
│ ○ No Sugar       (+$0)  │
│ ○ Normal         (+$0)  │
│ ◉ Extra Sugar    (+$0.25)│
│ ○ Very Sweet     (+$0.50)│
│                        │
│ Milk Type:              │
│ ○ Regular        (+$0)  │
│ ○ Almond         (+$0.50)│
│ ◉ Oat            (+$0.75)│
│ ○ Coconut        (+$0.75)│
│                        │
│ Extra Shots:            │
│ ○ None           (+$0)  │
│ ◉ +1 Shot       (+$0.75)│
│ ○ +2 Shots      (+$1.50)│
│                        │
│ Base Price: $3.50       │
│ Customizations: +$1.75  │
│ TOTAL: $5.25            │
│                        │
│ [Add to Cart]           │
└─────────────────────────┘
```

### Step 4: API Response for Product

```json
{
  "id": "p1",
  "name": "Iced Latte",
  "basePrice": 3.50,
  
  "variants": [
    {
      "id": "v1",
      "name": "Small",
      "price": 2.50,
      "attributes": {"size": "small", "volume": "12oz"}
    },
    {
      "id": "v2",
      "name": "Medium",
      "price": 3.50,
      "attributes": {"size": "medium", "volume": "16oz"}
    },
    {
      "id": "v3",
      "name": "Large",
      "price": 4.50,
      "attributes": {"size": "large", "volume": "20oz"}
    }
  ],
  
  "customizationOptions": [
    {
      "id": "sugar",
      "name": "Sugar Level",
      "type": "CHOICE",
      "required": false,
      "options": [
        {"id": "no-sugar", "name": "No Sugar", "priceAdjustment": 0.00},
        {"id": "normal", "name": "Normal", "priceAdjustment": 0.00, "default": true},
        {"id": "extra-sugar", "name": "Extra Sugar", "priceAdjustment": 0.25},
        {"id": "very-sweet", "name": "Very Sweet", "priceAdjustment": 0.50}
      ]
    },
    {
      "id": "milk",
      "name": "Milk Type",
      "type": "CHOICE",
      "required": false,
      "options": [
        {"id": "regular", "name": "Regular Milk", "priceAdjustment": 0.00, "default": true},
        {"id": "almond", "name": "Almond Milk", "priceAdjustment": 0.50},
        {"id": "oat", "name": "Oat Milk", "priceAdjustment": 0.75},
        {"id": "coconut", "name": "Coconut Milk", "priceAdjustment": 0.75}
      ]
    },
    {
      "id": "shots",
      "name": "Extra Shots",
      "type": "CHOICE",
      "required": false,
      "options": [
        {"id": "no-extra", "name": "No Extra", "priceAdjustment": 0.00, "default": true},
        {"id": "plus-1", "name": "+1 Shot", "priceAdjustment": 0.75},
        {"id": "plus-2", "name": "+2 Shots", "priceAdjustment": 1.50}
      ]
    }
  ]
}
```

### Step 5: Add to Cart Request

```json
{
  "productId": "p1",
  "variantId": "v2",
  "quantity": 1,
  
  "customizations": {
    "sugar": "extra-sugar",
    "milk": "oat",
    "shots": "plus-1"
  }
}
```

### Step 6: Cart Response

```json
{
  "cartItems": [
    {
      "id": "item-1",
      "productId": "p1",
      "productName": "Iced Latte",
      "variantId": "v2",
      "variantName": "Medium",
      "basePrice": 3.50,
      "quantity": 1,
      
      "customizations": {
        "sugar": {
          "id": "extra-sugar",
          "name": "Extra Sugar",
          "priceAdjustment": 0.25
        },
        "milk": {
          "id": "oat",
          "name": "Oat Milk",
          "priceAdjustment": 0.75
        },
        "shots": {
          "id": "plus-1",
          "name": "+1 Shot",
          "priceAdjustment": 0.75
        }
      },
      
      "customizationPrice": 1.75,
      "finalPrice": 5.25,
      "displayText": "Iced Latte (Medium) - Extra Sugar, Oat Milk, +1 Shot"
    }
  ]
}
```

### Step 7: React Component

```typescript
import React, { useState } from 'react';

export function ProductCustomizer({ product, onAdd }) {
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [customizations, setCustomizations] = useState({});
  
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId);
  const basePrice = selectedVariant?.price || product.basePrice;
  
  // Calculate customization adjustments
  const customizationPrice = product.customizationOptions.reduce((total, option) => {
    const selectedValue = customizations[option.id];
    const selectedOption = option.options.find(o => o.id === selectedValue);
    return total + (selectedOption?.priceAdjustment || 0);
  }, 0);
  
  const totalPrice = basePrice + customizationPrice;
  
  const handleAddToCart = () => {
    onAdd({
      productId: product.id,
      variantId: selectedVariantId,
      customizations,
      quantity: 1
    });
  };
  
  return (
    <div className="customizer">
      <h2>{product.name}</h2>
      
      {/* Size Selection */}
      <div className="sizes">
        <h3>Select Size:</h3>
        {product.variants.map(v => (
          <label key={v.id}>
            <input
              type="radio"
              name="size"
              value={v.id}
              onChange={(e) => setSelectedVariantId(e.target.value)}
            />
            {v.name} - ${v.price}
          </label>
        ))}
      </div>
      
      {/* Customization Options */}
      {product.customizationOptions.map(option => (
        <div key={option.id} className="customization-group">
          <h3>{option.name}:</h3>
          {option.options.map(opt => (
            <label key={opt.id}>
              <input
                type="radio"
                name={option.id}
                value={opt.id}
                onChange={(e) => 
                  setCustomizations({...customizations, [option.id]: e.target.value})
                }
              />
              {opt.name} {opt.priceAdjustment > 0 && `(+$${opt.priceAdjustment.toFixed(2)})`}
            </label>
          ))}
        </div>
      ))}
      
      {/* Total */}
      <div className="total">
        <p>Base: ${basePrice.toFixed(2)}</p>
        {customizationPrice > 0 && <p>Customizations: +${customizationPrice.toFixed(2)}</p>}
        <h3>TOTAL: ${totalPrice.toFixed(2)}</h3>
      </div>
      
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### Step 8: Backend Service

```java
@Service
public class OrderItemService {
  
  public OrderItem createFromCart(CartItem cartItem, ProductVariant variant) {
    // Get variant price
    BigDecimal variantPrice = variant.getPrice();
    
    // Calculate customization price
    BigDecimal customizationPrice = BigDecimal.ZERO;
    for (Map.Entry<String, String> entry : cartItem.getCustomizations().entrySet()) {
      CustomizationOption option = customizationOptionRepository
        .findById(entry.getValue())
        .orElseThrow();
      customizationPrice = customizationPrice.add(option.getPriceAdjustment());
    }
    
    // Total = variant + customizations
    BigDecimal totalPrice = variantPrice.add(customizationPrice);
    
    return OrderItem.builder()
      .productId(cartItem.getProductId())
      .variantId(cartItem.getVariantId())
      .variantPrice(variantPrice)
      .customizations(cartItem.getCustomizations())
      .customizationPrice(customizationPrice)
      .totalPrice(totalPrice)
      .quantity(cartItem.getQuantity())
      .build();
  }
}
```

---

# Complete JSON Examples

## Coffee Shop - Iced Latte

```json
{
  "id": "p1",
  "businessId": "550cad56",
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
      "helpful": 23
    }
  ],
  
  "variants": [
    {"id": "v1", "name": "Small", "price": 2.50, "sku": "ILATTE-S", "attributes": {"size": "small", "volume": "12oz"}},
    {"id": "v2", "name": "Medium", "price": 3.50, "sku": "ILATTE-M", "attributes": {"size": "medium", "volume": "16oz"}},
    {"id": "v3", "name": "Large", "price": 4.50, "sku": "ILATTE-L", "attributes": {"size": "large", "volume": "20oz"}}
  ],
  
  "relatedProducts": [
    {"id": "p2", "name": "Croissant", "price": 2.00, "imageUrl": "...", "reason": "often-bought-together"}
  ],
  
  "stock": {"enabled": true, "status": "IN_STOCK", "totalQuantity": 150}
}
```

## Restaurant - Lok Lak with Bundle

```json
{
  "id": "p2",
  "businessId": "660cad56",
  "name": "Lok Lak",
  "description": "Cambodian stir-fried beef with lime sauce",
  "price": 6.50,
  "status": "ACTIVE",
  
  "category": {"id": "c2", "name": "Main Dishes"},
  "subcategory": {"id": "s1", "name": "Rice Dishes"},
  "brand": null,
  
  "tags": ["bestseller", "spicy", "traditional"],
  
  "rating": 4.9,
  "reviewCount": 234,
  
  "variants": [
    {
      "id": "v1",
      "name": "Beef - Mild",
      "price": 6.50,
      "sku": "LOKLAK-BEEF-MILD",
      "attributes": {"protein": "beef", "spiceLevel": "mild"},
      "finalPrice": 5.50,
      "stock": {"quantity": 75, "status": "IN_STOCK"}
    },
    {
      "id": "v2",
      "name": "Chicken - Medium",
      "price": 5.50,
      "sku": "LOKLAK-CHICKEN-MEDIUM",
      "attributes": {"protein": "chicken", "spiceLevel": "medium"},
      "finalPrice": 4.50,
      "stock": {"quantity": 60, "status": "IN_STOCK"}
    }
  ]
}
```

## Restaurant Bundle

```json
{
  "id": "bundle-1",
  "businessId": "660cad56",
  "name": "Family Dinner (Serves 4)",
  "description": "Complete meal for family of 4",
  "type": "BUNDLE",
  "status": "ACTIVE",
  
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
      "totalPrice": 13.00
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
  
  "stock": {"enabled": true, "status": "IN_STOCK", "totalQuantity": 80},
  "rating": 4.9,
  "reviewCount": 156
}
```

## Clothing Store - T-Shirt

```json
{
  "id": "p7",
  "businessId": "770cad56",
  "name": "Classic Cotton T-Shirt",
  "description": "Comfortable 100% cotton t-shirt",
  "price": 19.99,
  "status": "ACTIVE",
  
  "category": {"id": "c3", "name": "Apparel"},
  "subcategory": {"id": "s2", "name": "T-Shirts"},
  "brand": {"id": "b1", "name": "Nike"},
  
  "tags": ["new-arrival", "bestseller", "on-sale"],
  
  "rating": 4.7,
  "reviewCount": 892,
  
  "variants": [
    {
      "id": "v1",
      "name": "Red - Small",
      "price": 19.99,
      "sku": "TSHIRT-RED-S",
      "attributes": {"color": "Red", "size": "S", "material": "100% Cotton"},
      "finalPrice": 17.99,
      "stock": {"quantity": 28, "status": "IN_STOCK"}
    },
    {
      "id": "v2",
      "name": "Red - Medium",
      "price": 19.99,
      "sku": "TSHIRT-RED-M",
      "attributes": {"color": "Red", "size": "M", "material": "100% Cotton"},
      "finalPrice": 17.99,
      "stock": {"quantity": 95, "status": "IN_STOCK"}
    },
    {
      "id": "v3",
      "name": "Blue - Small",
      "price": 19.99,
      "sku": "TSHIRT-BLUE-S",
      "attributes": {"color": "Blue", "size": "S", "material": "100% Cotton"},
      "finalPrice": 17.99,
      "stock": {"quantity": 18, "status": "IN_STOCK"}
    }
  ],
  
  "relatedProducts": [
    {"id": "p8", "name": "Performance T-Shirt", "price": 24.99, "reason": "similar-category"},
    {"id": "p9", "name": "Classic Shorts", "price": 29.99, "reason": "often-bought-together"}
  ]
}
```

## Electronics - iPhone

```json
{
  "id": "p10",
  "businessId": "880cad56",
  "name": "iPhone 15 Pro",
  "description": "Latest iPhone with A17 Pro chip",
  "price": 999.99,
  "status": "ACTIVE",
  
  "category": {"id": "c4", "name": "Phones"},
  "subcategory": {"id": "s3", "name": "iPhones"},
  "brand": {"id": "b2", "name": "Apple"},
  
  "tags": ["flagship", "latest", "premium", "5g"],
  
  "rating": 4.8,
  "reviewCount": 1245,
  
  "variants": [
    {
      "id": "v1",
      "name": "128GB - Space Black",
      "price": 999.99,
      "sku": "IPH15PRO-128GB-BK",
      "attributes": {"storage": "128GB", "color": "Space Black", "processor": "A17 Pro"},
      "stock": {"quantity": 85, "status": "IN_STOCK"}
    },
    {
      "id": "v2",
      "name": "256GB - Gold",
      "price": 1099.99,
      "sku": "IPH15PRO-256GB-GOLD",
      "attributes": {"storage": "256GB", "color": "Gold", "processor": "A17 Pro"},
      "stock": {"quantity": 102, "status": "IN_STOCK"}
    },
    {
      "id": "v3",
      "name": "512GB - Silver",
      "price": 1299.99,
      "sku": "IPH15PRO-512GB-SILVER",
      "attributes": {"storage": "512GB", "color": "Silver", "processor": "A17 Pro"},
      "stock": {"quantity": 45, "status": "IN_STOCK"}
    }
  ]
}
```

## Pharmacy - Aspirin (No Variants)

```json
{
  "id": "p13",
  "businessId": "990cad56",
  "name": "Aspirin 500mg",
  "description": "Effective pain reliever and fever reducer",
  "price": 5.99,
  "status": "ACTIVE",
  
  "category": {"id": "c5", "name": "Pain Relief"},
  "subcategory": null,
  "brand": {"id": "b3", "name": "Aspirin"},
  
  "tags": ["pain-relief", "fever-reducer", "popular"],
  
  "rating": 4.6,
  "reviewCount": 342,
  
  "variants": [
    {
      "id": "v1",
      "name": "Default",
      "price": 5.99,
      "sku": "ASPIRIN-500MG-100",
      "attributes": {"strength": "500mg", "quantity": "100 tablets"},
      "stock": {"quantity": 500, "status": "IN_STOCK"}
    }
  ]
}
```

---

# Feature Visibility Control

## How It Works

Business settings control what shows/hides:

```json
{
  "businessId": "550cad56",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false
}
```

## Backend - Conditional Logic

### ProductService.java

```java
@Service
public class ProductService {
  
  public ProductResponse getProductForBusiness(
      UUID productId,
      UUID businessId,
      BusinessSettings settings) {
    
    Product product = productRepository.findById(productId).orElseThrow();
    ProductResponse response = ProductResponse.from(product);
    
    // Hide category if not used
    if (!settings.getUseCategories()) {
      response.setCategory(null);
    }
    
    // Hide subcategory if not used
    if (!settings.getUseSubcategories()) {
      response.setSubcategory(null);
    }
    
    // Hide brand if not used
    if (!settings.getUseBrands()) {
      response.setBrand(null);
    }
    
    return response;
  }
  
  public List<ProductResponse> getProductsByCategory(
      UUID businessId,
      UUID categoryId,
      BusinessSettings settings) {
    
    // Don't return if categories not enabled
    if (!settings.getUseCategories()) {
      return Collections.emptyList();
    }
    
    return productRepository
      .findByBusinessIdAndCategoryIdAndStatus(businessId, categoryId, ACTIVE)
      .stream()
      .map(p -> getProductForBusiness(p.getId(), businessId, settings))
      .toList();
  }
}
```

### CategoryController.java

```java
@GetMapping("/business/{businessId}")
public ResponseEntity<List<CategoryResponse>> getCategories(
    @PathVariable UUID businessId) {
  
  BusinessSettings settings = businessService.getSettings(businessId);
  
  // Return empty if categories not used
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

### BrandController.java

```java
@GetMapping("/business/{businessId}")
public ResponseEntity<List<BrandResponse>> getBrands(
    @PathVariable UUID businessId) {
  
  BusinessSettings settings = businessService.getSettings(businessId);
  
  // Return empty if brands not used
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

## Frontend - Conditional Rendering

### Product Detail Page

```typescript
import { useSelector } from 'react-redux';
import { selectSettings } from '@/redux/features/business/selectors';

export default function ProductDetailPage({ params }) {
  const { data: product } = useQuery(['product', params.id], ...);
  const settings = useSelector(selectSettings);
  
  return (
    <div>
      <h1>{product.name}</h1>
      
      {/* Show category only if enabled */}
      {settings?.useCategories && product.category && (
        <Badge>{product.category.name}</Badge>
      )}
      
      {/* Show subcategory only if enabled */}
      {settings?.useSubcategories && product.subcategory && (
        <span>
          {product.category.name} > {product.subcategory.name}
        </span>
      )}
      
      {/* Show brand only if enabled */}
      {settings?.useBrands && product.brand && (
        <div>
          <img src={product.brand.imageUrl} />
          <p>Brand: {product.brand.name}</p>
        </div>
      )}
      
      {/* Variants always show if available */}
      {product.variants?.length > 0 && (
        <VariantSelector variants={product.variants} />
      )}
      
      <button onClick={() => addToCart(product)}>Add to Cart</button>
    </div>
  );
}
```

### Header Navigation

```typescript
import { useSelector } from 'react-redux';
import { selectSettings } from '@/redux/features/business/selectors';

export function Header() {
  const { data: categories } = useQuery(['categories', businessId], ...);
  const settings = useSelector(selectSettings);
  
  return (
    <header>
      <nav>
        <Link href="/">Home</Link>
        
        {/* Show categories dropdown only if enabled */}
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
        
        {/* Show brands link only if enabled */}
        {settings?.useBrands && (
          <Link href="/brands">Brands</Link>
        )}
        
        <SearchBar />
        <CartIcon />
      </nav>
    </header>
  );
}
```

### Product Card

```typescript
interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const settings = useSelector(selectSettings);
  
  return (
    <Card>
      <img src={product.imageUrl} />
      <h3>{product.name}</h3>
      
      {/* Show category badge only if enabled */}
      {settings?.useCategories && product.category && (
        <Badge>{product.category.name}</Badge>
      )}
      
      {/* Show brand badge only if enabled */}
      {settings?.useBrands && product.brand && (
        <Badge>{product.brand.name}</Badge>
      )}
      
      <p>${product.price}</p>
      <StarRating rating={product.rating} />
      <button>Add to Cart</button>
    </Card>
  );
}
```

### Admin Form

```typescript
export function ProductEditForm({ product, businessId }) {
  const settings = useSelector(selectSettings);
  
  return (
    <form>
      <input placeholder="Product Name" />
      
      {/* Show category field only if enabled */}
      {settings?.useCategories && (
        <Select label="Category">
          {categories.map(c => (
            <option key={c.id}>{c.name}</option>
          ))}
        </Select>
      )}
      
      {/* Show subcategory field only if enabled */}
      {settings?.useSubcategories && (
        <Select label="Subcategory">
          {subcategories.map(sc => (
            <option key={sc.id}>{sc.name}</option>
          ))}
        </Select>
      )}
      
      {/* Show brand field only if enabled */}
      {settings?.useBrands && (
        <Select label="Brand">
          {brands.map(b => (
            <option key={b.id}>{b.name}</option>
          ))}
        </Select>
      )}
      
      <VariantManager />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Redux Store

```typescript
// business-slice.ts
const initialState = {
  settings: {
    useCategories: true,
    useSubcategories: false,
    useBrands: true
  }
};

export const selectSettings = (state) => state.business.settings;
export const selectUseCategories = (state) => state.business.settings.useCategories;
export const selectUseSubcategories = (state) => state.business.settings.useSubcategories;
export const selectUseBrands = (state) => state.business.settings.useBrands;
```

---

# System Architecture

## Technology Stack

```
Frontend:    Next.js 14 + React 18 + TypeScript + Redux + Tailwind CSS
Backend:     Spring Boot 3 + Java 17 + Spring Data JPA
Database:    PostgreSQL 14+
Auth:        JWT Tokens
API:         REST (JSON)
Images:      CDN or Cloud Storage
Migrations:  Flyway
```

## System Diagram

```
┌──────────────────────────────────────────────┐
│         Customer Browser                     │
│  (Desktop, Mobile, Responsive)               │
└──────────────────┬───────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │  CDN / Images       │
        │  (Image Hosting)    │
        └─────────────────────┘
                   │
        ┌──────────▼──────────────────┐
        │   FRONTEND (Next.js React)  │
        │                             │
        │  ├─ Pages                   │
        │  ├─ Components              │
        │  ├─ Redux State             │
        │  ├─ API Services            │
        │  └─ Utilities               │
        │                             │
        └──────────┬──────────────────┘
                   │
           (REST API Calls)
                   │
        ┌──────────▼──────────────────┐
        │  BACKEND (Spring Boot)      │
        │                             │
        │  ├─ Controllers             │
        │  ├─ Services               │
        │  ├─ Repositories            │
        │  ├─ Entities                │
        │  ├─ DTOs                    │
        │  └─ Security (JWT)          │
        │                             │
        └──────────┬──────────────────┘
                   │
            (SQL Queries)
                   │
        ┌──────────▼──────────────────┐
        │   DATABASE (PostgreSQL)     │
        │                             │
        │  ├─ Products                │
        │  ├─ Categories              │
        │  ├─ Brands                  │
        │  ├─ Orders                  │
        │  ├─ Users                   │
        │  └─ Settings                │
        │                             │
        └─────────────────────────────┘
```

---

# Database Schema

## Core Tables

```sql
-- Businesses
CREATE TABLE businesses (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(500),
  website VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business Settings (Feature Flags)
CREATE TABLE business_settings (
  id UUID PRIMARY KEY,
  business_id UUID UNIQUE NOT NULL REFERENCES businesses(id),
  use_categories BOOLEAN DEFAULT true,
  use_subcategories BOOLEAN DEFAULT false,
  use_brands BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP
);

-- Subcategories
CREATE TABLE subcategories (
  id UUID PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP
);

-- Brands
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  created_at TIMESTAMP
);

-- Products
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
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Product Variants (Sizes, Options)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  name VARCHAR(255),
  price DECIMAL(10, 2),
  sku VARCHAR(255),
  attributes JSONB,
  created_at TIMESTAMP
);

-- Product Customizations
CREATE TABLE product_customizations (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  customization_key VARCHAR(100),
  name VARCHAR(255),
  customization_type VARCHAR(50),
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

-- Customization Options
CREATE TABLE customization_options (
  id UUID PRIMARY KEY,
  customization_id UUID REFERENCES product_customizations(id),
  option_key VARCHAR(100),
  option_name VARCHAR(255),
  price_adjustment DECIMAL(10, 2),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP
);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  image_url VARCHAR(500),
  is_primary BOOLEAN DEFAULT false,
  alt_text VARCHAR(255),
  created_at TIMESTAMP
);

-- Product Reviews
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP
);

-- Product Tags
CREATE TABLE product_tags (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  tag VARCHAR(100),
  created_at TIMESTAMP
);

-- Related Products
CREATE TABLE related_products (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products(id),
  related_product_id UUID REFERENCES products(id),
  reason VARCHAR(50),
  created_at TIMESTAMP,
  UNIQUE(product_id, related_product_id)
);

-- Product Bundles
CREATE TABLE product_bundles (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  name VARCHAR(255),
  description TEXT,
  bundle_price DECIMAL(10, 2),
  regular_price DECIMAL(10, 2),
  status VARCHAR(50),
  created_at TIMESTAMP
);

-- Bundle Items
CREATE TABLE bundle_items (
  id UUID PRIMARY KEY,
  bundle_id UUID REFERENCES product_bundles(id),
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER,
  created_at TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  business_id UUID REFERENCES businesses(id),
  user_id UUID REFERENCES users(id),
  status VARCHAR(50),
  total_price DECIMAL(10, 2),
  discount_amount DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER,
  unit_price DECIMAL(10, 2),
  customizations JSONB,
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP
);

-- Shopping Cart
CREATE TABLE shopping_carts (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID REFERENCES shopping_carts(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER,
  customizations JSONB,
  created_at TIMESTAMP
);
```

---

# API Endpoints

## Product Endpoints

```
GET    /api/products                         - List all
GET    /api/products/{id}                    - Get single
POST   /api/products                         - Create (admin)
PUT    /api/products/{id}                    - Update (admin)
DELETE /api/products/{id}                    - Delete (admin)

GET    /api/products/{id}/reviews            - Get reviews
POST   /api/products/{id}/reviews            - Create review
GET    /api/products/{id}/images             - Get images
POST   /api/products/{id}/images             - Upload image
GET    /api/products/{id}/related            - Get related products

GET    /api/products/filter?tags=...         - Filter by tags
GET    /api/products/filter?minPrice=...     - Filter by price
GET    /api/products/search?q=...            - Search
```

## Category Endpoints

```
GET    /api/categories/business/{businessId} - List for business
GET    /api/categories/{id}                  - Get single
POST   /api/categories                       - Create (admin)
PUT    /api/categories/{id}                  - Update (admin)
DELETE /api/categories/{id}                  - Delete (admin)
```

## Brand Endpoints

```
GET    /api/brands/business/{businessId}     - List for business
GET    /api/brands/{id}                      - Get single
POST   /api/brands                           - Create (admin)
PUT    /api/brands/{id}                      - Update (admin)
DELETE /api/brands/{id}                      - Delete (admin)
```

## Bundle Endpoints

```
GET    /api/bundles/business/{businessId}    - List bundles
GET    /api/bundles/{id}                     - Get bundle details
POST   /api/bundles                          - Create (admin)
PUT    /api/bundles/{id}                     - Update (admin)
DELETE /api/bundles/{id}                     - Delete (admin)
```

## Customization Endpoints

```
GET    /api/customizations/{productId}       - Get customization options
POST   /api/customizations                   - Create (admin)
PUT    /api/customizations/{id}              - Update (admin)
DELETE /api/customizations/{id}              - Delete (admin)
```

## Business Settings Endpoints

```
GET    /api/business-settings/{businessId}   - Get settings
PUT    /api/business-settings/{businessId}   - Update settings (admin)
```

## Order Endpoints

```
GET    /api/orders                           - List user orders
GET    /api/orders/{id}                      - Get order details
POST   /api/orders                           - Create order
PUT    /api/orders/{id}                      - Update order status (admin)

GET    /api/admin/orders                     - List all orders (admin)
PUT    /api/admin/orders/{id}/status         - Update status (admin)
```

## Cart Endpoints

```
GET    /api/cart                             - Get current cart
POST   /api/cart/items                       - Add item
PUT    /api/cart/items/{itemId}              - Update item
DELETE /api/cart/items/{itemId}              - Remove item
DELETE /api/cart                             - Clear cart
```

---

# Implementation Checklist

## Phase 1: Database (1-2 days)
- [ ] Create Flyway migration file
- [ ] Add columns to business_settings (useCategories, useSubcategories, useBrands)
- [ ] Create product_customizations table
- [ ] Create customization_options table
- [ ] Create product_images table
- [ ] Create product_reviews table
- [ ] Create product_tags table
- [ ] Create related_products table
- [ ] Create product_bundles table
- [ ] Create bundle_items table

## Phase 2: Backend Entities (1-2 days)
- [ ] Create ProductCustomization.java
- [ ] Create CustomizationOption.java
- [ ] Create ProductImage.java
- [ ] Create ProductReview.java
- [ ] Create ProductTag.java
- [ ] Create RelatedProduct.java
- [ ] Create ProductBundle.java
- [ ] Create BundleItem.java
- [ ] Update Product.java (add new fields)
- [ ] Update BusinessSettings.java (add flags)

## Phase 3: Repositories (1 day)
- [ ] Create ProductCustomizationRepository.java
- [ ] Create CustomizationOptionRepository.java
- [ ] Create ProductImageRepository.java
- [ ] Create ProductReviewRepository.java
- [ ] Create ProductTagRepository.java
- [ ] Create RelatedProductRepository.java
- [ ] Create ProductBundleRepository.java
- [ ] Create BundleItemRepository.java

## Phase 4: Services (2 days)
- [ ] Update ProductService (add getProductForBusiness, filtering)
- [ ] Create ProductCustomizationService.java
- [ ] Create ProductImageService.java
- [ ] Create ProductReviewService.java
- [ ] Create ProductBundleService.java
- [ ] Create ProductFilterService.java

## Phase 5: API Endpoints (2 days)
- [ ] Create/update ProductController (20+ endpoints)
- [ ] Create CategoryController (conditional logic)
- [ ] Create BrandController (conditional logic)
- [ ] Create ProductCustomizationController.java
- [ ] Create ProductReviewController.java
- [ ] Create BundleController.java
- [ ] Create BusinessSettingsController.java

## Phase 6: Frontend Components (3 days)
- [ ] Create ProductGallery.tsx (image carousel)
- [ ] Create ProductCustomizer.tsx (size + customizations)
- [ ] Create ProductReviewSection.tsx
- [ ] Create ProductReviewForm.tsx
- [ ] Create ProductFilters.tsx
- [ ] Create PriceRangeFilter.tsx
- [ ] Create TagFilter.tsx
- [ ] Create BundleCard.tsx
- [ ] Update ProductCard.tsx (conditional rendering)
- [ ] Update ProductDetailPage.tsx
- [ ] Update ProductsPage.tsx (add filters)

## Phase 7: Redux (1 day)
- [ ] Update business-slice.ts (add feature flags)
- [ ] Create filters-slice.ts (store filters)
- [ ] Create reviews-slice.ts (store reviews)
- [ ] Create bundles-slice.ts (store bundles)
- [ ] Create selectors for all

## Phase 8: Admin Features (2 days)
- [ ] Create admin product form (conditional fields)
- [ ] Create admin customizations form
- [ ] Create business settings page (toggles)
- [ ] Create bundle management page

## Phase 9: Testing & Deployment (3 days)
- [ ] Unit tests for all services
- [ ] Integration tests for APIs
- [ ] End-to-end tests for customer flow
- [ ] Performance testing
- [ ] Security review
- [ ] Deploy to staging
- [ ] Final testing & deploy to production

---

## Total Timeline

**9 Phases × 2-7 days per phase = 4-6 weeks**

---

# Summary

This document covers:

✅ **7 Business Types** - Coffee, Restaurant, Clothing, Electronics, Pharmacy, Grocery, Car Rental
✅ **Complete JSON Examples** - Real-world API responses for each
✅ **Size + Customizations** - How to handle sugar, milk, shots in coffee shop
✅ **Feature Visibility** - Exactly WHERE and HOW to hide/show features
✅ **Database Schema** - Complete SQL for all tables
✅ **API Endpoints** - 50+ endpoints needed
✅ **Frontend Components** - React patterns for conditional rendering
✅ **Implementation Checklist** - 9 phases, 4-6 weeks total

---

**Ready to build?** Start with Phase 1 (Database) 🚀

