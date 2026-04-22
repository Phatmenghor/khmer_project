# Product Customizations & Add-ons Implementation Guide

## Overview

Product customizations (add-ons) allow customers to personalize products with price adjustments. This is fully integrated with the feature visibility control system and supports any business type.

---

## System Architecture

### Models

#### ProductCustomizationGroup
Groups of customization options for a product
```java
- id: UUID
- productId: UUID (foreign key)
- name: String (e.g., "Size", "Temperature", "Milk Type")
- description: String
- isRequired: Boolean (customer must select one)
- allowMultiple: Boolean (customer can select multiple)
- sortOrder: Integer (display order)
- status: String (ACTIVE/INACTIVE)
```

#### ProductCustomization
Individual add-on option with price adjustment
```java
- id: UUID
- productCustomizationGroupId: UUID (foreign key)
- name: String (e.g., "Extra Shot", "Oat Milk", "Add Protein")
- description: String
- priceAdjustment: BigDecimal (price change: +$0.50, +$1.00, etc.)
- sortOrder: Integer (display order)
- status: String (ACTIVE/INACTIVE)
```

---

## Business Examples

### ☕ Coffee Shop

**Product:** "Iced Latte"
**Base Price:** $3.50

**Customization Groups:**

1. **Size** (Required, Single Select)
   - Small (Base size)
   - Medium: +$0.50
   - Large: +$1.00

2. **Extra Shots** (Optional, Multiple)
   - Add 1 Extra Shot: +$0.50
   - Add 2 Extra Shots: +$1.00
   - Add 3 Extra Shots: +$1.50

3. **Milk Type** (Optional, Single Select)
   - Regular Milk (included)
   - Oat Milk: +$0.75
   - Almond Milk: +$0.75
   - Soy Milk: +$0.75

4. **Sweeteners** (Optional, Multiple)
   - Add Honey: +$0.25
   - Add Caramel Syrup: +$0.50
   - Add Vanilla Syrup: +$0.50

**Customer Order Example:**
```json
{
  "productId": "latte-123",
  "quantity": 1,
  "basePrice": 3.50,
  "selectedCustomizations": [
    {
      "groupId": "size-group",
      "groupName": "Size",
      "selectedOption": {
        "id": "large-option",
        "name": "Large",
        "priceAdjustment": 1.00
      }
    },
    {
      "groupId": "shots-group",
      "groupName": "Extra Shots",
      "selectedOptions": [
        {
          "id": "shot-1",
          "name": "Add 1 Extra Shot",
          "priceAdjustment": 0.50
        },
        {
          "id": "shot-2",
          "name": "Add 2 Extra Shots",
          "priceAdjustment": 1.00
        }
      ]
    },
    {
      "groupId": "milk-group",
      "groupName": "Milk Type",
      "selectedOption": {
        "id": "oat-milk",
        "name": "Oat Milk",
        "priceAdjustment": 0.75
      }
    }
  ],
  "totalAdjustment": 3.25,
  "finalPrice": 6.75
}
```

### 👕 Clothing Store

**Product:** "Classic Cotton T-Shirt"
**Base Price:** $19.99

**Customization Groups:**

1. **Size** (Required, Single Select)
   - XS/S/M/L/XL/XXL (No charge)

2. **Color** (Required, Single Select)
   - Black/White/Navy/Gray/Red (No charge)

3. **Custom Embroidery** (Optional, Single Select)
   - Add Name Embroidery: +$5.00
   - Add Logo Embroidery: +$8.00
   - Add Custom Design: +$12.00

4. **Gift Wrapping** (Optional, Single Select)
   - Basic Gift Wrap: +$2.00
   - Premium Gift Wrap: +$4.00

**Customer Order Example:**
```json
{
  "productId": "tshirt-456",
  "quantity": 1,
  "basePrice": 19.99,
  "selectedCustomizations": [
    {
      "groupId": "size",
      "selectedOption": {
        "name": "Large",
        "priceAdjustment": 0.00
      }
    },
    {
      "groupId": "color",
      "selectedOption": {
        "name": "Navy",
        "priceAdjustment": 0.00
      }
    },
    {
      "groupId": "embroidery",
      "selectedOption": {
        "name": "Add Name Embroidery",
        "priceAdjustment": 5.00
      }
    }
  ],
  "totalAdjustment": 5.00,
  "finalPrice": 24.99
}
```

### 🍔 Restaurant (Burger)

**Product:** "Gourmet Burger"
**Base Price:** $12.99

**Customization Groups:**

1. **Meat Cooking** (Optional, Single Select)
   - Rare: No charge
   - Medium-Rare: No charge
   - Medium: No charge
   - Medium-Well: No charge
   - Well-Done: No charge

2. **Meat Type** (Optional, Single Select)
   - Beef (included)
   - Turkey Patty: +$1.50
   - Chicken Patty: +$2.00
   - Veggie Patty: +$2.00
   - Beyond Meat: +$3.00

3. **Sides** (Optional, Multiple)
   - Upgrade Fries to Sweet Potato: +$1.00
   - Add Cheese: +$0.50
   - Add Bacon: +$2.00
   - Add Grilled Onions: +$0.75
   - Add Mushrooms: +$0.75

4. **Sauces** (Optional, Multiple)
   - Add Aioli: No charge
   - Add Sriracha Mayo: No charge
   - Add BBQ Sauce: No charge

**Customer Order Example:**
```json
{
  "productId": "burger-789",
  "quantity": 1,
  "basePrice": 12.99,
  "selectedCustomizations": [
    {
      "groupId": "cooking",
      "selectedOption": {
        "name": "Medium",
        "priceAdjustment": 0.00
      }
    },
    {
      "groupId": "meat-type",
      "selectedOption": {
        "name": "Beyond Meat",
        "priceAdjustment": 3.00
      }
    },
    {
      "groupId": "sides",
      "selectedOptions": [
        {
          "name": "Upgrade Fries to Sweet Potato",
          "priceAdjustment": 1.00
        },
        {
          "name": "Add Bacon",
          "priceAdjustment": 2.00
        },
        {
          "name": "Add Mushrooms",
          "priceAdjustment": 0.75
        }
      ]
    }
  ],
  "totalAdjustment": 6.75,
  "finalPrice": 19.74
}
```

---

## API Endpoints

### Protected Endpoints (Admin/Manager)

#### Customization Groups

```
POST   /api/v1/product-customizations/groups
       Create customization group
       Request: ProductCustomizationGroupCreateDto
       Response: ProductCustomizationGroupDto

GET    /api/v1/product-customizations/groups/product/{productId}
       Get all customization groups for a product
       Response: List<ProductCustomizationGroupDto>

GET    /api/v1/product-customizations/groups/{groupId}
       Get specific customization group
       Response: ProductCustomizationGroupDto

PUT    /api/v1/product-customizations/groups/{groupId}
       Update customization group
       Request: ProductCustomizationGroupCreateDto
       Response: ProductCustomizationGroupDto

DELETE /api/v1/product-customizations/groups/{groupId}
       Delete customization group
       Response: Void
```

#### Customization Options

```
POST   /api/v1/product-customizations
       Create customization option
       Request: ProductCustomizationCreateDto
       Response: ProductCustomizationDto

GET    /api/v1/product-customizations/{customizationId}
       Get specific customization
       Response: ProductCustomizationDto

PUT    /api/v1/product-customizations/{customizationId}
       Update customization
       Request: ProductCustomizationCreateDto
       Response: ProductCustomizationDto

DELETE /api/v1/product-customizations/{customizationId}
       Delete customization
       Response: Void
```

### Public Endpoints (Customer)

```
GET    /api/v1/public/product-customizations/product/{productId}
       Get customizations for product (for ordering)
       Response: List<ProductCustomizationGroupDto>

GET    /api/v1/public/product-customizations/groups/{groupId}
       Get customization group details
       Response: ProductCustomizationGroupDto
```

---

## Data Structures

### Request: ProductCustomizationGroupCreateDto
```json
{
  "productId": "uuid",
  "name": "Size",
  "description": "Select your preferred size",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

### Request: ProductCustomizationCreateDto
```json
{
  "productCustomizationGroupId": "uuid",
  "name": "Large",
  "description": "16oz cup",
  "priceAdjustment": 0.50,
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

### Response: ProductCustomizationGroupDto
```json
{
  "id": "uuid",
  "productId": "uuid",
  "name": "Size",
  "description": "Select your preferred size",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 1,
  "status": "ACTIVE",
  "customizations": [
    {
      "id": "uuid",
      "productCustomizationGroupId": "uuid",
      "name": "Small",
      "description": "12oz cup",
      "priceAdjustment": 0.00,
      "sortOrder": 1,
      "status": "ACTIVE"
    },
    {
      "id": "uuid",
      "productCustomizationGroupId": "uuid",
      "name": "Large",
      "description": "16oz cup",
      "priceAdjustment": 0.50,
      "sortOrder": 2,
      "status": "ACTIVE"
    }
  ]
}
```

---

## Feature Visibility Integration

### How Customizations Relate to Feature Flags

**Key Point:** Customizations are **product-specific** and always visible when the product is visible.

| Feature Flag | Affects |
|--------------|---------|
| `useCategories` | Product visibility in category filters |
| `useSubcategories` | Product visibility in subcategory filters |
| `useBrands` | Product visibility in brand filters |
| **Customizations** | **Always shown with the product** |

**Example Flow:**
```
1. Product "Iced Latte" belongs to category "Iced Beverages"
2. Coffee shop has useCategories=true, useBrands=false
3. Customer requests: GET /api/v1/public/products/{id}
   - Product is returned ✅
   - Customization groups are included ✅
   
4. Customer requests: GET /api/v1/public/products/all?brandId=...
   - Business has useBrands=false
   - Return empty list ❌
   - Customizations not shown (product not shown)
```

---

## Implementation Status

### Models (✅ Complete)
- [x] ProductCustomizationGroup
- [x] ProductCustomization

### DTOs (✅ Complete)
- [x] ProductCustomizationGroupCreateDto
- [x] ProductCustomizationCreateDto
- [x] ProductCustomizationGroupDto
- [x] ProductCustomizationDto

### Controllers (✅ Structure Created, Service Layer TODO)
- [x] ProductCustomizationController (Protected)
- [x] PublicProductCustomizationController (Public)

### Database (✅ Migration Created)
- [x] V7__add_product_customizations.sql
- Tables: product_customization_groups, product_customizations
- Indexes: product_id, group_id, status

### Service Layer (⏳ TODO)
- [ ] ProductCustomizationService
- [ ] ProductCustomizationGroupService
- [ ] Customization mappers/converters
- [ ] Price calculation logic in OrderService

### Integration (⏳ TODO)
- [ ] OrderItem to support selected customizations
- [ ] CartItem to support customization selections
- [ ] OrderCheckout to calculate prices with customizations
- [ ] Product detail endpoint to include customization groups

---

## Testing Scenarios

### Scenario 1: Coffee Shop Order with Customizations
```
1. GET /api/v1/public/products/latte-123
   Response includes customization groups:
   - Size (required, single)
   - Extra Shots (optional, multiple)
   - Milk Type (optional, single)
   - Sweeteners (optional, multiple)

2. POST /api/v1/orders/checkout
   Request:
   {
     "items": [
       {
         "productId": "latte-123",
         "quantity": 2,
         "selectedCustomizations": [
           {
             "groupId": "size",
             "selectedOption": { "id": "large", "priceAdjustment": 1.00 }
           },
           {
             "groupId": "shots",
             "selectedOptions": [
               { "id": "shot-1", "priceAdjustment": 0.50 }
             ]
           },
           {
             "groupId": "milk",
             "selectedOption": { "id": "oat", "priceAdjustment": 0.75 }
           }
         ]
       }
     ]
   }
   
   Response: Order total = 2 × (3.50 + 1.00 + 0.50 + 0.75) = $11.50
```

### Scenario 2: Clothing Store with Optional Customizations
```
1. GET /api/v1/public/products/tshirt-456
   Response includes customization groups:
   - Size (required, single)
   - Color (required, single)
   - Custom Embroidery (optional, single)
   - Gift Wrapping (optional, single)

2. POST /api/v1/orders/checkout
   Customer selects:
   - Size: Large
   - Color: Navy
   - Embroidery: Add Name (+$5.00)
   (No gift wrap selected)
   
   Response: Order total = 19.99 + 5.00 = $24.99
```

---

## Migration Path

### Step 1: Create Database Tables
```bash
# Applied via Flyway migration: V7__add_product_customizations.sql
# Tables: product_customization_groups, product_customizations
```

### Step 2: Implement Service Layer
```bash
# Create services for CRUD operations
# ProductCustomizationGroupService
# ProductCustomizationService
```

### Step 3: Implement Controllers (Already Done)
```bash
# Controllers are scaffolded, service injection complete
# ProductCustomizationController
# PublicProductCustomizationController
```

### Step 4: Integrate with Orders
```bash
# Extend OrderItem to support customization selections
# Extend CartItem to support customization selections
# Update OrderService to calculate prices with customizations
```

### Step 5: Test End-to-End
```bash
# Test ordering with customizations
# Test price calculations
# Test different business types (coffee, clothing, restaurant)
```

---

## Future Enhancements

1. **Customization Variants**
   - Per-size customizations (e.g., only medium/large get extra shots)
   - Per-category customizations
   - Seasonal customizations

2. **Advanced Pricing**
   - Percentage-based adjustments
   - Bulk customization discounts
   - Required + optional bundled pricing

3. **Business Analytics**
   - Track most popular customizations
   - Revenue impact by customization
   - Customer preference patterns

4. **Customer Preferences**
   - Save favorite customization combinations
   - One-click ordering with saved customizations
   - Customization recommendations

5. **Image Support**
   - Add images to customization options
   - Visual size guides
   - Color swatches

---

## Support Matrix by Business Type

| Business Type | Use Cases | Customization Examples |
|---------------|-----------|------------------------|
| **Coffee Shop** | ☕ Size, Shots, Milk, Sweeteners | Add extra shot (+$0.50) |
| **Restaurant** | 🍔 Cook level, Meat type, Sides | Beyond Meat (+$3.00) |
| **Clothing** | 👕 Size, Color, Embroidery | Custom embroidery (+$5.00) |
| **Pharmacy** | 💊 Quantity, Formulation | N/A (not typical) |
| **Bookstore** | 📚 Edition, Cover, Personalization | Signed copy (+$10.00) |

---

**Status:** ✅ Structure Complete, ⏳ Service Layer Pending  
**Database Version:** V7  
**Last Updated:** 2026-04-22

