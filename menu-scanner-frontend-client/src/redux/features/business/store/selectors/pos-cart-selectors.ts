import { createSelector } from 'reselect';
import { RootState } from '@/redux/store';

// Base selectors
const selectPOSCartItems = (state: RootState) => state.posPage.cartItems;

/**
 * MEMOIZED: Get total quantity for a specific product in POS cart.
 * Only recalculates when cartItems changes, preventing unnecessary re-renders
 * of product cards during pagination or other updates.
 *
 * Factory selector pattern allows efficient per-product lookups.
 * Includes defensive checks for whitespace and undefined IDs.
 */
export const selectPOSProductQuantity = createSelector(
  [
    (state: RootState) => state.posPage.cartItems,
    (_state: RootState, productId: string) => productId,
  ],
  (items, productId: string) => {
    // Defensive: ensure productId is valid
    if (!productId || typeof productId !== 'string') {
      return 0;
    }

    const normalizedId = productId.trim();
    if (!normalizedId) {
      return 0;
    }

    // Find all cart items matching this product and sum quantities
    return items
      .filter((item) => {
        // Defensive: ensure item has productId
        if (!item?.productId) return false;
        // Normalize both IDs for comparison (trim whitespace)
        return item.productId.trim() === normalizedId;
      })
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
);

/**
 * MEMOIZED: Check if product is in POS cart.
 */
export const selectPOSProductInCart = createSelector(
  [
    (state: RootState) => state.posPage.cartItems,
    (_state: RootState, productId: string) => productId,
  ],
  (items, productId: string) => {
    return items.some((item) => item.productId === productId);
  }
);

/**
 * MEMOIZED: Efficient map of all product IDs to their quantities.
 * Prevents individual cards from recalculating when unrelated products change.
 */
export const selectAllPOSProductQuantities = createSelector(
  [selectPOSCartItems],
  (items) => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const existing = map.get(item.productId) || 0;
      map.set(item.productId, existing + item.quantity);
    });
    return map;
  }
);

/**
 * MEMOIZED: Cart totals for POS page.
 */
export const selectPOSCartTotals = createSelector(
  [(state: RootState) => state.posPage.cartItems],
  (items) => ({
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0),
  })
);
