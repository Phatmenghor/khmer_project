# 🍔 Restaurant - Size + Add-ons Example

Simple customization pattern: Choose portion size, then add optional toppings/sides.

---

## Business Settings

```json
{
  "businessId": "restaurant-789",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false
}
```

---

## Product: Classic Burger ($12.00)

### Customer UI Experience

```
┌──────────────────────────────┐
│  Classic Burger              │
│  Base: $12.00                │
├──────────────────────────────┤
│ PROTEIN (Required):          │
│ ◉ Beef       +$0.00          │
│ ○ Chicken    +$0.00          │
│ ○ Veggie     +$1.00          │
│ ○ Beyond     +$2.00          │
├──────────────────────────────┤
│ ADD-ONS (Optional):          │
│ ☑ Bacon          +$1.50      │
│ ☐ Cheese         +$0.50      │
│ ☑ Fried Egg      +$1.00      │
│ ☐ Mushrooms      +$0.75      │
│ ☐ French Fries   +$2.00      │
├──────────────────────────────┤
│ Total: $17.00                │
│ [Add to Cart]                │
└──────────────────────────────┘
```

---

## Backend Setup

### 1. Create Product
```bash
POST /api/v1/products
{
  "name": "Classic Burger",
  "categoryId": "cat-main-123",
  "description": "Juicy burger with your choice of toppings",
  "price": "12.00",
  "status": "ACTIVE"
}
```

---

### 2. Create Protein Group (Required, Single-Select)

```bash
POST /api/v1/product-customizations/groups
{
  "productId": "prod-burger-456",
  "name": "Protein",
  "description": "Choose your protein",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

---

### 3. Add Protein Options

**Beef:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-protein-789",
  "name": "Beef",
  "priceAdjustment": "0.00",
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

**Chicken:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-protein-789",
  "name": "Chicken",
  "priceAdjustment": "0.00",
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

**Veggie:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-protein-789",
  "name": "Veggie",
  "priceAdjustment": "1.00",
  "sortOrder": 3,
  "status": "ACTIVE"
}
```

**Beyond Meat:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-protein-789",
  "name": "Beyond Meat",
  "priceAdjustment": "2.00",
  "sortOrder": 4,
  "status": "ACTIVE"
}
```

---

### 4. Create Add-ons Group (Optional, Multi-Select)

```bash
POST /api/v1/product-customizations/groups
{
  "productId": "prod-burger-456",
  "name": "Add-ons",
  "description": "Add toppings and sides",
  "isRequired": false,
  "allowMultiple": true,
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

---

### 5. Add Add-on Options

**Bacon:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-101",
  "name": "Bacon",
  "priceAdjustment": "1.50",
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

**Cheese:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-101",
  "name": "Cheese",
  "priceAdjustment": "0.50",
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

**Fried Egg:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-101",
  "name": "Fried Egg",
  "priceAdjustment": "1.00",
  "sortOrder": 3,
  "status": "ACTIVE"
}
```

**Mushrooms:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-101",
  "name": "Mushrooms",
  "priceAdjustment": "0.75",
  "sortOrder": 4,
  "status": "ACTIVE"
}
```

**French Fries:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-101",
  "name": "French Fries",
  "priceAdjustment": "2.00",
  "sortOrder": 5,
  "status": "ACTIVE"
}
```

---

## Customer Gets Product

### Request:
```bash
GET /api/v1/public/product-customizations/product/prod-burger-456
```

### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "group-protein-789",
      "name": "Protein",
      "isRequired": true,
      "allowMultiple": false,
      "customizations": [
        {"id": "opt-beef", "name": "Beef", "priceAdjustment": "0.00"},
        {"id": "opt-chicken", "name": "Chicken", "priceAdjustment": "0.00"},
        {"id": "opt-veggie", "name": "Veggie", "priceAdjustment": "1.00"},
        {"id": "opt-beyond", "name": "Beyond Meat", "priceAdjustment": "2.00"}
      ]
    },
    {
      "id": "group-addons-101",
      "name": "Add-ons",
      "isRequired": false,
      "allowMultiple": true,
      "customizations": [
        {"id": "opt-bacon", "name": "Bacon", "priceAdjustment": "1.50"},
        {"id": "opt-cheese", "name": "Cheese", "priceAdjustment": "0.50"},
        {"id": "opt-egg", "name": "Fried Egg", "priceAdjustment": "1.00"},
        {"id": "opt-mushroom", "name": "Mushrooms", "priceAdjustment": "0.75"},
        {"id": "opt-fries", "name": "French Fries", "priceAdjustment": "2.00"}
      ]
    }
  ]
}
```

---

## Example Orders

### Order 1: Basic Beef Burger
```
Protein: Beef (+$0.00)
Add-ons: None
Total: $12.00
```

### Order 2: Loaded Burger
```
Protein: Beef (+$0.00)
Add-ons: Bacon (+$1.50), Fried Egg (+$1.00), French Fries (+$2.00)
Total: $16.50
```

### Order 3: Premium Veggie Burger
```
Protein: Veggie (+$1.00)
Add-ons: Cheese (+$0.50), Mushrooms (+$0.75), French Fries (+$2.00)
Total: $16.25
```

### Order 4: Beyond Meat Special
```
Protein: Beyond Meat (+$2.00)
Add-ons: Bacon (+$1.50), Cheese (+$0.50), Egg (+$1.00), Fries (+$2.00)
Total: $19.00
```

---

## Menu Structure

All products use the same **Size/Protein + Add-ons** pattern:

| Product | Price | Primary Option | Add-on Examples |
|---------|-------|-----------------|-----------------|
| Classic Burger | $12.00 | Protein | Bacon, Cheese, Egg, Fries |
| Grilled Steak | $25.00 | Cut/Cook | Sauce, Sides, Toppings |
| Pasta Alfredo | $14.00 | Portion | Protein, Vegetables, Sauce |
| Fish & Chips | $15.00 | Size | Extra Sides, Sauce |
| Chicken Wings | $10.00 | Quantity | Sauce, Dip |

---

## Phase 1 Integration (Ready Now)

When Phase 1 completes, customers will:
1. Select product (Classic Burger)
2. Choose protein (Beef)
3. Select add-ons (Bacon, Fried Egg, French Fries)
4. **Add to cart with customizations stored**
5. Proceed to checkout with calculated price ($16.50)

---

**Generated:** 2026-04-22  
**Pattern:** Primary (required) + Add-ons (optional, multi-select)  
**Status:** Ready for Phase 1
