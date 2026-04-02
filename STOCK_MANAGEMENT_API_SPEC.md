# Stock Management API Specification

## Endpoint: `POST /api/v1/product-stock/items/my-business`

### Purpose
Fetch paginated list of product stock items with filtering, sorting, and search capabilities.

### Request Body
```typescript
{
  pageNo?: number;              // Default: 1
  pageSize?: number;            // Default: 15
  sortBy?: string;              // Options: "totalStock" | "productName" | "categoryName" | "brandName" | "sku" | "barcode" | "sizeName" | "status" | "stockStatus" | "createdAt" | "updatedAt"
  sortDirection?: string;       // Options: "ASC" | "DESC"
  search?: string;              // Search across product name, SKU, barcode
  status?: string;              // Filter: "ACTIVE" | "INACTIVE"
  stockStatus?: string;         // Filter: "ENABLED" | "DISABLED"
  lowStockThreshold?: number;   // Filter items with stock below this value
  hasSizes?: boolean;           // Filter: true (with sizes) | false (without sizes)
}
```

### Response Structure - Complete Sales Preview Fields
```typescript
{
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: [
    {
      // === BASIC IDENTIFICATION ===
      id: string;                              // Stock item unique ID
      productId: string;                       // Product unique ID
      productSizeId?: string;                  // Size unique ID (null for products without sizes)
      
      // === PRODUCT INFORMATION ===
      productName: string;                     // Product name
      description?: string;                    // Product description for preview
      categoryId?: string;                     // Category ID
      categoryName: string;                    // Product category
      brandId?: string;                        // Brand ID
      brandName: string;                       // Product brand
      status: string;                          // Product status: "ACTIVE" | "INACTIVE"
      
      // === IDENTIFICATION CODES ===
      sku: string;                             // Stock Keeping Unit (CRITICAL - NEVER NULL)
      barcode: string;                         // Barcode (CRITICAL - NEVER NULL)
      
      // === SIZE INFORMATION ===
      sizeName?: string;                       // Size name (null for non-sized products)
      
      // === PRICING & PROMOTIONS ===
      price: string;                           // Base selling price
      displayPrice?: number;                   // Final display price (after discount)
      displayPromotionType?: string;           // Promotion type: "PERCENTAGE" | "FIXED_AMOUNT"
      displayPromotionValue?: number;          // Discount percentage or amount
      displayPromotionFromDate?: string;       // Promotion start date (ISO datetime)
      displayPromotionToDate?: string;         // Promotion end date (ISO datetime)
      hasPromotion?: boolean;                  // Whether item is on sale
      
      // === INVENTORY INFORMATION ===
      totalStock: number;                      // Total quantity in stock
      quantityAvailable?: number;              // Available for sale (totalStock - reserved)
      quantityReserved?: number;               // Quantity already reserved/ordered
      quantityOnHand?: number;                 // Physical inventory
      
      // === STOCK STATUS ===
      stockStatus: string;                     // Stock tracking: "ENABLED" | "DISABLED"
      
      // === ITEM TYPE ===
      type: string;                            // Item type: "PRODUCT" | "SIZE"
      
      // === IMAGES ===
      mainImageUrl?: string;                   // Product main image URL (for modal header)
      images?: [                               // Optional: product image gallery
        {
          id: string;
          imageUrl: string;
          displayOrder?: number;
        }
      ];
      
      // === ENGAGEMENT METRICS ===
      viewCount?: number;                      // How many times viewed
      favoriteCount?: number;                  // How many times favorited
      
      // === METADATA ===
      createdAt: string;                       // ISO datetime format
      updatedAt: string;                       // ISO datetime format
    }
  ]
}
```

## Endpoint: `GET /api/v1/product-stock/items/my-business/all` (Optional)

### Purpose
Fetch ALL product stock items without pagination (useful for exports, reports, or bulk operations).

### Query Parameters
```typescript
{
  sortBy?: string;              // Same options as POST endpoint
  sortDirection?: string;       // "ASC" | "DESC"
  search?: string;              // Search across product name, SKU, barcode
  status?: string;              // "ACTIVE" | "INACTIVE"
  stockStatus?: string;         // "ENABLED" | "DISABLED"
  lowStockThreshold?: number;   // Filter items below threshold
  hasSizes?: boolean;           // true | false
}
```

### Response Structure
Same as POST endpoint but without pagination:
```typescript
{
  content: ProductStockItemDto[];  // Array of all matching items
  totalElements: number;            // Total count
}
```

## Required Field Implementation Checklist

- [x] sku - CRITICAL for stock management
- [x] barcode - CRITICAL for stock tracking
- [x] productName - For display
- [x] categoryName - For filtering/display
- [x] brandName - For filtering/display
- [x] sizeName - For variant management
- [x] totalStock - For inventory display
- [x] status - Product status
- [x] stockStatus - Stock tracking status
- [x] type - To distinguish PRODUCT vs SIZE items
- [ ] mainImageUrl - MISSING (needed for modal preview)
- [ ] description - OPTIONAL (for preview enhancement)
- [ ] categoryId - OPTIONAL (for navigation)
- [ ] brandId - OPTIONAL (for navigation)

## Frontend Requirements

The frontend `ProductStockItemDto` interface expects all above fields. The table columns reference:
- sku ✓ (should display, currently showing "---")
- barcode ✓ (should display, currently showing "---")
- sizeName ✓ (displays correctly)
- totalStock ✓ (displays correctly)
- status ✓ (displays correctly)
- stockStatus ✓ (displays correctly)
- type ✓ (displays correctly)

## Issue Investigation

**Current Problem**: SKU and Barcode showing as "---" in table
**Possible Causes**:
1. Backend not returning `sku` and `barcode` fields in response
2. Fields are null/empty in the response
3. Field names in response don't match interface (e.g., "productSku" instead of "sku")

**Action Required**: 
- Verify backend `/api/v1/product-stock/items/my-business` returns sku and barcode
- Check response field names match the interface exactly
- Ensure fields are not null (return empty string if no value)

## Modal Enhancement Requirements

For the StockItemDetailModal to display complete information, we need:
- mainImageUrl (from product) - CURRENTLY FETCHED SEPARATELY via product detail API
- sku ✓ (from stock item response)
- barcode ✓ (from stock item response)
- All other fields already available

## Recommendation

Backend `/api/v1/product-stock/items/my-business` should return:
1. All current fields (verified working)
2. Add `mainImageUrl` field from product
3. Ensure `sku` and `barcode` are never null (return empty string as fallback)

This will provide complete data for both table display and modal preview without requiring additional API calls.
