# 🍔 Restaurant Configuration Example

Complete example of a restaurant using the feature visibility and customization system.

## Business Settings

```json
{
  "businessId": "restaurant-789",
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false
}
```

**Why these settings:**
- Categories: YES (Appetizers, Main Courses, Sides, Desserts, Drinks)
- Subcategories: NO (Menu structure is simple enough with categories)
- Brands: NO (Not applicable for food service)

---

## Product Structure

### Categories
```
├── Appetizers
│   ├── Chicken Wings
│   └── Bruschetta
├── Main Courses
│   ├── Burgers
│   ├── Steaks
│   └── Pasta
├── Sides
│   ├── Fries
│   └── Salads
├── Desserts
│   ├── Cake
│   └── Ice Cream
└── Drinks
    ├── Soft Drinks
    └── Coffee
```

---

## Example: Classic Burger ($12.00)

**Customization Group 1: Meat Type (Required, Single Select)**
```
├── Beef: +$0.00
├── Chicken: +$0.00
├── Veggie: +$1.00
└── Beyond Meat: +$2.00
```

**Customization Group 2: Cook Level (Required, Single Select)** *(For Beef)*
```
├── Rare: +$0.00
├── Medium-Rare: +$0.00
├── Medium: +$0.00
├── Medium-Well: +$0.00
└── Well Done: +$0.00
```

**Customization Group 3: Toppings (Optional, Multiple Select)**
```
├── Bacon: +$1.50
├── Cheese: +$0.50
├── Fried Egg: +$1.00
├── Mushrooms: +$0.75
├── Onions: +$0.00
├── Tomato: +$0.00
├── Lettuce: +$0.00
└── Pickles: +$0.00
```

**Customization Group 4: Sauce (Required, Single Select)**
```
├── Ketchup: +$0.00
├── Mustard: +$0.00
├── Mayonnaise: +$0.00
├── BBQ: +$0.00
├── Sriracha: +$0.00
└── House Special: +$0.50
```

**Customization Group 5: Sides (Optional, Single Select)**
```
├── French Fries: +$2.00
├── Onion Rings: +$2.50
├── Sweet Potato Fries: +$3.00
└── Coleslaw: +$1.50
```

---

## API Example: Create Classic Burger

### Step 1: Create Main Courses Category
```bash
POST /api/v1/categories
{
  "name": "Main Courses",
  "description": "Entrees and main dishes",
  "status": "ACTIVE"
}
```

### Step 2: Create Classic Burger Product
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

### Step 3: Create Customization Groups

**Meat Type:**
```bash
POST /api/v1/product-customizations/groups
{
  "productId": "product-burger-123",
  "name": "Meat Type",
  "description": "Choose your protein",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 1,
  "status": "ACTIVE"
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-meat-123",
  "name": "Beef",
  "priceAdjustment": "0.00",
  "sortOrder": 1
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-meat-123",
  "name": "Chicken",
  "priceAdjustment": "0.00",
  "sortOrder": 2
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-meat-123",
  "name": "Veggie",
  "priceAdjustment": "1.00",
  "sortOrder": 3
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-meat-123",
  "name": "Beyond Meat",
  "priceAdjustment": "2.00",
  "sortOrder": 4
}
```

**Toppings (Multiple Select):**
```bash
POST /api/v1/product-customizations/groups
{
  "productId": "product-burger-123",
  "name": "Toppings",
  "description": "Add extras",
  "isRequired": false,
  "allowMultiple": true,
  "sortOrder": 3,
  "status": "ACTIVE"
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-toppings-123",
  "name": "Bacon",
  "priceAdjustment": "1.50"
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-toppings-123",
  "name": "Cheese",
  "priceAdjustment": "0.50"
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-toppings-123",
  "name": "Fried Egg",
  "priceAdjustment": "1.00"
}
```

**Sauce:**
```bash
POST /api/v1/product-customizations/groups
{
  "productId": "product-burger-123",
  "name": "Sauce",
  "description": "Choose sauce",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 4,
  "status": "ACTIVE"
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-sauce-123",
  "name": "Ketchup",
  "priceAdjustment": "0.00"
}

POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-sauce-123",
  "name": "House Special",
  "priceAdjustment": "0.50"
}
```

---

## Customer Order Example

### Selected Customizations:
- **Meat Type:** Beef (+$0.00)
- **Toppings:** Bacon (+$1.50), Cheese (+$0.50), Fried Egg (+$1.00)
- **Sauce:** House Special (+$0.50)
- **Sides:** French Fries (+$2.00)

### Price Calculation:
```
Base Price:           $12.00
+ Beef Meat:          $0.00
+ Bacon Topping:      $1.50
+ Cheese Topping:     $0.50
+ Fried Egg Topping:  $1.00
+ House Special Sauce: $0.50
+ French Fries:       $2.00
─────────────────────────────
Total:               $17.50
```

---

## GET Product Customizations Response

```bash
GET /api/v1/public/product-customizations/product/product-burger-123
```

**Response (Abbreviated):**
```json
{
  "success": true,
  "message": "Product customizations retrieved successfully",
  "data": [
    {
      "id": "group-meat-123",
      "productId": "product-burger-123",
      "name": "Meat Type",
      "description": "Choose your protein",
      "isRequired": true,
      "allowMultiple": false,
      "sortOrder": 1,
      "customizations": [
        {"id": "opt-beef", "name": "Beef", "priceAdjustment": "0.00"},
        {"id": "opt-chicken", "name": "Chicken", "priceAdjustment": "0.00"},
        {"id": "opt-veggie", "name": "Veggie", "priceAdjustment": "1.00"},
        {"id": "opt-beyond", "name": "Beyond Meat", "priceAdjustment": "2.00"}
      ]
    },
    {
      "id": "group-sauce-123",
      "productId": "product-burger-123",
      "name": "Sauce",
      "description": "Choose sauce",
      "isRequired": true,
      "allowMultiple": false,
      "sortOrder": 4,
      "customizations": [
        {"id": "opt-ketchup", "name": "Ketchup", "priceAdjustment": "0.00"},
        {"id": "opt-mustard", "name": "Mustard", "priceAdjustment": "0.00"},
        {"id": "opt-mayo", "name": "Mayonnaise", "priceAdjustment": "0.00"},
        {"id": "opt-bbq", "name": "BBQ", "priceAdjustment": "0.00"},
        {"id": "opt-sriracha", "name": "Sriracha", "priceAdjustment": "0.00"},
        {"id": "opt-house", "name": "House Special", "priceAdjustment": "0.50"}
      ]
    },
    {
      "id": "group-toppings-123",
      "productId": "product-burger-123",
      "name": "Toppings",
      "description": "Add extras",
      "isRequired": false,
      "allowMultiple": true,
      "sortOrder": 3,
      "customizations": [
        {"id": "opt-bacon", "name": "Bacon", "priceAdjustment": "1.50"},
        {"id": "opt-cheese", "name": "Cheese", "priceAdjustment": "0.50"},
        {"id": "opt-egg", "name": "Fried Egg", "priceAdjustment": "1.00"},
        {"id": "opt-mushroom", "name": "Mushrooms", "priceAdjustment": "0.75"}
      ]
    }
  ]
}
```

---

## Menu Structure

| Category | Product | Base Price | Popular Customizations |
|----------|---------|-----------|----------------------|
| Appetizers | Chicken Wings | $8.00 | Spice Level, Sauce |
| Main Courses | Classic Burger | $12.00 | Meat, Toppings, Sauce |
| Main Courses | Grilled Steak | $25.00 | Cut, Cook Level, Sides |
| Main Courses | Pasta Alfredo | $14.00 | Protein, Vegetables |
| Sides | French Fries | $4.00 | Size, Seasoning |
| Desserts | Chocolate Cake | $6.00 | Size, Topping |
| Drinks | Soft Drinks | $3.00 | Size, Ice |

---

## Feature Visibility Example

When restaurant customer accesses API:
```bash
GET /api/v1/public/categories/all
→ Returns Main Courses, Appetizers, Sides, Desserts, Drinks

GET /api/v1/public/brands/all
→ Returns empty (useSubcategories = false)

GET /api/v1/public/subcategories/all
→ Returns empty (useSubcategories = false)
```

---

## Phase 1 Integration (Upcoming)

When Phase 1 completes:
1. Customer orders Classic Burger with selected toppings (Bacon, Cheese, Egg), House Special sauce, and French Fries
2. Cart item stores all customization selections in JSON format
3. Total price: $12.00 + $1.50 + $0.50 + $1.00 + $0.50 + $2.00 = $17.50
4. Order confirms customization details and maintains final price

---

**Generated:** 2026-04-22  
**Status:** Ready for Phase 1 Integration
