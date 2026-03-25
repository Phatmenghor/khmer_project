# POS State Persistence Guide

## Overview

This persistence system automatically saves and restores user state across browser sessions:
- **Filters** (search, category, brand, promotion) → Saved to **URL parameters**
- **Cart items** (products, quantities, prices) → Saved to **localStorage**

## Architecture

### Components

1. **`use-url-params.ts`** - URL query parameter management
   - Type-safe param getter/setter
   - Automatic encoding/decoding
   - Works with Next.js routing

2. **`use-local-storage.ts`** - localStorage management
   - JSON serialization/deserialization
   - Cross-tab synchronization
   - Expiry support
   - Batch operations

3. **`use-pos-persistence.ts`** - Core persistence logic
   - Combines URL params + localStorage
   - Filter ↔ URL sync
   - Cart ↔ localStorage sync
   - State validation

4. **`use-pos-state-persistence.ts`** - Redux integration hook
   - Automatic Redux dispatch on load
   - Debounced saves (reduces network calls)
   - Event callbacks
   - Clean API

## Usage in POS Page

### Basic Setup

```typescript
import { usePOSStatePersistence } from "@/utils/persistence/use-pos-state-persistence";

export default function PosPage() {
  // Initialize persistence with Redux
  usePOSStatePersistence({
    enableUrlPersistence: true,      // Save filters to URL
    enableCartPersistence: true,     // Save cart to localStorage
    cartSaveDebounceMs: 1000,        // Wait 1s before saving cart
    filterSaveDebounceMs: 800,       // Wait 800ms before saving filters
    onStateLoaded: (state) => {
      console.log("Loaded:", state);
    },
  });

  // Rest of component...
}
```

### Advanced Usage

```typescript
const persistence = usePOSStatePersistence();

// Check if state was persisted
if (persistence.hasPersistedState) {
  console.log("User has persisted state");
}

// Manual actions
persistence.clearCart();        // Clear cart only
persistence.clearFilters();     // Clear filters only
persistence.clearAllPersistence(); // Clear both
persistence.resetToDefault();   // Reset to clean state
persistence.exportState();      // Get current state snapshot
```

## Data Flow

### On Page Load

```
URL Params                localStorage
     ↓                         ↓
[Load Filters]           [Load Cart Items]
     ↓                         ↓
    Redux Store ←─────────────┘
     ↓
  React Render
```

### On User Action

```
User Action (search, add to cart, etc)
     ↓
Redux State Updates
     ↓
useEffect detects change
     ↓
Debounce Timer
     ↓
[Save to URL] + [Save to localStorage]
```

### On Browser Navigation

```
User clicks back/forward button
     ↓
URL params change
     ↓
useUrlParams hook detects change
     ↓
Redux updates via loadPersistedFilters
     ↓
Products refetch with new filters
```

## Persistence Storage

### URL Parameters

**Format**: `?search=coffee&categoryId=1&brandId=2&hasPromotion=true`

**Pros**:
- ✅ Shareable links
- ✅ Browser back/forward works
- ✅ Survives page refresh
- ✅ SEO friendly

**Cons**:
- URL gets long with many filters

### localStorage

**Key**: `pos:cart`

**Data**:
```json
{
  "items": [...cart items...],
  "lastUpdated": 1234567890,
  "version": 1
}
```

**Pros**:
- ✅ Fast (no network)
- ✅ Large storage (5-10MB)
- ✅ Per-browser persistence
- ✅ Cross-tab sync option

**Cons**:
- Not shareable
- Per-browser only

## Scaling Considerations

### Performance

1. **Debouncing**
   - Filters: 800ms debounce (user stops typing)
   - Cart: 1000ms debounce (user stops adding items)
   - Prevents excessive localStorage writes

2. **Lazy Loading**
   - URL params loaded on mount only
   - localStorage loaded on mount only
   - Redux updates trigger subsequent API calls

3. **Storage Limits**
   - localStorage: ~5-10MB per origin
   - Cart size: Usually < 100KB even with 50+ items
   - Safe for small-medium carts

### Future Enhancements

1. **IndexedDB** - For larger cart data
   ```typescript
   useLocalStorageWithExpiry('pos:large-cart', items, 24 * 60);
   ```

2. **Server-side Session** - Save cart to backend
   ```typescript
   const saveCartToServer = async () => {
     await cartAPI.save(cartItems);
   };
   ```

3. **Cloud Sync** - Sync across devices
   ```typescript
   const syncCartAcrossDevices = async () => {
     await cloudAPI.syncCart(cartItems, userId);
   };
   ```

## Redux Integration

### Actions Added

```typescript
// Load filters from persistence
dispatch(loadPersistedFilters({
  search: "coffee",
  hasPromotion: true,
  categoryId: null,
  brandId: null,
}));

// Load cart from persistence
dispatch(loadPersistedCart([
  { id: "1", productName: "Coffee", quantity: 2, ...},
  { id: "2", productName: "Tea", quantity: 1, ...},
]));
```

### Selectors Used

```typescript
selectSearchTerm           // Get current search
selectPromotionFilter      // Get promotion filter
selectCartItems            // Get cart items
```

## Validation & Safety

### Cart Validation

```typescript
validatePOSCartItems(items)  // Check structure
sanitizePOSFilters(filters)  // Remove invalid values
```

### Error Handling

- localStorage errors logged to console
- Invalid data silently ignored
- Falls back to initial state on error
- No breaking of user experience

## Testing

### Manual Testing

```typescript
// In browser console

// 1. Check persisted filters
localStorage.getItem('pos:cart')

// 2. Clear persistence
localStorage.removeItem('pos:cart')

// 3. Check URL params
new URL(window.location.href).searchParams

// 4. Export state
persistence.exportState()
```

### Debugging

```typescript
// Enable debug logging
usePOSStatePersistence({
  onStateLoaded: (state) => {
    console.log('DEBUG: Loaded state', state);
  },
});

// Export state for inspection
const state = persistence.exportState();
console.table(state);
```

## Common Issues

### Issue: Cart not persisting

**Cause**: `enableCartPersistence: false`

**Solution**:
```typescript
usePOSStatePersistence({
  enableCartPersistence: true, // Enable
});
```

### Issue: Filters not in URL

**Cause**: `enableUrlPersistence: false`

**Solution**:
```typescript
usePOSStatePersistence({
  enableUrlPersistence: true, // Enable
});
```

### Issue: localStorage quota exceeded

**Cause**: Too much data in cart

**Solution**:
1. Clear old carts: `localStorage.clear()`
2. Migrate to IndexedDB for large data
3. Save cart to server backend

## Clean Up & Best Practices

1. **Always initialize** in main component:
   ```typescript
   usePOSStatePersistence(); // Call once at root
   ```

2. **Don't call multiple times**:
   ```typescript
   // ❌ Bad - called in child components
   // ✅ Good - called once in main POS page
   ```

3. **Clear on logout**:
   ```typescript
   const handleLogout = () => {
     persistence.clearAllPersistence();
     // logout logic...
   };
   ```

4. **Test across devices**:
   - Desktop browser
   - Mobile browser
   - Multiple tabs
   - Incognito mode
