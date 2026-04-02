# Backend Requirements: Sales Preview - Complete API Response Fields

## Overview
For the Stock Items page to display a complete **Sales Preview** modal when clicking "View Details", the `/api/v1/product-stock/items/my-business` API endpoint needs to return comprehensive product and inventory data.

---

## 📋 Required API Response Fields

### Endpoint
```
POST /api/v1/product-stock/items/my-business
```

### Complete Response Structure (All Fields Required)

```typescript
{
  "pageNo": number,
  "pageSize": number,
  "totalElements": number,
  "totalPages": number,
  "content": [
    {
      // ========== BASIC IDENTIFICATION ==========
      "id": "2209cb33-da41-45de-a474-e5945b9f4637",
      "productId": "f99e8f32-41fa-481f-99ca-747d9d4520cb",
      "productSizeId": "2209cb33-da41-45de-a474-e5945b9f4637",  // null for PRODUCT type
      
      // ========== PRODUCT INFORMATION ==========
      "productName": "Product 1626",
      "description": "High-quality product with excellent features...",  // REQUIRED for preview
      "categoryId": "cat-6",                                           // REQUIRED
      "categoryName": "Category 6",
      "brandId": "brand-6",                                            // REQUIRED
      "brandName": "Brand 6",
      "status": "ACTIVE",  // "ACTIVE" or "INACTIVE"
      
      // ========== IDENTIFICATION CODES (CRITICAL) ==========
      "sku": "SKU-1626",          // CRITICAL: Never null/empty
      "barcode": "BARCODE-1626",  // CRITICAL: Never null/empty
      
      // ========== SIZE INFORMATION ==========
      "sizeName": "Medium",  // null for products without sizes
      
      // ========== PRICING & PROMOTIONS ==========
      "price": "21.00",                              // Base selling price
      "displayPrice": 19.95,                         // Final price after discount
      "displayPromotionType": "PERCENTAGE",          // "PERCENTAGE" or "FIXED_AMOUNT"
      "displayPromotionValue": 5,                    // 5% or $5
      "displayPromotionFromDate": "2026-04-01T01:41:00",  // ISO datetime
      "displayPromotionToDate": "2026-05-01T01:41:00",    // ISO datetime
      "hasPromotion": true,                          // Flag indicating sale status
      
      // ========== INVENTORY INFORMATION ==========
      "totalStock": 386,                    // Total quantity
      "quantityAvailable": 380,             // Available for sale (totalStock - reserved)
      "quantityReserved": 6,                // Already reserved/ordered
      "quantityOnHand": 386,                // Physical inventory
      
      // ========== STOCK STATUS ==========
      "stockStatus": "ENABLED",  // "ENABLED" or "DISABLED"
      
      // ========== ITEM TYPE ==========
      "type": "SIZE",  // "PRODUCT" or "SIZE"
      
      // ========== PRODUCT IMAGES ==========
      "mainImageUrl": "https://example.com/images/product-1626.jpg",
      "images": [
        {
          "id": "img-1",
          "imageUrl": "https://example.com/images/product-1626-1.jpg",
          "displayOrder": 1
        },
        {
          "id": "img-2",
          "imageUrl": "https://example.com/images/product-1626-2.jpg",
          "displayOrder": 2
        },
        {
          "id": "img-3",
          "imageUrl": "https://example.com/images/product-1626-3.jpg",
          "displayOrder": 3
        }
      ],
      
      // ========== ENGAGEMENT METRICS ==========
      "viewCount": 1250,        // Total number of product views
      "favoriteCount": 45,      // Total number of favorites
      
      // ========== METADATA ==========
      "createdAt": "2026-03-27T13:41:00",
      "updatedAt": "2026-03-18T13:41:00"
    }
  ]
}
```

---

## ✅ Field Mapping & Requirements

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | YES | Stock item unique ID |
| productId | string | YES | Product reference |
| productSizeId | string\|null | NO | Size reference (null if no size) |
| productName | string | YES | Display in header |
| description | string | YES | Show in modal |
| categoryId | string | YES | For linking/filtering |
| categoryName | string | YES | Display in preview |
| brandId | string | YES | For linking |
| brandName | string | YES | Display in preview |
| status | string | YES | "ACTIVE" \| "INACTIVE" |
| sku | string | YES | **CRITICAL: Never null** |
| barcode | string | YES | **CRITICAL: Never null** |
| sizeName | string\|null | NO | null for products without sizes |
| price | string | YES | Base price (string for precision) |
| displayPrice | number | YES | Final price after discount |
| displayPromotionType | string | NO | "PERCENTAGE" \| "FIXED_AMOUNT" |
| displayPromotionValue | number | NO | Discount amount/percentage |
| displayPromotionFromDate | string | NO | ISO datetime format |
| displayPromotionToDate | string | NO | ISO datetime format |
| hasPromotion | boolean | NO | Flag if item is on sale |
| totalStock | number | YES | Total inventory |
| quantityAvailable | number | YES | Available = totalStock - reserved |
| quantityReserved | number | YES | Already reserved/ordered |
| quantityOnHand | number | YES | Physical inventory count |
| stockStatus | string | YES | "ENABLED" \| "DISABLED" |
| type | string | YES | "PRODUCT" \| "SIZE" |
| mainImageUrl | string | YES | Main product image |
| images | array | YES | Image gallery (can be empty []) |
| images[].id | string | YES | Unique image ID |
| images[].imageUrl | string | YES | Image URL |
| images[].displayOrder | number | NO | Display order index |
| viewCount | number | YES | Total views |
| favoriteCount | number | YES | Total favorites |
| createdAt | string | YES | ISO datetime |
| updatedAt | string | YES | ISO datetime |

---

## 🔴 CRITICAL REQUIREMENTS

### 1. SKU and Barcode (MUST NOT BE NULL)
```typescript
// ✅ CORRECT
"sku": "SKU-1626",
"barcode": "BARCODE-1626"

// ❌ WRONG - Will display as "---" in table and modal
"sku": null,
"barcode": null

// ❌ WRONG - Empty strings not allowed
"sku": "",
"barcode": ""
```

### 2. Pricing Fields (Complete Set Required)
All pricing fields must be returned together for proper display:
```typescript
// ✅ CORRECT - Complete pricing info
{
  "price": "21.00",
  "displayPrice": 19.95,
  "hasPromotion": true,
  "displayPromotionType": "PERCENTAGE",
  "displayPromotionValue": 5,
  "displayPromotionFromDate": "2026-04-01T01:41:00",
  "displayPromotionToDate": "2026-05-01T01:41:00"
}

// ✅ ALSO CORRECT - No promotion
{
  "price": "21.00",
  "displayPrice": 21.00,
  "hasPromotion": false
}
```

### 3. Inventory Fields (Breakdown Required)
Must return complete inventory breakdown:
```typescript
// ✅ CORRECT
{
  "totalStock": 386,
  "quantityAvailable": 380,  // totalStock - reserved
  "quantityReserved": 6,
  "quantityOnHand": 386
}

// Note: quantityAvailable should always equal totalStock - quantityReserved
```

### 4. Image URLs (Must Be Valid)
```typescript
// ✅ CORRECT - Valid URL
"mainImageUrl": "https://cdn.example.com/images/product-1626.jpg"

// ❌ WRONG - Relative path
"mainImageUrl": "/images/product-1626.jpg"

// ✅ ALSO CORRECT - Empty if no image
"mainImageUrl": null  // or omit the field
```

---

## 📊 Implementation Checklist for Backend

### Database Query Requirements
- [ ] Join with Product table for: name, description, price, category, brand
- [ ] Join with ProductPromotion table for: promotion type, value, dates
- [ ] Include images collection from Product.images
- [ ] Calculate quantityAvailable = totalStock - quantityReserved
- [ ] Include engagement metrics (views, favorites)
- [ ] Handle both PRODUCT and SIZE type items

### Validation Rules
- [ ] SKU is never null (use empty string "" as fallback if needed)
- [ ] Barcode is never null (use empty string "" as fallback if needed)
- [ ] Price is always returned as string for decimal precision
- [ ] displayPrice is number (can be null if no pricing)
- [ ] All ISO datetime fields use 'T' separator (e.g., 2026-03-27T13:41:00)
- [ ] quantityAvailable = totalStock - quantityReserved
- [ ] Promotion dates are ISO format with timezone if available

### Testing Cases
- [ ] Test with product having sizes (type: SIZE)
- [ ] Test with product without sizes (type: PRODUCT)
- [ ] Test with active promotion
- [ ] Test without promotion
- [ ] Test with no images
- [ ] Test with multiple images
- [ ] Test pagination (pageNo, pageSize)
- [ ] Test with all filters applied
- [ ] Verify field names match exactly (case-sensitive)
- [ ] Verify no extra fields that break frontend

---

## 🎨 Frontend Modal Display Preview

When API returns all fields correctly, the modal will show:

### Header
```
┌─────────────────────────────────────────┐
│ [Main Image]  Product 1626              │
│               Category 6 • Brand 6      │
│               [ACTIVE] [ENABLED] [SIZE] │
└─────────────────────────────────────────┘
```

### Sections (in order)
1. **Product Description** - Full product description
2. **Product Identification** - Name, Category, Brand, SKU, Barcode, Size
3. **Stock Information** - Total Stock (color-coded), Status
4. **Pricing Information** 
   - Product Selling Price: $21.00
   - On Sale: [5% OFF]
   - Promotion Type: Percentage
   - Discount: 5%
   - Valid Period: 04/01/2026, 1:41:00 PM → 05/01/2026, 1:41:00 PM
   - Final Price: $19.95 (green)
5. **Availability & Inventory**
   - Total Stock: 386 Items
   - Available for Sale: 380 Items
   - Reserved: 6 Items
   - On Hand: 386 Items
6. **Engagement & Analytics**
   - Total Views: 1,250
   - Favorites: ♥ 45
7. **Product Images** - Gallery of all images
8. **Metadata** - Created/Updated dates

---

## 🔗 Related Files

- **Frontend Model**: `src/redux/features/business/store/models/response/stock-response.ts`
- **API Specification**: `STOCK_MANAGEMENT_API_SPEC.md`
- **Modal Component**: `src/redux/features/business/components/stock-item-detail-modal.tsx`
- **API Service**: `src/redux/features/business/store/thunks/stock-management-thunks.ts`

---

## ❌ Common Issues & Solutions

### Issue: SKU/Barcode showing as "---"
**Cause**: API returns null or empty string
**Solution**: Ensure API always returns valid SKU/Barcode values

### Issue: Pricing not showing
**Cause**: Missing price or promotion fields
**Solution**: Ensure all pricing fields are included in response

### Issue: Images not displaying
**Cause**: Invalid image URLs
**Solution**: Return absolute URLs (https://...) not relative paths

### Issue: Inventory mismatch
**Cause**: quantityAvailable ≠ (totalStock - quantityReserved)
**Solution**: Calculate correctly in backend query

### Issue: Dates showing incorrectly
**Cause**: Datetime format not ISO standard
**Solution**: Use ISO 8601 format: YYYY-MM-DDTHH:MM:SS

---

## 📝 Summary

The `/api/v1/product-stock/items/my-business` endpoint must return **complete product, pricing, inventory, and engagement data** in a single response.

This eliminates the need for multiple API calls and provides a rich sales preview experience without additional network requests.

**Total Fields**: 40+  
**Critical Fields**: SKU, Barcode, pricing data, inventory breakdown  
**Optional Fields**: Description, images, metrics (but recommended for complete preview)

---

## ✅ Status Checklist

- [x] Frontend modal enhanced to display all fields
- [x] Frontend type definitions updated
- [x] API specification documented
- [ ] **AWAITING BACKEND**: Update API response to include all fields
- [ ] Test with complete data set
- [ ] Deploy and verify

**Backend Team**: Please implement the fields listed above in the API response. The frontend is ready to display all this data!
