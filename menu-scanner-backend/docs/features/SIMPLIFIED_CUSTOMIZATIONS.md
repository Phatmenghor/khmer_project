# Simplified Add-ons System

**Super simple, flat structure - no groups needed!**

---

## The Pattern

```
Product: Iced Latte ($3.50)

ADD-ONS (Customer can check any):
☐ Extra Shot      +$0.50
☑ Oat Milk        +$0.75
☑ Extra Sugar     +$0.25
☐ Whipped Cream   +$0.50

Total: $3.50 + $0.75 + $0.25 = $4.50
```

---

## Database Structure

**One simple table:**

```sql
product_customizations {
  id: UUID,
  product_id: UUID,        -- Which product
  name: String,            -- "Extra Shot", "Oat Milk", etc.
  price_adjustment: Decimal, -- +$0.50, +$0.75, etc.
  status: String           -- ACTIVE/INACTIVE
}
```

That's it! No groups, no complex hierarchy.

---

## API Endpoints

### Admin - Create Add-on
```bash
POST /api/v1/product-customizations
{
  "productId": "latte-123",
  "name": "Extra Shot",
  "priceAdjustment": "0.50",
  "status": "ACTIVE"
}
```

### Admin - Update Add-on
```bash
PUT /api/v1/product-customizations/addon-123
{
  "productId": "latte-123",
  "name": "Extra Shot",
  "priceAdjustment": "0.60",
  "status": "ACTIVE"
}
```

### Admin - Delete Add-on
```bash
DELETE /api/v1/product-customizations/addon-123
```

### Customer - Get Product Add-ons
```bash
GET /api/v1/public/product-customizations/product/latte-123
```

**Response:**
```json
{
  "success": true,
  "data": [
    {"id": "addon-1", "name": "Extra Shot", "priceAdjustment": "0.50", "status": "ACTIVE"},
    {"id": "addon-2", "name": "Oat Milk", "priceAdjustment": "0.75", "status": "ACTIVE"},
    {"id": "addon-3", "name": "Extra Sugar", "priceAdjustment": "0.25", "status": "ACTIVE"}
  ]
}
```

---

## Code Structure

**Simple & Clean:**

- ✅ ProductCustomization model (4 fields: id, productId, name, priceAdjustment, status)
- ✅ ProductCustomizationRepository (4 query methods)
- ✅ ProductCustomizationService (CRUD methods)
- ✅ ProductCustomizationController (POST/PUT/DELETE)
- ✅ PublicProductCustomizationController (GET for customers)
- ✅ DTOs (request: productId, name, priceAdjustment / response: id, productId, name, priceAdjustment, status)

**No:**
- ❌ ProductCustomizationGroup
- ❌ isRequired, allowMultiple flags
- ❌ sortOrder fields
- ❌ description fields
- ❌ Group mappers

---

## Works for All Business Types

| Type | Product | Add-ons |
|------|---------|---------|
| ☕ Coffee | Iced Latte | Extra Shot, Oat Milk, Sugar |
| 🍔 Restaurant | Classic Burger | Bacon, Cheese, Fried Egg, Fries |
| 👕 Clothing | T-Shirt | Custom Color, Embroidery, Gift Wrap |
| 💊 Pharmacy | Vitamin D | Extended Warranty, Consultation |
| 📚 Bookstore | Novel | Gift Wrap, Signed Edition |

---

## Phase 1: Order Integration

When cart integration completes:
1. Customer selects product (Iced Latte)
2. Customer checks add-ons (Oat Milk, Extra Sugar)
3. System calculates: $3.50 + $0.75 + $0.25 = **$4.50**
4. Cart stores selectedCustomizations JSON + price adjustment
5. Order persists customer's choices

---

**Super simple. Super clean. Ready for Phase 1!**
