# Product Customizations Guide

Simple, flexible customization system with **Size + Add-ons** pattern.

---

## Overview

Every product can have:
1. **Primary Option** (Size, Portion, Style) - Required, single-select
2. **Add-ons** (Extras, Toppings, Modifications) - Optional, multi-select

**Example:**
```
Iced Latte ($3.50)
├── SIZE (required): Small, Medium, Large
└── ADD-ONS (optional): Extra Shot, Oat Milk, Sugar, Whipped Cream
```

---

## Core Concepts

### ProductCustomizationGroup
Container for a set of related options.

**Fields:**
- `id`: UUID (unique identifier)
- `productId`: UUID (which product)
- `name`: String (e.g., "Size", "Add-ons")
- `description`: String (e.g., "Choose your drink size")
- `isRequired`: Boolean (must select at least one)
- `allowMultiple`: Boolean (can select multiple options)
- `sortOrder`: Integer (display order)
- `status`: String (ACTIVE/INACTIVE)

### ProductCustomization
Individual option within a group.

**Fields:**
- `id`: UUID
- `productCustomizationGroupId`: UUID (which group)
- `name`: String (e.g., "Medium", "Extra Shot")
- `description`: String (optional)
- `priceAdjustment`: BigDecimal (e.g., "+0.50")
- `sortOrder`: Integer (display order)
- `status`: String (ACTIVE/INACTIVE)

---

## The Simple Pattern

### 1. Primary Selection (Required, Single-Select)

Choose **one** from a set of options:

```json
{
  "name": "Size",
  "isRequired": true,
  "allowMultiple": false,
  "options": [
    {"name": "Small", "priceAdjustment": "0.00"},
    {"name": "Medium", "priceAdjustment": "0.50"},
    {"name": "Large", "priceAdjustment": "1.00"}
  ]
}
```

**Customer sees:**
```
SIZE (Required):
○ Small    +$0.00
◉ Medium   +$0.50
○ Large    +$1.00
```

---

### 2. Add-ons (Optional, Multi-Select)

Choose **any number** of additions:

```json
{
  "name": "Add-ons",
  "isRequired": false,
  "allowMultiple": true,
  "options": [
    {"name": "Extra Shot", "priceAdjustment": "0.50"},
    {"name": "Oat Milk", "priceAdjustment": "0.75"},
    {"name": "Extra Sugar", "priceAdjustment": "0.25"},
    {"name": "Whipped Cream", "priceAdjustment": "0.50"}
  ]
}
```

**Customer sees:**
```
ADD-ONS (Optional):
☐ Extra Shot    +$0.50
☑ Oat Milk      +$0.75
☑ Extra Sugar   +$0.25
☐ Whipped Cream +$0.50
```

---

## Business Type Examples

### ☕ Coffee Shop

**Product:** Iced Latte ($3.50)
- **Size** (required): Small, Medium, Large
- **Add-ons** (optional): Extra Shot, Milk Type, Sugar, Whipped Cream

---

### 🍔 Restaurant

**Product:** Classic Burger ($12.00)
- **Protein** (required): Beef, Chicken, Veggie, Beyond Meat
- **Add-ons** (optional): Bacon, Cheese, Fried Egg, Mushrooms, Fries

---

### 👕 Clothing

**Product:** T-Shirt ($25.00)
- **Size** (required): XS, S, M, L, XL, XXL
- **Add-ons** (optional): Custom Color, Embroidery, Gift Wrap

---

### 💊 Pharmacy

**Product:** Vitamin D ($15.00)
- **Quantity** (required): 30 tablets, 60 tablets, 100 tablets
- **Add-ons** (optional): Extended Warranty, Consultation

---

### 📚 Bookstore

**Product:** Fiction Novel ($18.00)
- **Binding** (required): Paperback, Hardcover, E-book
- **Add-ons** (optional): Bookplate, Gift Wrap, Signed Edition

---

## API Usage

### Create Primary Group

```bash
POST /api/v1/product-customizations/groups
{
  "productId": "prod-123",
  "name": "Size",
  "description": "Choose your size",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

### Add Options to Group

```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-456",
  "name": "Medium",
  "description": "16 oz",
  "priceAdjustment": "0.50",
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

### Create Add-ons Group

```bash
POST /api/v1/product-customizations/groups
{
  "productId": "prod-123",
  "name": "Add-ons",
  "description": "Add extras",
  "isRequired": false,
  "allowMultiple": true,
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

### Get Product Customizations

```bash
GET /api/v1/public/product-customizations/product/prod-123
```

**Response:** Returns both groups with all options

---

## Admin Workflow

1. Create product (Iced Latte, $3.50)
2. Add "Size" group
   - Add options: Small, Medium, Large
3. Add "Add-ons" group
   - Add options: Extra Shot, Oat Milk, Sugar, Whipped Cream
4. **Done!** Product is customizable

---

## Customer Workflow

1. See product: Iced Latte $3.50
2. Select Size: Medium (+$0.50)
3. Select Add-ons: Oat Milk (+$0.75), Extra Sugar (+$0.25)
4. See Total: $5.00
5. Add to Cart (Phase 1)

---

## Price Calculation

```
Base Price:              $3.50
+ Medium Size:           $0.50
+ Oat Milk (add-on):     $0.75
+ Extra Sugar (add-on):  $0.25
─────────────────────────────
Total:                   $5.00
```

---

## Key Features

✅ **Simple** - Just 2 groups per product  
✅ **Flexible** - Any type of option (sizes, toppings, add-ons)  
✅ **Dynamic** - Admin can add/edit/delete options anytime  
✅ **Scalable** - Works for all 5 business types  
✅ **Multi-select** - Customers can choose multiple add-ons  
✅ **Price Adjustable** - Each option has its own price  

---

## Phase 1: Order Integration (Upcoming)

When Phase 1 completes:
- Customizations will be stored in cart_items table
- Each cart item will contain: selectedCustomizations (JSON) + customizationAdjustment (price)
- Orders will persist customer's customization choices
- Final price will be pre-calculated

---

## Related Documentation

- [System Architecture](../architecture/SYSTEM_ARCHITECTURE.md)
- [Coffee Shop Example](../examples/COFFEE_SHOP.md)
- [Restaurant Example](../examples/RESTAURANT.md)
- [Clothing Store Example](../examples/CLOTHING_STORE.md)
- [API Examples](../api/CUSTOMIZATION_EXAMPLES.json)

---

**Generated:** 2026-04-22  
**Pattern:** Size + Add-ons (Simple, Dynamic, Flexible)  
**Status:** Phase 0 Complete, Ready for Phase 1
