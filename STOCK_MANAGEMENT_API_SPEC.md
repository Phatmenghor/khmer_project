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

### Response Structure
```typescript
{
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: [
    {
      id: string;                    // Stock item unique ID
      productId: string;             // Product unique ID
      productSizeId?: string;        // Size unique ID (null for products without sizes)
      productName: string;           // Product name
      categoryName: string;          // Product category
      brandName: string;             // Product brand
      sku: string;                   // Stock Keeping Unit (MUST BE RETURNED)
      barcode: string;               // Barcode (MUST BE RETURNED)
      sizeName?: string;             // Size name (null for non-sized products)
      totalStock: number;            // Total quantity available
      status: string;                // Product status: "ACTIVE" | "INACTIVE"
      stockStatus: string;           // Stock tracking status: "ENABLED" | "DISABLED"
      type: string;                  // Item type: "PRODUCT" | "SIZE"
      createdAt: string;             // ISO datetime format
      updatedAt: string;             // ISO datetime format
      // Additional fields needed for enhanced preview:
      mainImageUrl?: string;         // Product main image URL (for modal preview)
      description?: string;          // Product description
      categoryId?: string;           // Category ID (for linking)
      brandId?: string;              // Brand ID (for linking)
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
