import { createSelector } from 'reselect';
import { RootState } from '@/redux/store';
import { CartItemModel } from '../models/response/cart-response';

// Base selectors
const selectCartState = (state: RootState) => state.cart;
const selectCartItems = (state: RootState) => state.cart.items;

/**
 * MEMOIZED: Efficient lookup - returns quantity for a specific product+size combo.
 * Only recalculates when cartItems changes, preventing unnecessary re-renders
 * of ProductCard components.
 *
 * Factory selector pattern allows us to select per product without
 * needing to pass the entire product down.
 */
export const selectProductQuantityInCart = createSelector(
  [
    (state: RootState) => state.cart.items,
    (_state: RootState, productId: string) => productId,
    (_state: RootState, _productId: string, productSizeId: string | null) => productSizeId,
  ],
  (items: CartItemModel[], productId: string, productSizeId: string | null) => {
    const item = items.find(
      (i) => i.productId === productId && i.productSizeId === productSizeId
    );
    return item?.quantity || 0;
  }
);

/**
 * MEMOIZED: Returns all cart items for a specific product across all sizes.
 * Used to show total product quantity (sum of all size variants).
 */
export const selectProductCartItems = createSelector(
  [
    (state: RootState) => state.cart.items,
    (_state: RootState, productId: string) => productId,
  ],
  (items: CartItemModel[], productId: string) => {
    return items.filter((item) => item.productId === productId);
  }
);

/**
 * MEMOIZED: Total quantity for a product across all its sizes.
 * Example: Product X has size S (qty 2) + size M (qty 3) = total 5
 */
export const selectProductTotalQuantity = createSelector(
  [
    (state: RootState) => state.cart.items,
    (_state: RootState, productId: string) => productId,
  ],
  (items: CartItemModel[], productId: string) => {
    return items
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  }
);

/**
 * MEMOIZED: Efficient map of all product IDs to their total quantities.
 * Prevents individual product cards from recalculating when unrelated products change.
 */
export const selectAllProductQuantitiesMap = createSelector(
  [selectCartItems],
  (items: CartItemModel[]) => {
    const map = new Map<string, number>();
    items.forEach((item) => {
      const existing = map.get(item.productId) || 0;
      map.set(item.productId, existing + item.quantity);
    });
    return map;
  }
);

/**
 * MEMOIZED: Cart summary totals.
 * Only recalculates when cart state changes, not on other redux actions.
 */
export const selectCartTotals = createSelector(
  [selectCartState],
  (cartState) => ({
    totalItems: cartState.totalItems,
    subtotal: cartState.subtotal,
    totalDiscount: cartState.totalDiscount,
    finalTotal: cartState.finalTotal,
  })
);

/**
 * MEMOIZED: Cart loading state - never triggers re-renders due to item changes.
 */
export const selectCartLoadingState = createSelector(
  [selectCartState],
  (cartState) => ({
    isFetching: cartState.loading.fetch,
    isAdding: cartState.loading.add,
    isUpdating: cartState.loading.update,
    isClearing: cartState.loading.clear,
    isLoaded: cartState.loaded,
    error: cartState.error,
  })
);

/**
 * MEMOIZED: Full cart items list (for cart page display).
 * Consumers can use selectCartItems directly, but this provides
 * consistency with other memoized selectors.
 */
export const selectAllCartItems = createSelector(
  [selectCartItems],
  (items) => items
);

/**
 * MEMOIZED: Check if product is in cart.
 * More efficient than calling selectProductQuantityInCart and checking > 0
 */
export const selectIsProductInCart = createSelector(
  [
    (state: RootState) => state.cart.items,
    (_state: RootState, productId: string) => productId,
    (_state: RootState, _productId: string, productSizeId?: string | null) => productSizeId,
  ],
  (items: CartItemModel[], productId: string, productSizeId?: string | null) => {
    if (productSizeId === undefined || productSizeId === null) {
      // Check if ANY size of this product is in cart (for unsized products)
      return items.some((item) => item.productId === productId);
    }
    // Check specific size
    return items.some(
      (item) => item.productId === productId && item.productSizeId === productSizeId
    );
  }
);

/**
 * MEMOIZED: Composite selector for ProductCard - all data needed in one call.
 * Prevents component from subscribing to multiple selectors.
 */
export const selectProductCartData = createSelector(
  [
    (state: RootState) => state.cart.items,
    (_state: RootState, productId: string) => productId,
  ],
  (items: CartItemModel[], productId: string) => {
    const cartItem = items.find((i) => i.productId === productId && !i.productSizeId);
    const totalQuantity = items
      .filter((i) => i.productId === productId)
      .reduce((sum, i) => sum + i.quantity, 0);

    return {
      cartItem,
      quantity: cartItem?.quantity || 0,
      totalQuantity,
      isInCart: totalQuantity > 0,
    };
  }
);
