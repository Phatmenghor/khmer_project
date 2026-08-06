import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addToCart,
  updateCartItem,
  clearCart,
  fetchCart,
} from "../thunks/cart-thunks";
import {
  CartResponseModel,
  CartItemModel,
  CartItemCustomization,
} from "../models/response/cart-response";

interface CartState {
  items: CartItemModel[];
  totalItems: number;
  totalQuantity: number;
  subtotal: number;
  discountAmount: number;
  finalTotal: number;
  loading: {
    fetch: boolean;
    add: boolean;
    update: boolean;
    clear: boolean;
  };
  error: string | null;
  loaded: boolean;
  needsRefetch: boolean;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalQuantity: 0,
  subtotal: 0,
  discountAmount: 0,
  finalTotal: 0,
  loading: {
    fetch: false,
    add: false,
    update: false,
    clear: false,
  },
  error: null,
  loaded: false,
  needsRefetch: false,
};


const updateCartFromResponse = (
  state: CartState,
  response: CartResponseModel,
  optimisticTimestamp?: number
) => {
  const checkTimestamp = optimisticTimestamp || 0;

  const currentItemsByKey = new Map(
    state.items.map((i) => [`${i.productId}_${i.productSizeId}`, i])
  );

  const newItems = response.items || [];
  const processedItems: CartItemModel[] = [];
  const processedKeys = new Set<string>();

  for (const newItem of newItems) {
    const key = `${newItem.productId}_${newItem.productSizeId}`;
    processedKeys.add(key);
    const localItem = currentItemsByKey.get(key);

    if (localItem && (localItem.lastOptimisticTimestamp || 0) > checkTimestamp) {
      processedItems.push({
        ...newItem,
        quantity: localItem.quantity,
        totalPrice: newItem.finalPrice * localItem.quantity,
        lastOptimisticTimestamp: localItem.lastOptimisticTimestamp,
      });
    } else {
      processedItems.push(newItem);
    }
  }

  state.items.forEach((localItem) => {
    const key = `${localItem.productId}_${localItem.productSizeId}`;
    if (!processedKeys.has(key)) {
      if ((localItem.lastOptimisticTimestamp || 0) > checkTimestamp) {
        processedItems.push(localItem);
      }
    }
  });

  state.items = processedItems;
  recalculateTotals(state);
};

// Used for add/update mutations: keeps local quantities (never overwrites with API qty),
// only syncs the server-assigned id and server-calculated prices.
const syncMetaFromResponse = (
  state: CartState,
  response: CartResponseModel,
) => {
  const apiItemsByKey = new Map(
    (response.items || []).map((i) => [`${i.productId}_${i.productSizeId}`, i])
  );

  state.items = state.items.map((localItem) => {
    const key = `${localItem.productId}_${localItem.productSizeId}`;
    const apiItem = apiItemsByKey.get(key);
    if (!apiItem) return localItem;

    return {
      ...localItem,
      // Replace temp_xxx id with real server id
      id: localItem.id.startsWith('temp_') ? apiItem.id : localItem.id,
      // Sync server-calculated price fields (promotions, discounts)
      finalPrice: apiItem.finalPrice,
      currentPrice: apiItem.currentPrice,
      hasPromotion: apiItem.hasPromotion,
      promotionType: apiItem.promotionType,
      promotionValue: apiItem.promotionValue,
      // Recalculate totalPrice using LOCAL quantity × server finalPrice
      totalPrice: apiItem.finalPrice * localItem.quantity,
    };
  });

  recalculateTotals(state);
};


const recalculateTotals = (state: CartState) => {

  state.totalItems = state.items.length;


  state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);


  const subtotalBeforeDiscount = state.items.reduce(
    (sum, i) => sum + (i.currentPrice * i.quantity),
    0
  );


  state.finalTotal = state.items.reduce((sum, i) => sum + i.totalPrice, 0);


  state.subtotal = state.finalTotal;


  state.discountAmount = subtotalBeforeDiscount - state.finalTotal;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalQuantity = 0;
      state.subtotal = 0;
      state.discountAmount = 0;
      state.finalTotal = 0;
      state.loaded = false;
      state.error = null;
    },

    addLocalCartItem: (
      state,
      action: PayloadAction<{
        productId: string;
        productSizeId?: string | null;
        quantity: number;
        productName: string;
        productImageUrl: string;
        sizeName?: string | null;
        finalPrice: number;
        currentPrice: number;
        hasPromotion?: boolean | string;
        promotionType?: string | null;
        promotionValue?: number | null;
        promotionFromDate?: string | null;
        promotionToDate?: string | null;
        optimisticTimestamp?: number;
        customizations?: CartItemCustomization[];
      }>
    ) => {
      const {
        productId,
        productSizeId,
        quantity,
        productName,
        productImageUrl,
        sizeName,
        finalPrice,
        currentPrice,
        hasPromotion,
        promotionType,
        promotionValue,
        promotionFromDate,
        promotionToDate,
        optimisticTimestamp,
        customizations,
      } = action.payload;

      // Match by productId + productSizeId + exact customization set
      const incomingCustomIds = (customizations || []).map((c) => c.productCustomizationId).sort();
      const existingItem = state.items.find((i) => {
        if (i.productId !== productId || i.productSizeId !== (productSizeId || null)) return false;
        const itemCustomIds = (i.customizations || []).map((c) => c.productCustomizationId).sort();
        if (itemCustomIds.length !== incomingCustomIds.length) return false;
        return incomingCustomIds.every((id, idx) => id === itemCustomIds[idx]);
      });

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.finalPrice * existingItem.quantity;
        if (optimisticTimestamp) {
          existingItem.lastOptimisticTimestamp = optimisticTimestamp;
        }
      } else {
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const totalBeforeDiscount = currentPrice * quantity;
        const discountAmount = totalBeforeDiscount - (finalPrice * quantity);

        state.items.push({
          id: tempId,
          productId,
          productName,
          productImageUrl,
          productSizeId: productSizeId || null,
          sizeName: sizeName || null,
          quantity,
          currentPrice,
          finalPrice,
          totalPrice: finalPrice * quantity,
          hasPromotion: hasPromotion || false,
          isAvailable: true,
          promotionType: promotionType || null,
          promotionValue: promotionValue || null,
          promotionFromDate: promotionFromDate || null,
          promotionToDate: promotionToDate || null,
          totalBeforeDiscount,
          discountAmount,
          lastOptimisticTimestamp: optimisticTimestamp || Date.now(),
          customizations: customizations || [],
        });
      }

      recalculateTotals(state);
    },
    updateLocalCartItem: (
      state,
      action: PayloadAction<{
        productId: string;
        productSizeId?: string | null;
        quantity: number;
        optimisticTimestamp?: number;
        customizationIds?: string[];
      }>
    ) => {
      const { productId, productSizeId, quantity, optimisticTimestamp, customizationIds } = action.payload;

      // Match by productId + productSizeId + customizations (if provided)
      const sortedCustomIds = (customizationIds || []).sort();
      const item = state.items.find((i) => {
        if (i.productId !== productId || i.productSizeId !== (productSizeId || null)) return false;
        if (sortedCustomIds.length > 0) {
          const itemCustomIds = (i.customizations || []).map((c) => c.productCustomizationId).sort();
          if (itemCustomIds.length !== sortedCustomIds.length) return false;
          return sortedCustomIds.every((id, idx) => id === itemCustomIds[idx]);
        }
        return true;
      });

      if (item) {
        if (quantity <= 0) {

          state.items = state.items.filter((i) => i.id !== item.id);
        } else {

          item.quantity = quantity;
          item.totalPrice = item.finalPrice * quantity;
          if (optimisticTimestamp) {
            item.lastOptimisticTimestamp = optimisticTimestamp;
          }
        }

        recalculateTotals(state);
      }

    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(addToCart.pending, (state) => {
        state.loading.add = true;
        state.error = null;
      })
      .addCase(
        addToCart.fulfilled,
        (state, action) => {
          state.loading.add = false;
          // Keep local quantities — only sync server id + prices
          syncMetaFromResponse(state, action.payload);
          state.loaded = true;
          state.error = null;
        }
      )
      .addCase(addToCart.rejected, (state, action) => {
        state.loading.add = false;
        const payload = action.payload as any;
        if (payload?.aborted || payload === "canceled" || action.error.message === "canceled") return;
        state.needsRefetch = true;
        state.error = action.error.message || "Failed to add item to cart";
      })


      .addCase(updateCartItem.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(
        updateCartItem.fulfilled,
        (state, action) => {
          state.loading.update = false;
          // Keep local quantities — only sync server id + prices
          syncMetaFromResponse(state, action.payload);
          state.error = null;
        }
      )
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading.update = false;
        const payload = action.payload as any;
        if (payload?.aborted || payload === "canceled" || action.error.message === "canceled") return;
        state.needsRefetch = true;
        state.error = action.error.message || "Failed to update cart item";
      })


      .addCase(fetchCart.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(
        fetchCart.fulfilled,
        (state, action: PayloadAction<CartResponseModel>) => {
          state.loading.fetch = false;

          state.items = action.payload.items || [];
          recalculateTotals(state);
          state.loaded = true;
          state.needsRefetch = false;
          state.error = null;
        }
      )
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.error.message || "Failed to fetch cart";
      })


      .addCase(clearCart.pending, (state) => {
        state.loading.clear = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading.clear = false;
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
        state.discountAmount = 0;
        state.finalTotal = 0;
        state.error = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading.clear = false;
        if (action.error.message === "canceled" || action.payload === "canceled") return;
        state.error = action.error.message || "Failed to clear cart";
      });
  },
});

export const { resetCart, addLocalCartItem, updateLocalCartItem } = cartSlice.actions;
export default cartSlice.reducer;
