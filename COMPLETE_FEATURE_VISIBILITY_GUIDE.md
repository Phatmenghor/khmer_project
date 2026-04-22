# Complete Feature Visibility Control System - Full Backend Implementation

## Overview

This guide covers the **complete and comprehensive** feature visibility control system applied across the entire backend. All controllers, services, and features now dynamically hide/show based on BusinessSettings flags.

---

## System Architecture

### Feature Flags (BusinessSetting Model)

```java
@Column(name = "use_categories", nullable = false)
private Boolean useCategories = true;

@Column(name = "use_subcategories", nullable = false)
private Boolean useSubcategories = false;

@Column(name = "use_brands", nullable = false)
private Boolean useBrands = false;
```

### Core Service (ProductConditionalService)

**Location:** `com.emenu.features.main.service.ProductConditionalService`

**Key Methods:**
```java
public boolean businessUsesCategories(UUID businessId)
public boolean businessUsesSubcategories(UUID businessId)
public boolean businessUsesBrands(UUID businessId)
public ProductDetailDto convertProductToDetailDto(Product product, UUID businessId)
public ProductListDto convertProductToListDto(Product product, UUID businessId)
```

**Pattern:**
```java
// All controllers use this pattern
if (businessId != null && !productConditionalService.businessUsesCategories(businessId)) {
    return ResponseEntity.ok(ApiResponse.success(
        "Categories are not enabled for this business",
        Collections.emptyList()  // or empty PaginationResponse
    ));
}
```

---

## Protected Controllers (Authentication Required)

### 1. CategoryController
**Endpoints with feature visibility:**
- `POST /api/v1/categories/all` - Check useCategories flag
- `POST /api/v1/categories/my-business/all` - Check useCategories flag
- `POST /api/v1/categories/my-business/product/all` - Check useCategories flag

**Behavior:**
- If `useCategories = false` → Return empty list with "Categories are not enabled" message
- If `useCategories = true` → Return categories normally

### 2. BrandController
**Endpoints with feature visibility:**
- `POST /api/v1/brands/all` - Check useBrands flag
- `POST /api/v1/brands/my-business/all` - Check useBrands flag
- `POST /api/v1/brands/my-business/with-product-count` - Check useBrands flag

**Behavior:**
- If `useBrands = false` → Return empty list with "Brands are not enabled" message
- If `useBrands = true` → Return brands normally

### 3. SubcategoryController ✨ NEW
**Endpoints with feature visibility:**
- `POST /api/v1/subcategories/all` - Check useSubcategories flag
- `POST /api/v1/subcategories/my-business/all` - Check useSubcategories flag

**Behavior:**
- If `useSubcategories = false` → Return empty list with "Subcategories are not enabled" message
- If `useSubcategories = true` → Return subcategories normally

### 4. ProductController
**Endpoints with feature visibility:**
- `POST /api/v1/products/all` - Check category & brand filters
  - If filter has `categoryId` AND `useCategories = false` → Return empty
  - If filter has `brandId` AND `useBrands = false` → Return empty

**Behavior:**
- Filters products based on which features are enabled
- Admin endpoints ignore feature flags (for internal management)

### 5. ProductFavoriteController
**Endpoints with feature visibility:**
- `POST /api/v1/product-favorites/my-favorites` - Check category & brand filters
  - Respects feature flags for favorite filtering
  - Returns empty if user filters by disabled feature

---

## Public Controllers (No Authentication)

### 1. PublicCategoryController
**Endpoints with feature visibility:**
- `POST /api/v1/public/categories/all` - Check useCategories flag
- `POST /api/v1/public/categories/all-data` - Check useCategories flag

**Behavior:** Same as protected CategoryController

### 2. PublicBrandController
**Endpoints with feature visibility:**
- `POST /api/v1/public/brands/all` - Check useBrands flag
- `POST /api/v1/public/brands/all-data` - Check useBrands flag

**Behavior:** Same as protected BrandController

### 3. PublicSubcategoryController ✨ NEW
**Endpoints with feature visibility:**
- `POST /api/v1/public/subcategories/all` - Check useSubcategories flag
- `POST /api/v1/public/subcategories/all-data` - Check useSubcategories flag

**Behavior:** Same as protected SubcategoryController

### 4. PublicProductController
**Endpoints with feature visibility:**
- `POST /api/v1/public/products/all` - Check category & brand filters
- `POST /api/v1/public/products/all-data` - Check category & brand filters

**Behavior:** Same as protected ProductController

---

## Feature Matrix by Business Type

### ☕ Coffee Shop Configuration
**Settings:** `useCategories=true, useSubcategories=false, useBrands=false`

| Feature | Protected | Public | Admin | Example |
|---------|-----------|--------|-------|---------|
| Categories | ✅ Show | ✅ Show | ✅ Show | "Espresso Drinks", "Iced Beverages" |
| Subcategories | ❌ Empty | ❌ Empty | ✅ Show | Not used for coffee |
| Brands | ❌ Empty | ❌ Empty | ✅ Show | Not relevant for coffee |
| Product Sizes | ✅ Show | ✅ Show | ✅ Show | "Small", "Medium", "Large" |
| Promotions | ✅ Show | ✅ Show | ✅ Show | "20% off lattes today" |
| Inventory | ✅ Internal | ✅ Internal | ✅ Show | Stock levels for items |

**API Response Example:**
```json
{
  "success": true,
  "message": "Found 5 products",
  "data": [
    {
      "id": "p1",
      "name": "Iced Latte",
      "price": 3.50,
      "categoryId": "c1",              // ✅ Shown
      "categoryName": "Iced Beverages", // ✅ Shown
      "brandId": null,                 // ❌ Hidden (useBrands=false)
      "brandName": null                // ❌ Hidden (useBrands=false)
    }
  ]
}
```

### 👕 Clothing Store Configuration
**Settings:** `useCategories=true, useSubcategories=true, useBrands=true`

| Feature | Protected | Public | Admin | Example |
|---------|-----------|--------|-------|---------|
| Categories | ✅ Show | ✅ Show | ✅ Show | "Apparel", "Footwear" |
| Subcategories | ✅ Show | ✅ Show | ✅ Show | "T-Shirts", "Jeans", "Sneakers" |
| Brands | ✅ Show | ✅ Show | ✅ Show | "Nike", "Adidas", "Puma" |
| Product Sizes | ✅ Show | ✅ Show | ✅ Show | "XS", "S", "M", "L", "XL" |
| Promotions | ✅ Show | ✅ Show | ✅ Show | "Spring sale: 30% off" |
| Inventory | ✅ Internal | ✅ Internal | ✅ Show | Stock by size & color |

**API Response Example:**
```json
{
  "success": true,
  "message": "Found 12 products",
  "data": [
    {
      "id": "p7",
      "name": "Classic Cotton T-Shirt",
      "price": 19.99,
      "categoryId": "c3",           // ✅ Shown
      "categoryName": "Apparel",     // ✅ Shown
      "subcategoryId": "s2",         // ✅ Shown
      "subcategoryName": "T-Shirts", // ✅ Shown
      "brandId": "b1",               // ✅ Shown
      "brandName": "Nike"            // ✅ Shown
    }
  ]
}
```

### 🏥 Pharmacy Configuration
**Settings:** `useCategories=true, useSubcategories=false, useBrands=true`

| Feature | Protected | Public | Admin | Example |
|---------|-----------|--------|-------|---------|
| Categories | ✅ Show | ✅ Show | ✅ Show | "Vitamins", "Pain Relief" |
| Subcategories | ❌ Empty | ❌ Empty | ✅ Show | Not used |
| Brands | ✅ Show | ✅ Show | ✅ Show | "Bayer", "Pfizer", "Advil" |
| Product Sizes | ✅ Show | ✅ Show | ✅ Show | Tablet counts "30ct", "60ct" |
| Promotions | ✅ Show | ✅ Show | ✅ Show | "Buy 2 get 1 free" |
| Inventory | ✅ Internal | ✅ Internal | ✅ Show | Stock counts |

---

## Complete Endpoint Reference

### Categories
```
Protected:
  POST   /api/v1/categories/all              (Filter by useCategories)
  POST   /api/v1/categories/my-business/all  (Filter by useCategories)
  POST   /api/v1/categories/my-business/product/all (Filter by useCategories)
  GET    /api/v1/categories/{id}
  POST   /api/v1/categories
  PUT    /api/v1/categories/{id}
  DELETE /api/v1/categories/{id}

Public:
  POST   /api/v1/public/categories/all       (Filter by useCategories)
  POST   /api/v1/public/categories/all-data  (Filter by useCategories)
```

### Brands
```
Protected:
  POST   /api/v1/brands/all                  (Filter by useBrands)
  POST   /api/v1/brands/my-business/all      (Filter by useBrands)
  POST   /api/v1/brands/my-business/with-product-count (Filter by useBrands)
  GET    /api/v1/brands/{id}
  POST   /api/v1/brands
  PUT    /api/v1/brands/{id}
  DELETE /api/v1/brands/{id}

Public:
  POST   /api/v1/public/brands/all           (Filter by useBrands)
  POST   /api/v1/public/brands/all-data      (Filter by useBrands)
```

### Subcategories ✨ NEW
```
Protected:
  POST   /api/v1/subcategories/all           (Filter by useSubcategories)
  POST   /api/v1/subcategories/my-business/all (Filter by useSubcategories)
  GET    /api/v1/subcategories/{id}
  POST   /api/v1/subcategories
  PUT    /api/v1/subcategories/{id}
  DELETE /api/v1/subcategories/{id}

Public:
  POST   /api/v1/public/subcategories/all    (Filter by useSubcategories)
  POST   /api/v1/public/subcategories/all-data (Filter by useSubcategories)
```

### Products
```
Protected:
  POST   /api/v1/products/all                (Filter by useCategories & useBrands)
  POST   /api/v1/products/admin/all          (No feature filtering - admin)
  POST   /api/v1/products/admin/my-business/all (No feature filtering)
  POST   /api/v1/products/admin/stock/all    (No feature filtering)
  GET    /api/v1/products/{id}
  POST   /api/v1/products                    (Create - no filtering)
  PUT    /api/v1/products/{id}               (Update - no filtering)
  DELETE /api/v1/products/{id}               (Delete - no filtering)

Public:
  POST   /api/v1/public/products/all         (Filter by useCategories & useBrands)
  POST   /api/v1/public/products/all-data    (Filter by useCategories & useBrands)
  GET    /api/v1/public/products/{id}
```

### Product Favorites
```
Protected:
  POST   /api/v1/product-favorites/my-favorites (Filter by useCategories & useBrands)
  POST   /api/v1/product-favorites/{productId}/toggle
  DELETE /api/v1/product-favorites/all
```

---

## Files Created/Modified

### New Controllers
1. `SubcategoryController.java` - Protected subcategory endpoints with feature visibility
2. `PublicSubcategoryController.java` - Public subcategory endpoints with feature visibility

### Modified Controllers
1. `CategoryController.java` - Added useCategories checks
2. `BrandController.java` - Added useBrands checks
3. `ProductController.java` - Added category/brand filter checks
4. `ProductFavoriteController.java` - Added category/brand filter checks
5. `PublicCategoryController.java` - Added useCategories checks
6. `PublicBrandController.java` - Added useBrands checks
7. `PublicProductController.java` - Added category/brand filter checks

### Existing Services (No Changes)
- `ProductConditionalService.java` - Core conditional logic
- `BusinessSettingService.java` - Business settings caching
- Database migration: `V6__add_feature_visibility_flags.sql`

---

## Implementation Checklist

- [x] Feature flag columns added to business_settings table
- [x] BusinessSetting model updated with 3 new fields
- [x] ProductConditionalService created with helper methods
- [x] CategoryController integrated with feature checks
- [x] BrandController integrated with feature checks
- [x] ProductController integrated with feature checks
- [x] ProductFavoriteController integrated with feature checks
- [x] PublicCategoryController integrated with feature checks
- [x] PublicBrandController integrated with feature checks
- [x] PublicProductController integrated with feature checks
- [x] SubcategoryController created with feature checks ✨ NEW
- [x] PublicSubcategoryController created with feature checks ✨ NEW

---

## Testing Scenarios

### Scenario 1: Coffee Shop (useCategories=true, useBrands=false)

**Test 1.1 - Get Categories**
```
Request: POST /api/v1/categories/all
Response: 200 OK with category list ✅
```

**Test 1.2 - Get Brands**
```
Request: POST /api/v1/brands/all
Response: 200 OK with empty list (message: "Brands are not enabled") ✅
```

**Test 1.3 - Get Subcategories**
```
Request: POST /api/v1/subcategories/all
Response: 200 OK with empty list (message: "Subcategories are not enabled") ✅
```

**Test 1.4 - Get Products by Category**
```
Request: POST /api/v1/products/all with categoryId=c1
Response: 200 OK with filtered products ✅
```

**Test 1.5 - Get Products by Brand**
```
Request: POST /api/v1/products/all with brandId=b1
Response: 200 OK with empty list (message: "Brands are not enabled") ✅
```

### Scenario 2: Clothing Store (All enabled)

**Test 2.1 - Get All Features**
```
Request: POST /api/v1/categories/all
Response: 200 OK with categories ✅

Request: POST /api/v1/brands/all
Response: 200 OK with brands ✅

Request: POST /api/v1/subcategories/all
Response: 200 OK with subcategories ✅
```

**Test 2.2 - Get Products with All Filters**
```
Request: POST /api/v1/products/all
  - categoryId=c3
  - brandId=b1
Response: 200 OK with filtered products showing all fields ✅
```

---

## Performance Considerations

1. **BusinessSettings Caching** - Settings cached by BusinessSettingService to avoid repeated DB queries
2. **Early Returns** - Feature check happens before service call for disabled features
3. **Database Indexes** - Existing indexes on businessId, categoryId, brandId used
4. **Conditional Filtering** - Applied at controller level (before service layer)

---

## Future Enhancements

1. **Attribute Support** - Create AttributeController with feature flag
2. **Custom Features** - Add `customFeatures` JSON field to BusinessSetting for extensibility
3. **Feature Packages** - Predefined feature sets (Starter, Pro, Enterprise)
4. **Audit Trail** - Log when features are enabled/disabled per business
5. **Feature Usage Analytics** - Track which features are used by which businesses

---

## Migration Guide

### For Existing Businesses

1. **Default Settings Applied:**
   - `useCategories = true` (enabled by default)
   - `useSubcategories = false` (disabled by default)
   - `useBrands = false` (disabled by default)

2. **Update BusinessSettings:**
   ```sql
   UPDATE business_settings 
   SET use_categories = true, 
       use_subcategories = false, 
       use_brands = false 
   WHERE business_id = 'YOUR_BUSINESS_ID';
   ```

3. **Enable Features as Needed:**
   ```sql
   -- Enable brands for clothing business
   UPDATE business_settings 
   SET use_brands = true 
   WHERE business_id = 'CLOTHING_BUSINESS_ID';
   ```

---

## Support Matrix

| Feature | Coffee Shop | Restaurant | Clothing | Pharmacy | Bookstore |
|---------|------------|-----------|----------|----------|-----------|
| Categories | ✅ | ✅ | ✅ | ✅ | ✅ |
| Subcategories | ❌ | ❌ | ✅ | ❌ | ✅ |
| Brands | ❌ | ❌ | ✅ | ✅ | ✅ |
| Sizes/Variants | ✅ | ✅ | ✅ | ✅ | ❌ |
| Promotions | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | ✅ | ✅ |

---

**Implementation Status:** ✅ Complete  
**Last Updated:** 2026-04-22  
**Version:** 1.0 (Full Feature Visibility Control)

