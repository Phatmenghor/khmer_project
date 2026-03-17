# Quantity Field Naming Conventions

This document standardizes quantity-related field names across the frontend codebase for easier maintenance and monitoring.

## Standard Quantity Variable Names

### Core Quantity Fields
- **`quantity`** - The actual quantity of an item in the cart
  - Used in: `CartItemModel`, Redux state
  - Example: `cartItem.quantity`, `item.quantity`
  - Source: Redux cart state (authoritative during session)

- **`totalQuantity`** - Sum of all item quantities in the cart
  - Used in: `CartState.totalItems`, component calculations
  - Example: `totalQuantity = cartItems.reduce(...)`
  - Calculated from all `quantity` fields

- **`displayQuantity`** - Quantity shown in the UI
  - Includes pending/unsaved edits
  - May differ from actual `quantity` during edits
  - Example: Shows pending edit before user clicks "Save"

- **`pendingQuantity`** - Unsaved edits in a modal/form
  - Stored in local state (Map) before API sync
  - Used in: Modal dialogs, detail pages
  - Not committed to cart until user saves

### API Response Fields (Backend & Frontend Aligned)
- **`quantity`** - From backend API responses (standardized)
  - Product API returns `product.quantity`
  - Size API returns `size.quantity`
  - Cart API returns `cartItem.quantity`
  - Consistent across all endpoints

## Variable Naming Pattern

### In Components/Functions
```typescript
// Get quantity for a size/product
const getQuantityForSize = (sizeId) => { ... }  // ✓ Standard
const getCartQuantityForSize = (sizeId) => { ... }  // ✗ Old

// Component variables
const quantity = cartItem?.quantity ?? apiQuantity;  // ✓ Current quantity
const totalQuantity = cartItems.reduce(...);  // ✓ Total in cart
const displayQuantity = pendingEdit ? pending : quantity;  // ✓ What to show
const currentQuantity = getQuantityForSize(sizeId);  // ✓ For comparisons
```

## API Mapping (Frontend & Backend Aligned)

| Backend Field | Frontend Model | Component Variable |
|---------------|----------------|--------------------|
| `quantity` | `quantity` | `quantity` |
| N/A | `totalItems` | `totalQuantity` |
| N/A | (pending state) | `displayQuantity` |

### Backend Standardization (Java DTOs)
- ✅ `CartItemResponse.quantity`
- ✅ `ProductDetailDto.quantity`
- ✅ `ProductListDto.quantity`
- ✅ `ProductSizeDto.quantity`

All backend endpoints now use `quantity` consistently.

## Utility Functions

Located in `src/utils/common/quantity-utils.ts`:

```typescript
// Get product quantity from API response
getProductQuantity(product)  // Returns number

// Get size quantity from API response (handles string parsing)
getSizeQuantity(size)  // Returns number

// Get display quantity with fallback
getDisplayQuantity(cartQty, apiQty)  // Returns number
```

## Migration Checklist

Components updated to use standard naming:
- ✅ `ProductCard` - uses `quantity`, `totalQuantity`, `displayQuantity`
- ✅ `SizeSelectionModal` - uses `getQuantityForSize`, `displayQuantity`
- ✅ `ProductDetailPage` - uses `getQuantityForSize`, `displayQuantity`

## Completion Status ✅

✅ **Backend Updated** - All DTOs use `quantity` consistently
- ProductDetailDto.quantity
- ProductListDto.quantity
- ProductSizeDto.quantity
- CartItemResponse.quantity

✅ **Frontend Updated** - All models and utilities reflect backend changes
- ProductDetailResponseModel.quantity
- ProductSize.quantity
- Utility functions simplified (no more mapping needed)

✅ **Documentation** - NAMING_CONVENTIONS.md maintains standards for future development
