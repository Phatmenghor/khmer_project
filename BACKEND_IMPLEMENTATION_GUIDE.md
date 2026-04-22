# Backend Implementation Guide - Feature Visibility Control

## Coffee Shop Configuration (useCategories: true, useSubcategories: false, useBrands: false)

This guide shows the complete backend implementation for conditional feature visibility.

---

## Files Created/Modified

### 1. **Updated Models**

#### BusinessSetting.java
```java
@Column(name = "use_categories", nullable = false)
private Boolean useCategories = true;

@Column(name = "use_subcategories", nullable = false)
private Boolean useSubcategories = false;

@Column(name = "use_brands", nullable = false)
private Boolean useBrands = false;
```

#### Product.java
- Made `categoryId` nullable (was required)
- Added `subcategoryId` field for future expansion

---

### 2. **New DTOs**

#### ProductResponseDto.java
```java
// Conditionally included fields
private UUID categoryId;
private String categoryName;
private UUID subcategoryId;
private String subcategoryName;
private UUID brandId;
private String brandName;

// Helper method to null out fields
public void applyBusinessSettings(
    Boolean useCategories,
    Boolean useSubcategories,
    Boolean useBrands) {
    
    if (!useCategories) {
        this.categoryId = null;
        this.categoryName = null;
    }
    
    if (!useSubcategories) {
        this.subcategoryId = null;
        this.subcategoryName = null;
    }
    
    if (!useBrands) {
        this.brandId = null;
        this.brandName = null;
    }
}
```

---

### 3. **New Service Layer**

#### ProductConditionalService.java

**Key Methods:**

1. **convertProductToDetailDto(Product, UUID businessId)**
   - Converts Product to ProductDetailDto
   - Fetches BusinessSettings for the business
   - Applies visibility rules before returning

```java
public ProductDetailDto convertProductToDetailDto(Product product, UUID businessId) {
    ProductDetailDto dto = convertProductToDetailDtoInternal(product);
    
    BusinessSetting settings = businessSettingService.getBusinessSettings(businessId);
    if (settings != null) {
        applyBusinessSettingsToDetailDto(dto, settings);
    }
    
    return dto;
}
```

2. **convertProductToListDto(Product, UUID businessId)**
   - Similar for list responses

3. **businessUsesCategories(UUID businessId)**
   - Helper to check if feature is enabled

```java
public boolean businessUsesCategories(UUID businessId) {
    BusinessSetting settings = businessSettingService.getBusinessSettings(businessId);
    return settings != null && (settings.getUseCategories() == null || settings.getUseCategories());
}
```

4. **businessUsesBrands(UUID businessId)**
   - Helper to check brands feature

5. **businessUsesSubcategories(UUID businessId)**
   - Helper to check subcategories feature

---

### 4. **New Controllers**

#### ProductConditionalController.java

**Endpoints:**

1. **GET /api/v1/products/{id}/business/{businessId}/conditional**
   - Returns product with conditional fields filtered
   - Applies business settings automatically

2. **GET /api/v1/products/category/{categoryId}/business/{businessId}/conditional**
   - Returns empty list if `useCategories = false`
   - Otherwise returns products in category with filters applied

3. **GET /api/v1/products/brand/{brandId}/business/{businessId}/conditional**
   - Returns empty list if `useBrands = false`
   - Otherwise returns products with brand with filters applied

4. **GET /api/v1/products/business/{businessId}/all/conditional**
   - Returns all products for business with filters applied

---

#### CategoryConditionalController.java

**Endpoints:**

1. **GET /api/v1/categories/business/{businessId}/conditional**
   ```java
   if (!productConditionalService.businessUsesCategories(businessId)) {
       return ResponseEntity.ok(ApiResponse.success(
           "Categories are not enabled for this business",
           Collections.emptyList()
       ));
   }
   ```

2. **GET /api/v1/categories/{id}/business/{businessId}/conditional**
   - Returns null if categories not enabled

---

#### BrandConditionalController.java

**Endpoints:**

1. **GET /api/v1/brands/business/{businessId}/conditional**
   ```java
   if (!productConditionalService.businessUsesBrands(businessId)) {
       return ResponseEntity.ok(ApiResponse.success(
           "Brands are not enabled for this business",
           Collections.emptyList()
       ));
   }
   ```

2. **GET /api/v1/brands/{id}/business/{businessId}/conditional**
   - Returns null if brands not enabled

---

### 5. **Database Migration**

#### V6__add_feature_visibility_flags.sql

```sql
-- Add feature flags
ALTER TABLE business_settings
ADD COLUMN use_categories BOOLEAN DEFAULT true NOT NULL,
ADD COLUMN use_subcategories BOOLEAN DEFAULT false NOT NULL,
ADD COLUMN use_brands BOOLEAN DEFAULT false NOT NULL;

-- Make category optional
ALTER TABLE products
ALTER COLUMN category_id DROP NOT NULL;

-- Add subcategory support
ALTER TABLE products
ADD COLUMN subcategory_id UUID,
ADD CONSTRAINT fk_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories(id);

-- Index for performance
CREATE INDEX idx_products_subcategory_id ON products(subcategory_id);
```

---

## How It Works - Flow Diagram

### Coffee Shop Scenario (useCategories: true, useBrands: false)

```
Customer Requests Product
        ↓
ProductConditionalController.getProductForBusiness(id, businessId)
        ↓
ProductConditionalService.convertProductToDetailDto(product, businessId)
        ↓
Fetch BusinessSettings for businessId
        ↓
        └─→ useCategories = true
            useSubcategories = false
            useBrands = false
        ↓
Apply business settings to DTO:
    ✅ Keep categoryId, categoryName
    ❌ Remove subcategoryId, subcategoryName
    ❌ Remove brandId, brandName
        ↓
Return ProductDetailDto to client:
{
  "id": "...",
  "name": "Iced Latte",
  "categoryId": "c1",              ✅
  "categoryName": "Iced Beverages", ✅
  "subcategoryId": null,           ❌ (removed)
  "subcategoryName": null,         ❌ (removed)
  "brandId": null,                 ❌ (removed)
  "brandName": null,               ❌ (removed)
  "variants": [...]
}
```

---

## Example Usage

### 1. Get Product with Conditional Fields

**Request:**
```
GET /api/v1/products/p1/business/biz-coffee-1/conditional
```

**Response (Coffee Shop - useCategories: true, useBrands: false):**
```json
{
  "id": "p1",
  "name": "Iced Latte",
  "price": 3.50,
  "categoryId": "c1",              // ✅ Shown
  "categoryName": "Iced Beverages", // ✅ Shown
  "subcategoryId": null,           // ❌ Hidden
  "subcategoryName": null,         // ❌ Hidden
  "brandId": null,                 // ❌ Hidden
  "brandName": null,               // ❌ Hidden
  "variants": [
    {
      "id": "v1",
      "name": "Small",
      "price": 2.50,
      "attributes": {"size": "small"}
    }
  ]
}
```

**Response (Clothing Store - All enabled):**
```json
{
  "id": "p7",
  "name": "Classic Cotton T-Shirt",
  "price": 19.99,
  "categoryId": "c3",           // ✅ Shown
  "categoryName": "Apparel",     // ✅ Shown
  "subcategoryId": "s2",         // ✅ Shown
  "subcategoryName": "T-Shirts", // ✅ Shown
  "brandId": "b1",               // ✅ Shown
  "brandName": "Nike",           // ✅ Shown
  "variants": [...]
}
```

---

### 2. Get Categories (Conditional)

**Request:**
```
GET /api/v1/categories/business/biz-coffee-1/conditional
```

**Response (Coffee Shop - useCategories: true):**
```json
{
  "success": true,
  "message": "Found 3 categories",
  "data": [
    {"id": "c1", "name": "Espresso Drinks"},
    {"id": "c2", "name": "Iced Beverages"},
    {"id": "c3", "name": "Pastries"}
  ]
}
```

**Request (Different business - useCategories: false):**
```
GET /api/v1/categories/business/biz-pharmacy-1/conditional
```

**Response:**
```json
{
  "success": true,
  "message": "Categories are not enabled for this business",
  "data": []
}
```

---

### 3. Get Products by Category (Conditional)

**Request:**
```
GET /api/v1/products/category/c1/business/biz-coffee-1/conditional
```

**Response (useCategories: true):**
```json
{
  "success": true,
  "message": "Found 5 products",
  "data": [
    {
      "id": "p1",
      "name": "Espresso",
      "categoryId": "c1",              // ✅ Shown
      "categoryName": "Espresso Drinks" // ✅ Shown
    },
    // ... more products
  ]
}
```

**Request (Different business - useCategories: false):**
```
GET /api/v1/products/category/c1/business/biz-pharmacy-1/conditional
```

**Response:**
```json
{
  "success": true,
  "message": "Categories are not enabled for this business",
  "data": []
}
```

---

### 4. Get Brands (Conditional)

**Request:**
```
GET /api/v1/brands/business/biz-coffee-1/conditional
```

**Response (Coffee Shop - useBrands: false):**
```json
{
  "success": true,
  "message": "Brands are not enabled for this business",
  "data": []
}
```

**Request (Clothing Store - useBrands: true):**
```
GET /api/v1/brands/business/biz-clothing-1/conditional
```

**Response:**
```json
{
  "success": true,
  "message": "Found 10 brands",
  "data": [
    {"id": "b1", "name": "Nike"},
    {"id": "b2", "name": "Adidas"},
    // ... more brands
  ]
}
```

---

## Implementation Steps

### Step 1: Update Database
```bash
# Run Flyway migration
# V6__add_feature_visibility_flags.sql will be applied automatically
```

### Step 2: Update Entity Models
- ✅ BusinessSetting.java - Add 3 columns
- ✅ Product.java - Update category_id nullable, add subcategory_id

### Step 3: Create Service Layer
- ✅ ProductConditionalService.java - Handle conditional logic

### Step 4: Create DTOs
- ✅ ProductResponseDto.java - New response DTO with conditional fields

### Step 5: Create Controllers
- ✅ ProductConditionalController.java - Product endpoints
- ✅ CategoryConditionalController.java - Category endpoints
- ✅ BrandConditionalController.java - Brand endpoints

### Step 6: Update Existing Code (Optional)
- Update ProductService to use ProductConditionalService
- Update existing controllers to also support conditional endpoints

---

## Testing Checklist

### Coffee Shop (useCategories: true, useSubcategories: false, useBrands: false)

- [ ] GET /products/{id}/business/biz-coffee/conditional
  - Verify: categoryId and categoryName are shown
  - Verify: subcategoryId, subcategoryName, brandId, brandName are null

- [ ] GET /categories/business/biz-coffee/conditional
  - Verify: Returns list of categories

- [ ] GET /products/category/{id}/business/biz-coffee/conditional
  - Verify: Returns products in category

- [ ] GET /brands/business/biz-coffee/conditional
  - Verify: Returns empty list with "Brands not enabled" message

### Clothing Store (All enabled)

- [ ] GET /products/{id}/business/biz-clothing/conditional
  - Verify: ALL fields shown (category, subcategory, brand)

- [ ] GET /categories/business/biz-clothing/conditional
  - Verify: Returns list of categories

- [ ] GET /brands/business/biz-clothing/conditional
  - Verify: Returns list of brands

- [ ] GET /products/category/{id}/business/biz-clothing/conditional
  - Verify: Returns products with all fields

---

## Security Notes

- All endpoints include businessId validation
- Products are only returned if they belong to the requested business
- Categories/Brands are only returned if the business uses them
- No data leakage between businesses

---

## Performance Optimization

- BusinessSettings is cached by BusinessSettingService
- Queries use indexes for fast lookups
- Conditional fields are filtered at DTO level (not database query level)
- Consider caching entire ProductDetailDto for frequently accessed products

---

## Future Enhancements

1. **Batch Conditional Processing**
   ```java
   public List<ProductListDto> convertProducts(List<Product> products, UUID businessId) {
       BusinessSetting settings = businessSettingService.getBusinessSettings(businessId);
       return products.stream()
           .map(p -> convertProductToListDto(p, businessId, settings))
           .toList();
   }
   ```

2. **Database-level Filtering**
   ```java
   // Instead of filtering at DTO level
   @Query("SELECT new com.emenu.features.main.dto.response.ProductListDto(...) " +
          "FROM Product p WHERE p.businessId = :businessId " +
          "AND (:useCategories = false OR p.categoryId IS NOT NULL)")
   List<ProductListDto> findConditionalProducts(
       @Param("businessId") UUID businessId,
       @Param("useCategories") Boolean useCategories);
   ```

3. **Subcategory Support**
   - Create SubCategoryController.java
   - Add subcategory endpoints similar to category endpoints
   - Filter products by subcategory when enabled

---

**Ready to test!** 🚀
