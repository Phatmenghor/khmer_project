# 👕 Clothing Store Configuration Example

Complete example of a clothing store using the feature visibility and customization system.

## Business Settings

```json
{
  "businessId": "clothing-store-456",
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true
}
```

**Why these settings:**
- Categories: YES (Men, Women, Kids, Accessories)
- Subcategories: YES (Shirts, Pants, Shoes under each category)
- Brands: YES (Nike, Adidas, Levi's, etc.)

---

## Product Structure Hierarchy

### Categories
```
├── Men
│   ├── Shirts
│   ├── Pants
│   └── Shoes
├── Women
│   ├── Dresses
│   ├── Tops
│   └── Bottoms
├── Kids
│   ├── Clothing
│   └── Shoes
└── Accessories
    ├── Hats
    └── Bags
```

### Brands
```
├── Nike
├── Adidas
├── Levi's
├── Puma
└── Gucci
```

---

## Example: T-Shirt (Men > Shirts) - $25.00

**Customization Group 1: Size (Required, Single Select)**
```
├── XS: +$0.00
├── S: +$0.00
├── M: +$0.00
├── L: +$0.00
├── XL: +$1.00
└── XXL: +$2.00
```

**Customization Group 2: Color (Required, Single Select)**
```
├── Black: +$0.00
├── White: +$0.00
├── Blue: +$0.00
├── Red: +$0.50
└── Custom: +$3.00
```

**Customization Group 3: Embroidery (Optional, Single Select)**
```
├── None: +$0.00
├── Small Logo: +$2.00
└── Large Name: +$5.00
```

**Customization Group 4: Gift Wrap (Optional, Single Select)**
```
├── No Wrap: +$0.00
├── Standard Wrap: +$2.00
└── Premium Wrap: +$4.00
```

---

## API Example: Create T-Shirt

### Step 1: Create Men Category
```bash
POST /api/v1/categories
{
  "name": "Men",
  "description": "Men's clothing",
  "status": "ACTIVE"
}
```

### Step 2: Create Shirts Subcategory
```bash
POST /api/v1/subcategories
{
  "categoryId": "cat-men-123",
  "name": "Shirts",
  "description": "Men's shirts",
  "status": "ACTIVE"
}
```

### Step 3: Create Brand (Nike)
```bash
POST /api/v1/brands
{
  "name": "Nike",
  "description": "Nike Sportswear",
  "status": "ACTIVE"
}
```

### Step 4: Create T-Shirt Product
```bash
POST /api/v1/products
{
  "name": "Classic T-Shirt",
  "categoryId": "cat-men-123",
  "subcategoryId": "subcat-shirts-123",
  "brandId": "brand-nike-123",
  "description": "Comfortable cotton t-shirt",
  "price": "25.00",
  "status": "ACTIVE"
}
```

### Step 5: Create Customization Groups and Options
```bash
POST /api/v1/product-customizations/groups
{
  "productId": "product-tshirt-123",
  "name": "Size",
  "description": "Choose size",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 1,
  "status": "ACTIVE"
}

POST /api/v1/product-customizations/groups
{
  "productId": "product-tshirt-123",
  "name": "Color",
  "description": "Choose color",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 2,
  "status": "ACTIVE"
}

POST /api/v1/product-customizations/groups
{
  "productId": "product-tshirt-123",
  "name": "Embroidery",
  "description": "Optional embroidery",
  "isRequired": false,
  "allowMultiple": false,
  "sortOrder": 3,
  "status": "ACTIVE"
}

POST /api/v1/product-customizations/groups
{
  "productId": "product-tshirt-123",
  "name": "Gift Wrap",
  "description": "Wrap for gifting",
  "isRequired": false,
  "allowMultiple": false,
  "sortOrder": 4,
  "status": "ACTIVE"
}
```

---

## Customer Order Example

### Selected Customizations:
- **Size:** Large (+$0.00)
- **Color:** Red (+$0.50)
- **Embroidery:** Small Logo (+$2.00)
- **Gift Wrap:** Premium Wrap (+$4.00)

### Price Calculation:
```
Base Price:           $25.00
+ Large Size:         $0.00
+ Red Color:          $0.50
+ Small Logo:         $2.00
+ Premium Gift Wrap:  $4.00
─────────────────────────────
Total:               $31.50
```

---

## GET Product Customizations Response

```bash
GET /api/v1/public/product-customizations/product/product-tshirt-123
```

**Response:**
```json
{
  "success": true,
  "message": "Product customizations retrieved successfully",
  "data": [
    {
      "id": "group-size-123",
      "productId": "product-tshirt-123",
      "name": "Size",
      "isRequired": true,
      "allowMultiple": false,
      "sortOrder": 1,
      "status": "ACTIVE",
      "customizations": [
        {"id": "opt-xs", "name": "XS", "priceAdjustment": "0.00", "sortOrder": 1},
        {"id": "opt-s", "name": "S", "priceAdjustment": "0.00", "sortOrder": 2},
        {"id": "opt-m", "name": "M", "priceAdjustment": "0.00", "sortOrder": 3},
        {"id": "opt-l", "name": "L", "priceAdjustment": "0.00", "sortOrder": 4},
        {"id": "opt-xl", "name": "XL", "priceAdjustment": "1.00", "sortOrder": 5},
        {"id": "opt-xxl", "name": "XXL", "priceAdjustment": "2.00", "sortOrder": 6}
      ]
    },
    {
      "id": "group-color-123",
      "productId": "product-tshirt-123",
      "name": "Color",
      "isRequired": true,
      "allowMultiple": false,
      "sortOrder": 2,
      "status": "ACTIVE",
      "customizations": [
        {"id": "opt-black", "name": "Black", "priceAdjustment": "0.00"},
        {"id": "opt-white", "name": "White", "priceAdjustment": "0.00"},
        {"id": "opt-blue", "name": "Blue", "priceAdjustment": "0.00"},
        {"id": "opt-red", "name": "Red", "priceAdjustment": "0.50"},
        {"id": "opt-custom", "name": "Custom", "priceAdjustment": "3.00"}
      ]
    },
    {
      "id": "group-embroidery-123",
      "productId": "product-tshirt-123",
      "name": "Embroidery",
      "isRequired": false,
      "allowMultiple": false,
      "sortOrder": 3,
      "status": "ACTIVE",
      "customizations": [
        {"id": "opt-none", "name": "None", "priceAdjustment": "0.00"},
        {"id": "opt-small-logo", "name": "Small Logo", "priceAdjustment": "2.00"},
        {"id": "opt-large-name", "name": "Large Name", "priceAdjustment": "5.00"}
      ]
    }
  ]
}
```

---

## GET Categories/Brands Example

Since this business has `useCategories`, `useSubcategories`, and `useBrands` all enabled:

```bash
GET /api/v1/public/categories/all
→ Returns all categories including Men, Women, Kids, Accessories

GET /api/v1/public/brands/all
→ Returns all brands including Nike, Adidas, Levi's, etc.

GET /api/v1/public/categories/men-123/subcategories
→ Returns Shirts, Pants, Shoes under Men category
```

---

## Multi-Brand Product Example

| Brand | Product | Category | Subcategory | Price | Customizations |
|-------|---------|----------|-------------|-------|-----------------|
| Nike | Air Max Shoe | Men | Shoes | $120 | Size, Color |
| Adidas | Classic Tee | Men | Shirts | $30 | Size, Color, Embroidery |
| Levi's | 501 Jeans | Men | Pants | $80 | Size, Fit, Color |
| Gucci | Leather Belt | Accessories | Belts | $500 | Size, Color |

---

## Phase 1 Integration (Upcoming)

When Phase 1 completes:
1. Customer adds Classic T-Shirt with size L, red color, embroidery, gift wrap to cart
2. Cart item stores `selectedCustomizations` JSON with choices
3. Total price calculated: $25.00 + $0.50 + $2.00 + $4.00 = $31.50
4. Order confirms customization selections and final price

---

**Generated:** 2026-04-22  
**Status:** Ready for Phase 1 Integration
