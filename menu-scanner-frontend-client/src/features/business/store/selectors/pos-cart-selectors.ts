import { createSelector } from 'reselect';
import { RootState } from '@/store';


const selectPOSCartItems = (state: RootState) => state.posPage.cartItems;


export const selectPOSProductQuantity = createSelector(
  [
    (state: RootState) => state.posPage.cartItems,
    (_state: RootState, productId: string) => productId,
  ],
  (items, productId: string) => {

    if (!productId || typeof productId !== 'string') {
      return 0;
    }

    const normalizedId = productId.trim();
    if (!normalizedId) {
      return 0;
    }


    return items
      .filter((item) => {

        if (!item?.productId) return false;

        return item.productId.trim() === normalizedId;
      })
      .reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
);


export const selectPOSProductInCart = createSelector(
  [
    (state: RootState) => state.posPage.cartItems,
    (_state: RootState, productId: string) => productId,
  ],
  (items, productId: string) => {
    return items.some((item) => item.productId === productId);
  }
);


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


export const selectPOSCartTotals = createSelector(
  [(state: RootState) => state.posPage.cartItems],
  (items) => ({
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0),
  })
);
