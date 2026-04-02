# Backend DTO Update Guide - Complete Sales Preview

## 📋 Fields to Add to ProductStockItemDto

### Summary of Additions
**Total New Fields**: 27 fields  
**Removed**: ProductStockDto becomes ProductStockItemDto  
**Purpose**: Complete sales preview with all product, pricing, inventory, and engagement data

---

## 🔄 Field Mapping - Where to Get Data

### From Product Table
```
categoryId           ← Product.categoryId
categoryName        ← Category.name (join with Category table)
brandId             ← Product.brandId
brandName           ← Brand.name (join with Brand table)
description         ← Product.description
sku                 ← Product.sku
barcode             ← Product.barcode
mainImageUrl        ← Product.mainImageUrl
status              ← Product.status
type                ← IF(hasSizes) "SIZE" ELSE "PRODUCT"
```

### From ProductPrice/Pricing Table
```
price               ← Product.price (base selling price)
displayPrice        ← CALCULATED (if hasPromotion, apply discount)
displayPromotionType     ← ProductPromotion.promotionType
displayPromotionValue    ← ProductPromotion.promotionValue
displayPromotionFromDate ← ProductPromotion.fromDate
displayPromotionToDate   ← ProductPromotion.toDate
hasPromotion        ← IF(currentDate BETWEEN fromDate AND toDate) true
```

### From ProductImage Table
```
images[] {
  id                ← ProductImage.id
  imageUrl          ← ProductImage.imageUrl
  displayOrder      ← ProductImage.displayOrder
}
```

### From ProductStock Table (Stock Items)
```
totalStock          ← SUM(quantityOnHand - quantityReserved) for item
quantityAvailable   ← totalStock - quantityReserved
quantityReserved    ← SUM of reserved quantities
quantityOnHand      ← SUM of quantityOnHand
stockStatus         ← Product.stockStatus
```

### From Analytics/Engagement Tables
```
viewCount           ← ProductAnalytics.viewCount OR ProductEngagement.viewCount
favoriteCount       ← ProductEngagement.favoriteCount OR UserFavorite COUNT
```

### Derived/Calculated Fields
```
sizeName            ← IF(productSizeId != null) ProductSize.name ELSE null
displayPrice        ← IF(hasPromotion) 
                        price - (price * promotionValue / 100)  // for PERCENTAGE
                        price - promotionValue                   // for FIXED_AMOUNT
                      ELSE price
type                ← IF(hasSizes) "SIZE" ELSE "PRODUCT"
```

---

## 🗄️ Database Query Strategy

### Option 1: Single Query with Multiple Joins (Recommended for Pagination)
```sql
SELECT 
    -- Stock Item Fields
    si.id,
    si.productId,
    si.productSizeId,
    
    -- Product Fields
    p.name as productName,
    p.description,
    p.categoryId,
    c.name as categoryName,
    p.brandId,
    b.name as brandName,
    p.status,
    p.sku,
    p.barcode,
    p.mainImageUrl,
    CASE WHEN p.hasSizes THEN 'SIZE' ELSE 'PRODUCT' END as type,
    
    -- Size Fields
    ps.name as sizeName,
    
    -- Stock Quantities
    si.quantityOnHand,
    si.quantityReserved,
    (si.quantityOnHand - si.quantityReserved) as quantityAvailable,
    
    -- Pricing & Promotion
    p.price,
    CASE 
        WHEN pp.id IS NOT NULL AND NOW() BETWEEN pp.fromDate AND pp.toDate THEN
            CASE 
                WHEN pp.promotionType = 'PERCENTAGE' THEN 
                    p.price - (p.price * pp.promotionValue / 100)
                ELSE 
                    p.price - pp.promotionValue
            END
        ELSE p.price
    END as displayPrice,
    pp.promotionType as displayPromotionType,
    pp.promotionValue as displayPromotionValue,
    pp.fromDate as displayPromotionFromDate,
    pp.toDate as displayPromotionToDate,
    CASE 
        WHEN pp.id IS NOT NULL AND NOW() BETWEEN pp.fromDate AND pp.toDate THEN true 
        ELSE false 
    END as hasPromotion,
    
    -- Stock Status
    p.stockStatus,
    
    -- Engagement
    pa.viewCount,
    COALESCE(uf.favoriteCount, 0) as favoriteCount,
    
    -- Metadata
    si.createdAt,
    si.updatedAt

FROM ProductStockItems si
JOIN Product p ON si.productId = p.id
LEFT JOIN Category c ON p.categoryId = c.id
LEFT JOIN Brand b ON p.brandId = b.id
LEFT JOIN ProductSize ps ON si.productSizeId = ps.id
LEFT JOIN ProductPromotion pp ON p.id = pp.productId 
    AND NOW() BETWEEN pp.fromDate AND pp.toDate
LEFT JOIN ProductAnalytics pa ON p.id = pa.productId
LEFT JOIN (
    SELECT productId, COUNT(*) as favoriteCount 
    FROM UserFavorite 
    GROUP BY productId
) uf ON p.id = uf.productId

WHERE p.businessId = :businessId
-- Add other filters (status, stockStatus, search, etc.)

ORDER BY si.createdAt DESC
LIMIT :pageSize OFFSET :offset
```

### Option 2: Separate Queries for Images
```sql
-- Main query (above)

-- Images query (run separately if needed)
SELECT 
    pi.id,
    pi.imageUrl,
    pi.displayOrder
FROM ProductImage pi
WHERE pi.productId = :productId
ORDER BY pi.displayOrder
```

---

## 🔧 Implementation Steps

### Step 1: Update DTO Class
```java
// Update ProductStockItemDto with all new fields
// Include inner ProductImageDto class for images array
```

### Step 2: Update Repository Query
```java
// Update ProductStockRepository.findAllByBusinessId() or similar
// to include all the necessary JOINs and calculations
```

### Step 3: Update Service Layer
```java
@Service
public class ProductStockService {
    
    public Page<ProductStockItemDto> getAllStockItems(
        UUID businessId,
        ProductStockItemsFilterRequest filter,
        Pageable pageable) {
        
        // Execute query with all fields
        // Map to DTO
        // Return paginated response
    }
    
    public List<ProductStockItemDto> getAllStockItemsWithoutPagination(
        UUID businessId,
        ProductStockItemsFilterRequest filter) {
        
        // Same query but without pagination
    }
}
```

### Step 4: Update Controller
```java
@RestController
@RequestMapping("/api/v1/product-stock/items")
public class ProductStockController {
    
    @PostMapping("/my-business")
    public ResponseEntity<ApiResponse<Page<ProductStockItemDto>>> 
    getAllProductStockItems(
        @RequestBody ProductStockItemsFilterRequest filter,
        Pageable pageable) {
        // Returns paginated results
    }
    
    @PostMapping("/my-business/all")
    public ResponseEntity<ApiResponse<ProductStockItemsListResponse<ProductStockItemDto>>> 
    getAllProductStockItemsNoPagination(
        @RequestBody ProductStockItemsFilterRequest filter) {
        // Returns all results without pagination
    }
}
```

---

## ✅ Critical Field Requirements

### Must Never Be Null
- `sku` - Use empty string "" as fallback if needed
- `barcode` - Use empty string "" as fallback if needed
- `totalStock` - Default to 0
- `quantityAvailable` - Default to 0
- `quantityReserved` - Default to 0

### Must Have Default Values
- `viewCount` - Default to 0
- `favoriteCount` - Default to 0
- `displayPrice` - Should equal base price if no promotion
- `hasPromotion` - false if no active promotion
- `type` - "PRODUCT" or "SIZE"

### URL Fields Must Be Valid
- `mainImageUrl` - Absolute URL (https://...) or null
- `images[].imageUrl` - Absolute URL (https://...) or null

---

## 🧪 Testing Checklist

- [ ] Test with product that has sizes (type: SIZE)
- [ ] Test with product without sizes (type: PRODUCT)
- [ ] Test with active promotion
- [ ] Test without promotion
- [ ] Test with multiple images
- [ ] Test with no images
- [ ] Test pagination
- [ ] Test all filter combinations
- [ ] Verify SKU/Barcode never null
- [ ] Verify displayPrice calculation correct
- [ ] Verify quantityAvailable = totalStock - reserved
- [ ] Test with high engagement (many views/favorites)
- [ ] Test with zero views/favorites
- [ ] Verify image URLs are absolute paths
- [ ] Performance test with large dataset

---

## 📊 Field Count Summary

| Category | Count | Notes |
|----------|-------|-------|
| Identity | 3 | id, productId, productSizeId |
| Product Info | 9 | name, description, category, brand, status, etc. |
| Codes | 2 | sku, barcode (CRITICAL) |
| Sizing | 1 | sizeName |
| Pricing | 7 | price, displayPrice, promotion info |
| Inventory | 4 | totalStock, available, reserved, onHand |
| Stock Status | 1 | stockStatus |
| Type | 1 | type (PRODUCT/SIZE) |
| Images | 2 | mainImageUrl, images array |
| Engagement | 2 | viewCount, favoriteCount |
| Metadata | 2 | createdAt, updatedAt |
| **TOTAL** | **34** | |

---

## 🎯 Expected Response Example

```json
{
  "pageNo": 1,
  "pageSize": 15,
  "totalElements": 250,
  "totalPages": 17,
  "content": [
    {
      "id": "2209cb33-da41-45de-a474-e5945b9f4637",
      "productId": "f99e8f32-41fa-481f-99ca-747d9d4520cb",
      "productSizeId": "2209cb33-da41-45de-a474-e5945b9f4637",
      "productName": "Product 1626",
      "description": "High-quality product...",
      "categoryId": "cat-6",
      "categoryName": "Category 6",
      "brandId": "brand-6",
      "brandName": "Brand 6",
      "status": "ACTIVE",
      "sku": "SKU-1626",
      "barcode": "BARCODE-1626",
      "sizeName": "Medium",
      "price": "21.00",
      "displayPrice": 19.95,
      "displayPromotionType": "PERCENTAGE",
      "displayPromotionValue": 5,
      "displayPromotionFromDate": "2026-04-01T01:41:00",
      "displayPromotionToDate": "2026-05-01T01:41:00",
      "hasPromotion": true,
      "totalStock": 386,
      "quantityAvailable": 380,
      "quantityReserved": 6,
      "quantityOnHand": 386,
      "stockStatus": "ENABLED",
      "type": "SIZE",
      "mainImageUrl": "https://cdn.example.com/images/1626.jpg",
      "images": [
        {
          "id": "img-1",
          "imageUrl": "https://cdn.example.com/images/1626-1.jpg",
          "displayOrder": 1
        }
      ],
      "viewCount": 1250,
      "favoriteCount": 45,
      "createdAt": "2026-03-27T13:41:00",
      "updatedAt": "2026-03-18T13:41:00"
    }
  ]
}
```

---

## 📝 Summary

The original `ProductStockDto` needs to be **expanded into `ProductStockItemDto`** with:
- **+27 new fields** for complete sales preview
- **More sophisticated queries** with multiple JOINs
- **Calculated fields** for pricing and availability
- **Complete product context** for rich preview

All fields are documented and mapped to their database sources. Implementation should be straightforward following the SQL query pattern provided.
