# ☕ Coffee Shop - Size + Add-ons Example

Simple customization pattern: Choose size, then add optional extras.

---

## Business Settings

```json
{
  "businessId": "coffee-shop-123",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false
}
```

---

## Product: Iced Latte ($3.50)

### Customer UI Experience

```
┌──────────────────────────────┐
│  Iced Latte                  │
│  Base: $3.50                 │
├──────────────────────────────┤
│ SIZE (Required):             │
│ ○ Small    +$0.00            │
│ ◉ Medium   +$0.50            │
│ ○ Large    +$1.00            │
├──────────────────────────────┤
│ ADD-ONS (Optional):          │
│ ☐ Extra Shot    +$0.50       │
│ ☑ Oat Milk      +$0.75       │
│ ☑ Extra Sugar   +$0.25       │
│ ☐ Whipped Cream +$0.50       │
├──────────────────────────────┤
│ Total: $5.00                 │
│ [Add to Cart]                │
└──────────────────────────────┘
```

---

## Backend Setup

### 1. Create Product
```bash
POST /api/v1/products
{
  "name": "Iced Latte",
  "categoryId": "cat-beverages-123",
  "description": "Refreshing iced coffee",
  "price": "3.50",
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod-latte-456",
    "name": "Iced Latte",
    "price": "3.50"
  }
}
```

---

### 2. Create Size Group (Required, Single-Select)

```bash
POST /api/v1/product-customizations/groups
{
  "productId": "prod-latte-456",
  "name": "Size",
  "description": "Choose your drink size",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "group-size-789",
    "name": "Size",
    "isRequired": true,
    "allowMultiple": false
  }
}
```

---

### 3. Add Size Options

**Small:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-789",
  "name": "Small",
  "description": "12 oz",
  "priceAdjustment": "0.00",
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

**Medium:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-789",
  "name": "Medium",
  "description": "16 oz",
  "priceAdjustment": "0.50",
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

**Large:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-789",
  "name": "Large",
  "description": "20 oz",
  "priceAdjustment": "1.00",
  "sortOrder": 3,
  "status": "ACTIVE"
}
```

---

### 4. Create Add-ons Group (Optional, Multi-Select)

```bash
POST /api/v1/product-customizations/groups
{
  "productId": "prod-latte-456",
  "name": "Add-ons",
  "description": "Add extras to your drink",
  "isRequired": false,
  "allowMultiple": true,
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "group-addons-101",
    "name": "Add-ons",
    "isRequired": false,
    "allowMultiple": true
  }
}
```

---

### 5. Add Add-on Options

**Extra Shot:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-101",
  "name": "Extra Shot",
  "description": "Add espresso shot",
  "priceAdjustment": "0.50",
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

**Oat Milk:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-101",
  "name": "Oat Milk",
  "description": "Substitute with oat milk",
  "priceAdjustment": "0.75",
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

**Extra Sugar:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-101",
  "name": "Extra Sugar",
  "description": "Add extra sweetness",
  "priceAdjustment": "0.25",
  "sortOrder": 3,
  "status": "ACTIVE"
}
```

**Whipped Cream:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-101",
  "name": "Whipped Cream",
  "description": "Top with whipped cream",
  "priceAdjustment": "0.50",
  "sortOrder": 4,
  "status": "ACTIVE"
}
```

---

## Customer Gets Product

### Request:
```bash
GET /api/v1/public/product-customizations/product/prod-latte-456
```

### Response:
```json
{
  "success": true,
  "message": "Product customizations retrieved successfully",
  "data": [
    {
      "id": "group-size-789",
      "productId": "prod-latte-456",
      "name": "Size",
      "isRequired": true,
      "allowMultiple": false,
      "customizations": [
        {"id": "opt-s", "name": "Small", "priceAdjustment": "0.00"},
        {"id": "opt-m", "name": "Medium", "priceAdjustment": "0.50"},
        {"id": "opt-l", "name": "Large", "priceAdjustment": "1.00"}
      ]
    },
    {
      "id": "group-addons-101",
      "productId": "prod-latte-456",
      "name": "Add-ons",
      "isRequired": false,
      "allowMultiple": true,
      "customizations": [
        {"id": "opt-shot", "name": "Extra Shot", "priceAdjustment": "0.50"},
        {"id": "opt-oat", "name": "Oat Milk", "priceAdjustment": "0.75"},
        {"id": "opt-sugar", "name": "Extra Sugar", "priceAdjustment": "0.25"},
        {"id": "opt-whip", "name": "Whipped Cream", "priceAdjustment": "0.50"}
      ]
    }
  ]
}
```

---

## Example Orders

### Order 1: Small, Plain
```
Size: Small (+$0.00)
Add-ons: None
Total: $3.50
```

### Order 2: Medium with Extras
```
Size: Medium (+$0.50)
Add-ons: Oat Milk (+$0.75), Extra Sugar (+$0.25)
Total: $5.00
```

### Order 3: Large, Loaded
```
Size: Large (+$1.00)
Add-ons: Extra Shot (+$0.50), Oat Milk (+$0.75), Whipped Cream (+$0.50)
Total: $6.25
```

---

## All Products Use Same Pattern

| Product | Base Price | Size Options | Add-on Examples |
|---------|-----------|--------------|-----------------|
| Iced Latte | $3.50 | S, M, L | Extra Shot, Milk, Sugar, Whip |
| Cappuccino | $4.00 | S, M, L | Extra Shot, Milk, Sweetener |
| Americano | $3.00 | S, M, L | Extra Shot, Milk, Sweetener |
| Croissant | $4.50 | - | Butter, Jam, Chocolate |
| Sandwich | $8.00 | Regular, Large | Extra Meat, Cheese, Sauce |

---

## Phase 1 Integration (Ready Now)

When Phase 1 completes, customers will:
1. Select product (Iced Latte)
2. Choose size (Medium)
3. Select add-ons (Oat Milk, Extra Sugar)
4. **Add to cart with customizations stored**
5. Proceed to checkout with calculated price ($5.00)

---

**Generated:** 2026-04-22  
**Pattern:** Size (required) + Add-ons (optional, multi-select)  
**Status:** Ready for Phase 1
