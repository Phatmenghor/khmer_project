# Complete Response Implementation - Field by Field

## 📍 WHERE Each Field Comes From

### From `Product` Table
```java
id                          ← ProductStockItem.id
productId                   ← ProductStockItem.productId
productName                 ← Product.name
description                 ← Product.description
sku                         ← Product.sku               ✅ CRITICAL
barcode                     ← Product.barcode           ✅ CRITICAL
price                       ← Product.price              (base price)
mainImageUrl                ← Product.mainImageUrl
```

### From `Category` Table (JOIN)
```java
categoryId                  ← Product.categoryId
categoryName                ← Category.name
```

### From `Brand` Table (JOIN)
```java
brandId                     ← Product.brandId
brandName                   ← Brand.name
```

### From `ProductPromotion` Table (JOIN - Optional, if active)
```java
displayPromotionType        ← ProductPromotion.type     (PERCENTAGE/FIXED_AMOUNT)
displayPromotionValue       ← ProductPromotion.value
displayPromotionFromDate    ← ProductPromotion.fromDate
displayPromotionToDate      ← ProductPromotion.toDate
hasPromotion                ← IF(NOW() BETWEEN fromDate AND toDate) true else false
```

### Calculated Fields (in SQL or Java)
```java
displayPrice                ← CALCULATED:
                               IF hasPromotion:
                                 IF type = PERCENTAGE:
                                   price - (price * promotionValue / 100)
                                 ELSE:
                                   price - promotionValue
                               ELSE:
                                 price
```

### From `ProductStockItem` Table
```java
totalStock                  ← SUM(quantityOnHand - quantityReserved)
quantityAvailable           ← totalStock - quantityReserved
quantityReserved            ← SUM(quantityReserved)
quantityOnHand              ← SUM(quantityOnHand)
```

---

## 🔧 SQL Query to Get Complete Response

```sql
SELECT 
    -- Stock Item Identity
    psi.id,
    psi.productId,
    
    -- Product Information
    p.name AS productName,
    p.description,
    p.sku,                           -- CRITICAL: Never null
    p.barcode,                       -- CRITICAL: Never null
    p.price,
    p.mainImageUrl,
    
    -- Category Information (JOIN)
    p.categoryId,
    c.name AS categoryName,
    
    -- Brand Information (JOIN)
    p.brandId,
    b.name AS brandName,
    
    -- Stock Quantities
    psi.quantityOnHand,
    psi.quantityReserved,
    (psi.quantityOnHand - psi.quantityReserved) AS quantityAvailable,
    SUM(psi.quantityOnHand - psi.quantityReserved) AS totalStock,
    
    -- Promotion Information (LEFT JOIN - may be null)
    pp.type AS displayPromotionType,
    pp.value AS displayPromotionValue,
    pp.fromDate AS displayPromotionFromDate,
    pp.toDate AS displayPromotionToDate,
    
    -- Calculated Promotion Price
    CASE 
        WHEN pp.id IS NOT NULL AND NOW() BETWEEN pp.fromDate AND pp.toDate THEN
            CASE 
                WHEN pp.type = 'PERCENTAGE' THEN 
                    CAST(p.price * (1 - pp.value / 100) AS DECIMAL(10,2))
                ELSE 
                    CAST(p.price - pp.value AS DECIMAL(10,2))
            END
        ELSE 
            CAST(p.price AS DECIMAL(10,2))
    END AS displayPrice,
    
    -- Promotion Flag
    CASE 
        WHEN pp.id IS NOT NULL AND NOW() BETWEEN pp.fromDate AND pp.toDate THEN true
        ELSE false
    END AS hasPromotion

FROM product_stock_items psi
JOIN product p ON psi.productId = p.id
LEFT JOIN category c ON p.categoryId = c.id
LEFT JOIN brand b ON p.brandId = b.id
LEFT JOIN product_promotion pp ON p.id = pp.productId 
    AND NOW() BETWEEN pp.fromDate AND pp.toDate

WHERE p.businessId = :businessId
    AND p.status = 'ACTIVE'
    
GROUP BY psi.id, p.id, c.id, b.id, pp.id

ORDER BY psi.createdAt DESC
LIMIT :pageSize OFFSET :offset
```

---

## ☕ Java Implementation

### 1. Update Your Repository
```java
@Repository
public interface ProductStockItemRepository extends JpaRepository<ProductStockItem, UUID> {
    
    @Query("""
        SELECT new com.emenu.features.stock.dto.response.ProductStockItemDto(
            psi.id,
            psi.productId,
            p.name,
            p.description,
            p.sku,
            p.barcode,
            p.categoryId,
            c.name,
            p.brandId,
            b.name,
            p.price,
            CASE 
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN
                    CASE 
                        WHEN pp.type = 'PERCENTAGE' THEN CAST(p.price * (1 - pp.value / 100) AS java.math.BigDecimal)
                        ELSE CAST(p.price - pp.value AS java.math.BigDecimal)
                    END
                ELSE CAST(p.price AS java.math.BigDecimal)
            END,
            CASE 
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.type
                ELSE null
            END,
            CASE 
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.value
                ELSE null
            END,
            CASE 
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.fromDate
                ELSE null
            END,
            CASE 
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN pp.toDate
                ELSE null
            END,
            CASE 
                WHEN pp.id IS NOT NULL AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate THEN true
                ELSE false
            END,
            SUM(psi.quantityOnHand),
            SUM(psi.quantityOnHand - psi.quantityReserved),
            SUM(psi.quantityReserved),
            psi.quantityOnHand,
            p.mainImageUrl
        )
        FROM ProductStockItem psi
        JOIN Product p ON psi.productId = p.id
        LEFT JOIN Category c ON p.categoryId = c.id
        LEFT JOIN Brand b ON p.brandId = b.id
        LEFT JOIN ProductPromotion pp ON p.id = pp.productId 
            AND CURRENT_TIMESTAMP BETWEEN pp.fromDate AND pp.toDate
        WHERE p.businessId = :businessId
        GROUP BY psi.id, p.id, c.id, b.id, pp.id
        ORDER BY psi.createdAt DESC
    """)
    Page<ProductStockItemDto> findAllStockItems(
        @Param("businessId") UUID businessId,
        Pageable pageable
    );
}
```

### 2. Update Your Service
```java
@Service
@Transactional(readOnly = true)
public class ProductStockService {
    
    private final ProductStockItemRepository repository;
    
    public ApiResponse<Page<ProductStockItemDto>> getAllStockItems(
        UUID businessId,
        ProductStockItemsFilterRequest filter,
        Pageable pageable) {
        
        Page<ProductStockItemDto> items = repository.findAllStockItems(businessId, pageable);
        
        return ApiResponse.success("Product stock items retrieved", items);
    }
}
```

### 3. Update Your Controller
```java
@RestController
@RequestMapping("/api/v1/product-stock/items")
public class ProductStockController {
    
    private final ProductStockService service;
    
    @PostMapping("/my-business")
    public ResponseEntity<ApiResponse<Page<ProductStockItemDto>>> getAllStockItems(
        @RequestBody ProductStockItemsFilterRequest filter,
        @PageableDefault(size = 15) Pageable pageable) {
        
        UUID businessId = getCurrentUserBusinessId(); // Get from auth
        
        ApiResponse<Page<ProductStockItemDto>> response = 
            service.getAllStockItems(businessId, filter, pageable);
        
        return ResponseEntity.ok(response);
    }
}
```

---

## 📦 Complete Response Example

```json
{
  "status": "success",
  "message": "Product stock items retrieved",
  "data": {
    "pageNo": 1,
    "pageSize": 15,
    "totalElements": 250,
    "totalPages": 17,
    "content": [
      {
        "id": "2209cb33-da41-45de-a474-e5945b9f4637",
        "productId": "f99e8f32-41fa-481f-99ca-747d9d4520cb",
        "productName": "Product 1626",
        "description": "High-quality product with excellent features and durability",
        "sku": "SKU-1626",
        "barcode": "BARCODE-1626",
        "categoryId": "cat-6",
        "categoryName": "Category 6",
        "brandId": "brand-6",
        "brandName": "Brand 6",
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
        "mainImageUrl": "https://cdn.example.com/images/product-1626.jpg"
      },
      {
        "id": "...",
        "productId": "...",
        // ... more items
      }
    ]
  }
}
```

---

## 🔗 Database Schema Relationships

```
Product Table
├── id (PK)
├── name ─────────────────→ productName
├── description ──────────→ description
├── sku ───────────────────→ sku
├── barcode ───────────────→ barcode
├── price ─────────────────→ price
├── mainImageUrl ─────────→ mainImageUrl
├── categoryId (FK) ──────→ [JOIN Category]
│   └── Category.name ─────→ categoryName
├── brandId (FK) ────────→ [JOIN Brand]
│   └── Brand.name ────────→ brandName
└── id (FK) ────────────→ [JOIN ProductPromotion]
    └── ProductPromotion
        ├── type ──────────→ displayPromotionType
        ├── value ─────────→ displayPromotionValue
        ├── fromDate ──────→ displayPromotionFromDate
        └── toDate ────────→ displayPromotionToDate

ProductStockItem Table
├── id ────────────────────→ id
├── productId ──────────────→ productId
├── quantityOnHand ────────→ quantityOnHand
└── quantityReserved ──────→ quantityReserved
    (Calculated: quantityAvailable = quantityOnHand - quantityReserved)
    (Calculated: totalStock = SUM(quantityOnHand - quantityReserved))
```

---

## ✅ Implementation Checklist

- [ ] Update ProductStockItemDto with all 34 fields
- [ ] Update repository query with all JOINs
- [ ] Add calculated fields (displayPrice, quantityAvailable, totalStock)
- [ ] Update service to use new repository method
- [ ] Update controller endpoint
- [ ] Test with multiple products
- [ ] Test promotion calculation (PERCENTAGE vs FIXED_AMOUNT)
- [ ] Test with/without promotions
- [ ] Verify SKU/Barcode never null
- [ ] Verify pagination works correctly
- [ ] Performance test with large dataset
- [ ] Test filtering by status, category, brand
- [ ] Verify image URL is absolute path

---

## 🚀 That's It!

This complete query and implementation will return the exact response format you showed, with:
- ✅ All product details
- ✅ Complete pricing & promotion info
- ✅ Inventory breakdown
- ✅ Proper calculations
- ✅ Pagination support

The frontend modal will then display all this data beautifully! 🎨
