# Complete Backend Guide

Multi-business e-commerce platform with feature visibility and simplified add-ons system.

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Feature Visibility](#feature-visibility)
3. [Simplified Add-ons System](#simplified-add-ons-system)
4. [API Endpoints](#api-endpoints)
5. [Business Examples](#business-examples)
6. [Implementation Roadmap](#implementation-roadmap)

---

## System Overview

**What is this?**
A backend system that supports multiple business types (Coffee shops, Restaurants, Clothing stores, Pharmacies, Bookstores) with:
1. Dynamic feature visibility (show/hide categories, brands, subcategories)
2. Product add-ons with price adjustments
3. Order/cart integration (coming Phase 1)

**Technology Stack:**
- Spring Boot 3.0+
- Java 17+
- PostgreSQL 12+ (JSONB)
- JPA/Hibernate
- Maven
- REST API

**Database:** PostgreSQL with migrations V6, V7, V8, V9...

---

## Feature Visibility

### What It Does
Different businesses need different features. Coffee shop ≠ Clothing store.

### Feature Flags
```json
{
  "businessId": "business-123",
  "useCategories": true,       // Show Categories?
  "useSubcategories": false,   // Show Subcategories?
  "useBrands": false           // Show Brands?
}
```

### How It Works
Every endpoint checks: "Should this business see this feature?"

```
Request → Controller → Check Feature Flag
                          ↓
                    Feature enabled? YES → Return data
                                        NO → Return empty
```

### 11 Controllers with Feature Checks
- CategoryController (useCategories flag)
- BrandController (useBrands flag)
- SubcategoryController (useSubcategories flag)
- ProductController (category/brand filters)
- ProductFavoriteController (category/brand filters)
- ProductCustomizationController (add-ons)
- Public versions of all above

### Business Type Examples
| Type | Categories | Subcategories | Brands | Add-ons |
|------|-----------|---------------|--------|---------|
| ☕ Coffee | YES | NO | NO | YES |
| 🍔 Restaurant | YES | NO | NO | YES |
| 👕 Clothing | YES | YES | YES | YES |
| 💊 Pharmacy | YES | NO | YES | NO |
| 📚 Bookstore | YES | YES | YES | YES |

---

## Simplified Add-ons System

### The Pattern: Size + Add-ons

Every product has a simple pattern:

```
┌──────────────────────────┐
│  Iced Latte              │
│  Base: $3.50             │
├──────────────────────────┤
│ SIZE (Required):         │
│ ○ Small    +$0.00        │
│ ◉ Medium   +$0.50        │
│ ○ Large    +$1.00        │
├──────────────────────────┤
│ ADD-ONS (Optional):      │
│ ☐ Extra Shot   +$0.50    │
│ ☑ Oat Milk     +$0.75    │
│ ☑ Extra Sugar  +$0.25    │
│ ☐ Whipped Cream +$0.50   │
├──────────────────────────┤
│ Total: $5.00             │
│ [Add to Cart]            │
└──────────────────────────┘
```

### Database Structure (Super Simple!)

```sql
product_customizations {
  id: UUID,
  product_id: UUID,          -- Which product
  name: String,              -- "Extra Shot", "Oat Milk"
  price_adjustment: Decimal, -- +$0.50, +$0.75
  status: String             -- ACTIVE/INACTIVE
}
```

That's it! No groups, no complex hierarchy.

### Code Structure

**Models:**
- ProductCustomization (4 fields: id, productId, name, priceAdjustment, status)
- Product (relationship to ProductSize for size variants)

**Repository:**
```java
findByProductIdAndStatus(UUID productId, String status)
findByProductId(UUID productId)
findByProductIdOrderByPriceAdjustment(UUID productId)  // Sorted by price!
existsByProductIdAndName(UUID productId, String name)
```

**Service:**
```java
createCustomization(ProductCustomizationCreateDto)
getProductCustomizations(UUID productId)
getProductCustomizationsActive(UUID productId)
updateCustomization(UUID id, ProductCustomizationCreateDto)
deleteCustomization(UUID id)
```

**Controllers:**
- ProductCustomizationController (admin CRUD)
- PublicProductCustomizationController (customer GET)

---

## API Endpoints

### 1. Feature Visibility Endpoints

**Categories:**
```bash
GET    /api/v1/categories/{id}
POST   /api/v1/categories (create)
PUT    /api/v1/categories/{id} (update)
DELETE /api/v1/categories/{id} (delete)
POST   /api/v1/categories/all (feature check)
POST   /api/v1/categories/my-business/all (feature check)

GET    /api/v1/public/categories/all (feature check)
```

**Brands:**
```bash
GET    /api/v1/brands/{id}
POST   /api/v1/brands (create)
PUT    /api/v1/brands/{id} (update)
DELETE /api/v1/brands/{id} (delete)
POST   /api/v1/brands/all (feature check)

GET    /api/v1/public/brands/all (feature check)
```

**Subcategories:**
```bash
GET    /api/v1/subcategories/{id}
POST   /api/v1/subcategories (create)
PUT    /api/v1/subcategories/{id} (update)
DELETE /api/v1/subcategories/{id} (delete)
POST   /api/v1/subcategories/all (feature check)
POST   /api/v1/categories/{id}/subcategories (feature check)

GET    /api/v1/public/categories/{id}/subcategories (feature check)
```

**Products:**
```bash
GET    /api/v1/products/{id}
POST   /api/v1/products (create)
PUT    /api/v1/products/{id} (update)
DELETE /api/v1/products/{id} (delete)
POST   /api/v1/products/all (feature check - category/brand filters)
POST   /api/v1/products/my-business/all (feature check)

GET    /api/v1/public/products/all (feature check)
```

**Favorites:**
```bash
GET    /api/v1/favorites
POST   /api/v1/favorites/{productId}
DELETE /api/v1/favorites/{productId}
```

### 2. Add-ons Endpoints

**Admin (Protected):**
```bash
POST   /api/v1/product-customizations
{
  "productId": "latte-123",
  "name": "Extra Shot",
  "priceAdjustment": "0.50",
  "status": "ACTIVE"
}

PUT    /api/v1/product-customizations/{id}
{
  "productId": "latte-123",
  "name": "Extra Shot",
  "priceAdjustment": "0.60",
  "status": "ACTIVE"
}

DELETE /api/v1/product-customizations/{id}

GET    /api/v1/product-customizations/{id}
```

**Customer (Public):**
```bash
GET    /api/v1/public/product-customizations/product/{productId}
→ Returns sorted by price (lowest to highest)
```

**Response:**
```json
{
  "success": true,
  "message": "Product add-ons retrieved successfully",
  "data": [
    {
      "id": "addon-1",
      "productId": "latte-123",
      "name": "Extra Sugar",
      "priceAdjustment": "0.25",
      "status": "ACTIVE"
    },
    {
      "id": "addon-2",
      "productId": "latte-123",
      "name": "Extra Shot",
      "priceAdjustment": "0.50",
      "status": "ACTIVE"
    },
    {
      "id": "addon-3",
      "productId": "latte-123",
      "name": "Oat Milk",
      "priceAdjustment": "0.75",
      "status": "ACTIVE"
    }
  ]
}
```

---

## Business Examples

### ☕ Coffee Shop (Iced Latte)

**Settings:**
```json
{
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false
}
```

**Product:** Iced Latte ($3.50)

**Add-ons:**
- Extra Shot: +$0.50
- Oat Milk: +$0.75
- Extra Sugar: +$0.25
- Whipped Cream: +$0.50

**Customer Order:**
1. Select: Medium size (from ProductSize: +$0.50)
2. Add: Oat Milk (+$0.75), Extra Sugar (+$0.25)
3. Total: $3.50 + $0.50 + $0.75 + $0.25 = **$5.00**

---

### 🍔 Restaurant (Classic Burger)

**Settings:**
```json
{
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": false
}
```

**Product:** Classic Burger ($12.00)

**Add-ons:**
- Bacon: +$1.50
- Cheese: +$0.50
- Fried Egg: +$1.00
- Mushrooms: +$0.75
- French Fries: +$2.00

**Customer Order:**
1. Select: Regular size
2. Add: Bacon (+$1.50), Fried Egg (+$1.00), French Fries (+$2.00)
3. Total: $12.00 + $1.50 + $1.00 + $2.00 = **$16.50**

---

### 👕 Clothing Store (T-Shirt)

**Settings:**
```json
{
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true
}
```

**Product:** Classic T-Shirt ($25.00)

**Add-ons:**
- Custom Color: +$3.00
- Embroidery: +$2.00
- Gift Wrap: +$2.00

**Customer Order:**
1. Browse: Men > Shirts > Nike
2. Select: Size Large (from ProductSize: no extra cost)
3. Add: Embroidery (+$2.00), Gift Wrap (+$2.00)
4. Total: $25.00 + $2.00 + $2.00 = **$29.00**

---

### 💊 Pharmacy (Vitamin D)

**Settings:**
```json
{
  "useCategories": true,
  "useSubcategories": false,
  "useBrands": true
}
```

**Product:** Vitamin D ($15.00)

**Add-ons:**
- Extended Warranty: +$3.00
- Consultation: +$5.00

---

### 📚 Bookstore (Novel)

**Settings:**
```json
{
  "useCategories": true,
  "useSubcategories": true,
  "useBrands": true
}
```

**Product:** Fiction Novel ($18.00)

**Add-ons:**
- Gift Wrap: +$2.00
- Signed Edition: +$5.00

---

## Implementation Roadmap

### Phase 0: ✅ COMPLETE
**What's Done:**
- Feature visibility system (11 controllers, 40+ endpoints)
- Product customization system (add-ons with price adjustments)
- Database migrations V6, V7
- Simplified, clean code
- Complete documentation

**Status:** Ready for Phase 1

---

### Phase 1: ⏳ NEXT (Week 1)
**Objective:** Order/Cart Integration

**Tasks:**
1. Extend OrderItem with customization fields
   - selectedCustomizations (JSON)
   - customizationAdjustment (price)
2. Extend CartItem with customization fields
   - selectedCustomizations (JSON)
3. Create customization selection DTOs
4. Database migrations (V8, V9)
5. Update CartService with customization handling
6. Update OrderService with customization support

**Deliverable:** Customers can add products with customizations to cart

---

### Phase 2: (Week 2)
**Objective:** Price Calculation Service

**Tasks:**
1. Implement CustomizationPricingService
2. Validation logic (required selections, limits)
3. Price calculation (sum adjustments + base)
4. Integration with Cart & Order services

**Deliverable:** Accurate price calculations with customizations

---

### Phase 3: (Weeks 3-4)
**Objective:** Testing & Validation

**Tasks:**
1. Unit tests (80%+ coverage)
2. Integration tests (E2E scenarios)
3. Performance profiling
4. Security review

**Deliverable:** MVP backend complete - ready for frontend

---

### Phase 4: (Weeks 5-6)
**Objective:** Frontend Integration

**Tasks:**
1. Feature visibility UI
2. Customization selector component
3. Admin customization management
4. Admin feature configuration

**Deliverable:** Full frontend integration

---

### Phase 5: (Week 7)
**Objective:** Production Optimization

**Tasks:**
1. Performance optimization
2. Security hardening
3. Deployment procedures
4. Production deployment

**Deliverable:** Production-ready system

---

## Quick Commands

**Create Add-on:**
```bash
curl -X POST http://localhost:8080/api/v1/product-customizations \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "latte-123",
    "name": "Extra Shot",
    "priceAdjustment": "0.50",
    "status": "ACTIVE"
  }'
```

**Get Product Add-ons:**
```bash
curl http://localhost:8080/api/v1/public/product-customizations/product/latte-123
```

**Update Add-on:**
```bash
curl -X PUT http://localhost:8080/api/v1/product-customizations/addon-123 \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "latte-123",
    "name": "Extra Shot",
    "priceAdjustment": "0.60",
    "status": "ACTIVE"
  }'
```

**Delete Add-on:**
```bash
curl -X DELETE http://localhost:8080/api/v1/product-customizations/addon-123
```

---

## Key Files

**Models:**
- `/src/main/java/com/emenu/features/main/models/ProductCustomization.java`

**Services:**
- `/src/main/java/com/emenu/features/main/service/ProductCustomizationService.java`
- `/src/main/java/com/emenu/features/main/service/ProductConditionalService.java`

**Controllers:**
- `/src/main/java/com/emenu/features/main/controller/ProductCustomizationController.java`
- `/src/main/java/com/emenu/features/main/controller/PublicProductCustomizationController.java`
- Other controllers in `/src/main/java/com/emenu/features/main/controller/`

**Database:**
- `/src/main/resources/db/migration/V6__add_feature_visibility_flags.sql`
- `/src/main/resources/db/migration/V7__add_product_customizations.sql`

---

## Success Metrics

✅ **Phase 0 (Current):**
- Feature visibility working across 11 controllers
- Add-ons CRUD fully functional
- Clean, simplified codebase
- Zero unnecessary complexity

✅ **Phase 1 (Next):**
- Customizations stored in cart/orders
- Price calculations accurate
- Ready for frontend integration

✅ **Phase 3 (Week 4):**
- 80%+ code coverage
- All tests passing
- MVP backend complete

✅ **Phase 5 (Week 7):**
- Production-ready
- Performance optimized
- Security reviewed

---

**Generated:** 2026-04-22  
**Version:** 2.0  
**Status:** Phase 0 Complete - Ready for Phase 1
