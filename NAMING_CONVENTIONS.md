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

### API Response Fields
- **`quantityInCart`** - From backend API responses
  - Product API returns `product.quantityInCart`
  - Size API returns `size.quantityInCart`
  - Maps to internal `quantity` field
  - Used as fallback when Redux cart not yet loaded

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

## API Mapping

| Backend Field | Frontend Model | Component Variable |
|---------------|----------------|--------------------|
| `quantityInCart` | `quantity` | `quantity` |
| N/A | `totalItems` | `totalQuantity` |
| N/A | (pending state) | `displayQuantity` |

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

## Future Improvements

If backend is updated, consider:
1. Rename `quantityInCart` to `quantity` at API boundary
2. Use this unified naming from API down to components
3. Remove need for mapping utilities
