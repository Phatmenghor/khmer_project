# 👕 Clothing Store - Size + Add-ons Example

Simple customization pattern: Choose size, then add optional extras.

---

## Business Settings

```json
{
  "businessId": "clothing-store-456",
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true
}
```

---

## Product: Classic T-Shirt ($25.00)

### Customer UI Experience

```
┌──────────────────────────────┐
│  Classic T-Shirt             │
│  Base: $25.00                │
├──────────────────────────────┤
│ SIZE (Required):             │
│ ○ XS       +$0.00            │
│ ○ S        +$0.00            │
│ ○ M        +$0.00            │
│ ◉ L        +$0.00            │
│ ○ XL       +$1.00            │
│ ○ XXL      +$2.00            │
├──────────────────────────────┤
│ ADD-ONS (Optional):          │
│ ☐ Custom Color   +$3.00      │
│ ☑ Embroidery     +$2.00      │
│ ☐ Gift Wrap      +$2.00      │
├──────────────────────────────┤
│ Total: $29.00                │
│ [Add to Cart]                │
└──────────────────────────────┘
```

---

## Backend Setup

### 1. Create Product
```bash
POST /api/v1/products
{
  "name": "Classic T-Shirt",
  "categoryId": "cat-men-123",
  "subcategoryId": "subcat-shirts-456",
  "brandId": "brand-nike-789",
  "description": "Comfortable cotton t-shirt",
  "price": "25.00",
  "status": "ACTIVE"
}
```

---

### 2. Create Size Group (Required, Single-Select)

```bash
POST /api/v1/product-customizations/groups
{
  "productId": "prod-tshirt-123",
  "name": "Size",
  "description": "Choose your size",
  "isRequired": true,
  "allowMultiple": false,
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

---

### 3. Add Size Options

**XS:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-456",
  "name": "XS",
  "priceAdjustment": "0.00",
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

**S:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-456",
  "name": "S",
  "priceAdjustment": "0.00",
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

**M:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-456",
  "name": "M",
  "priceAdjustment": "0.00",
  "sortOrder": 3,
  "status": "ACTIVE"
}
```

**L:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-456",
  "name": "L",
  "priceAdjustment": "0.00",
  "sortOrder": 4,
  "status": "ACTIVE"
}
```

**XL:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-456",
  "name": "XL",
  "priceAdjustment": "1.00",
  "sortOrder": 5,
  "status": "ACTIVE"
}
```

**XXL:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-size-456",
  "name": "XXL",
  "priceAdjustment": "2.00",
  "sortOrder": 6,
  "status": "ACTIVE"
}
```

---

### 4. Create Add-ons Group (Optional, Multi-Select)

```bash
POST /api/v1/product-customizations/groups
{
  "productId": "prod-tshirt-123",
  "name": "Add-ons",
  "description": "Optional customizations",
  "isRequired": false,
  "allowMultiple": true,
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

---

### 5. Add Add-on Options

**Custom Color:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-789",
  "name": "Custom Color",
  "description": "Choose any custom color",
  "priceAdjustment": "3.00",
  "sortOrder": 1,
  "status": "ACTIVE"
}
```

**Embroidery:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-789",
  "name": "Embroidery",
  "description": "Add embroidered logo or name",
  "priceAdjustment": "2.00",
  "sortOrder": 2,
  "status": "ACTIVE"
}
```

**Gift Wrap:**
```bash
POST /api/v1/product-customizations
{
  "productCustomizationGroupId": "group-addons-789",
  "name": "Gift Wrap",
  "description": "Premium gift wrapping",
  "priceAdjustment": "2.00",
  "sortOrder": 3,
  "status": "ACTIVE"
}
```

---

## Customer Gets Product

### Request:
```bash
GET /api/v1/public/product-customizations/product/prod-tshirt-123
```

### Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "group-size-456",
      "name": "Size",
      "isRequired": true,
      "allowMultiple": false,
      "customizations": [
        {"id": "opt-xs", "name": "XS", "priceAdjustment": "0.00"},
        {"id": "opt-s", "name": "S", "priceAdjustment": "0.00"},
        {"id": "opt-m", "name": "M", "priceAdjustment": "0.00"},
        {"id": "opt-l", "name": "L", "priceAdjustment": "0.00"},
        {"id": "opt-xl", "name": "XL", "priceAdjustment": "1.00"},
        {"id": "opt-xxl", "name": "XXL", "priceAdjustment": "2.00"}
      ]
    },
    {
      "id": "group-addons-789",
      "name": "Add-ons",
      "isRequired": false,
      "allowMultiple": true,
      "customizations": [
        {"id": "opt-color", "name": "Custom Color", "priceAdjustment": "3.00"},
        {"id": "opt-emb", "name": "Embroidery", "priceAdjustment": "2.00"},
        {"id": "opt-wrap", "name": "Gift Wrap", "priceAdjustment": "2.00"}
      ]
    }
  ]
}
```

---

## Example Orders

### Order 1: Basic T-Shirt
```
Size: Large (+$0.00)
Add-ons: None
Total: $25.00
```

### Order 2: Customized with Embroidery
```
Size: Large (+$0.00)
Add-ons: Embroidery (+$2.00)
Total: $27.00
```

### Order 3: Full Customization
```
Size: Large (+$0.00)
Add-ons: Embroidery (+$2.00), Gift Wrap (+$2.00)
Total: $29.00
```

### Order 4: Custom Color Special
```
Size: XL (+$1.00)
Add-ons: Custom Color (+$3.00), Gift Wrap (+$2.00)
Total: $31.00
```

---

## Menu Structure with Categories & Brands

All products use the same **Size + Add-ons** pattern:

| Brand | Product | Category | Price | Size Range | Add-ons |
|-------|---------|----------|-------|-----------|---------|
| Nike | Classic T-Shirt | Men | $25 | XS-XXL | Color, Embroidery, Wrap |
| Adidas | Performance Tee | Men | $30 | XS-XXL | Personalization, Wrap |
| Levi's | Classic Jeans | Men | $80 | 28-40 | Length, Distressing, Wrap |
| Tommy | Polo Shirt | Women | $35 | XS-XXL | Color, Monogram, Wrap |
| Gucci | Designer Belt | Accessories | $500 | S-L | Engraving, Presentation |

---

## Feature Visibility in Action

Since this store has `useCategories`, `useSubcategories`, and `useBrands` enabled:

```bash
GET /api/v1/public/categories/all
→ Returns: Men, Women, Kids, Accessories, Shoes

GET /api/v1/public/brands/all
→ Returns: Nike, Adidas, Levi's, Tommy, Gucci

GET /api/v1/public/categories/men-123/subcategories
→ Returns: Shirts, Pants, Shoes, Accessories
```

---

## Phase 1 Integration (Ready Now)

When Phase 1 completes, customers will:
1. Browse by Category, Subcategory, Brand
2. Select product (Classic T-Shirt)
3. Choose size (Large)
4. Select add-ons (Embroidery, Gift Wrap)
5. **Add to cart with customizations stored**
6. Proceed to checkout with calculated price ($29.00)

---

**Generated:** 2026-04-22  
**Pattern:** Size (required) + Add-ons (optional, multi-select)  
**Features:** Categories, Subcategories, Brands enabled  
**Status:** Ready for Phase 1
