import { createSelector } from 'reselect';
import { RootState } from '@/store';
import { CartItemModel } from '../models/response/cart-response';


const selectCartState = (state: RootState) => state.cart;
const selectCartItems = (state: RootState) => state.cart.items;


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


export const selectProductCartItems = createSelector(
  [
    (state: RootState) => state.cart.items,
    (_state: RootState, productId: string) => productId,
  ],
  (items: CartItemModel[], productId: string) => {
    return items.filter((item) => item.productId === productId);
  }
);


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


export const selectCartTotals = createSelector(
  [selectCartState],
  (cartState) => ({
    totalItems: cartState.totalItems,
    subtotal: cartState.subtotal,
    discountAmount: cartState.discountAmount,
    finalTotal: cartState.finalTotal,
  })
);


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


export const selectAllCartItems = createSelector(
  [selectCartItems],
  (items) => items
);


export const selectIsProductInCart = createSelector(
  [
    (state: RootState) => state.cart.items,
    (_state: RootState, productId: string) => productId,
    (_state: RootState, _productId: string, productSizeId?: string | null) => productSizeId,
  ],
  (items: CartItemModel[], productId: string, productSizeId?: string | null) => {
    if (productSizeId === undefined || productSizeId === null) {

      return items.some((item) => item.productId === productId);
    }

    return items.some(
      (item) => item.productId === productId && item.productSizeId === productSizeId
    );
  }
);


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
