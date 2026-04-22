# ☕ Coffee Shop Configuration Example

Complete example of a coffee shop using the feature visibility and customization system.

## Business Settings

```json
{
  "businessId": "coffee-shop-123",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false
}
```

**Why these settings:**
- Categories: YES (Hot Coffee, Iced Coffee, Pastries, Merchandise)
- Subcategories: NO (Not needed for coffee shop structure)
- Brands: NO (Coffee is the product, not multi-brand)

---

## Product Structure

### Example: Iced Latte ($3.50)

**Customization Group 1: Size (Required, Single Select)**
```
├── Small: +$0.00
├── Medium: +$0.50
└── Large: +$1.00
```

**Customization Group 2: Extra Shots (Optional, Multiple)**
```
├── 1 Shot: +$0.50
└── 2 Shots: +$1.00
```

**Customization Group 3: Milk Type (Optional, Single)**
```
├── Regular: +$0.00
├── Oat: +$0.75
└── Almond: +$0.75
```

**Customization Group 4: Sugar Level (Optional, Single)**
```
├── No Sugar: +$0.00
├── Normal: +$0.00
└── Extra: +$0.25
```

---

## API Example: Create Iced Latte with Customizations

### Step 1: Create Product
```bash
POST /api/v1/products
{
  "name": "Iced Latte",
  "categoryId": "cat-coffee-123",
  "description": "Refreshing iced coffee",
  "price": "3.50",
  "status": "ACTIVE"
}
```

### Step 2: Create Size Customization Group
```bash
POST /api/v1/product-customizations/groups
{
  "productId": "product-latte-123",
  "name": "Size",
  "description": "Choose your drink size",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

### Step 3: Add Size Options
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-123",
  "name": "Small",
  "description": "12 oz",
  "priceAdjustment": "0.00",
  "sortOrder": 1,
  "status": "ACTIVE"
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-123",
  "name": "Medium",
  "description": "16 oz",
  "priceAdjustment": "0.50",
  "sortOrder": 2,
  "status": "ACTIVE"
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-123",
  "name": "Large",
  "description": "20 oz",
  "priceAdjustment": "1.00",
  "sortOrder": 3,
  "status": "ACTIVE"
}
```

### Step 4: Customer Gets Product with Customizations
```bash
GET /api/v1/public/product-customizations/product/product-latte-123
```

**Response:**
```json
{
  "success": true,
  "message": "Product customizations retrieved successfully",
  "data": [
    {
      "id": "group-size-123",
      "productId": "product-latte-123",
      "name": "Size",
      "description": "Choose your drink size",
      "isRequired": true,
      "allowMultiple": false,
      "sortOrder": 1,
      "status": "ACTIVE",
      "customizations": [
        {
          "id": "custom-small-123",
          "productCustomizationGroupId": "group-size-123",
          "name": "Small",
          "description": "12 oz",
          "priceAdjustment": "0.00",
          "sortOrder": 1,
          "status": "ACTIVE"
        },
        {
          "id": "custom-medium-123",
          "productCustomizationGroupId": "group-size-123",
          "name": "Medium",
          "description": "16 oz",
          "priceAdjustment": "0.50",
          "sortOrder": 2,
          "status": "ACTIVE"
        },
        {
          "id": "custom-large-123",
          "productCustomizationGroupId": "group-size-123",
          "name": "Large",
          "description": "20 oz",
          "priceAdjustment": "1.00",
          "sortOrder": 3,
          "status": "ACTIVE"
        }
      ]
    },
    {
      "id": "group-shots-123",
      "productId": "product-latte-123",
      "name": "Extra Shots",
      "description": "Add espresso shots",
      "isRequired": false,
      "allowMultiple": true,
      "sortOrder": 2,
      "status": "ACTIVE",
      "customizations": [
        {
          "id": "custom-1shot-123",
          "name": "+1 Shot",
          "priceAdjustment": "0.50",
          "sortOrder": 1,
          "status": "ACTIVE"
        },
        {
          "id": "custom-2shots-123",
          "name": "+2 Shots",
          "priceAdjustment": "1.00",
          "sortOrder": 2,
          "status": "ACTIVE"
        }
      ]
    }
  ]
}
```

---

## Frontend Display Flow

### 1. Customer Selects Product
Frontend displays: Iced Latte - $3.50 (base price)

### 2. Customer Selects Customizations
- **Size** (required): Selects Medium → +$0.50
- **Shots** (optional): Selects +1 Shot → +$0.50
- **Milk** (optional): Selects Oat → +$0.75
- **Sugar** (optional): Selects Normal → +$0.00

### 3. Total Calculation
```
Base Price:        $3.50
+ Medium Size:     $0.50
+ 1 Extra Shot:    $0.50
+ Oat Milk:        $0.75
+ Normal Sugar:    $0.00
─────────────────────
Total:            $5.25
```

---

## Supported Products

| Product | Categories | Customizations |
|---------|-----------|----------------|
| Iced Latte | Hot Coffee | Size, Shots, Milk, Sugar |
| Iced Americano | Iced Coffee | Size, Shots, Sweetener |
| Cappuccino | Hot Coffee | Size, Milk, Sweetener |
| Croissant | Pastries | None |
| Coffee Beans | Merchandise | Size (bag), Grind |

---

## Phase 1 Integration (Upcoming)

When Phase 1 completes, customers will be able to:
1. Add customized Iced Latte to cart with selected options
2. Cart stores: `selectedCustomizations` (JSON) and `customizationAdjustment` ($0.75)
3. Proceed to checkout with pre-calculated price
4. Order persists customization selections with final price

---

**Generated:** 2026-04-22  
**Status:** Ready for Phase 1 Integration
