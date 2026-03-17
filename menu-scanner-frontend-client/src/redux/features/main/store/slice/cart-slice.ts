import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  clearCart,
} from "../thunks/cart-thunks";
import {
  CartResponseModel,
  CartItemModel,
} from "../models/response/cart-response";

interface CartState {
  items: CartItemModel[];
  totalItems: number;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  loading: {
    fetch: boolean;
    add: boolean;
    update: boolean;
    clear: boolean;
  };
  error: string | null;
  loaded: boolean;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  totalDiscount: 0,
  finalTotal: 0,
  loading: {
    fetch: false,
    add: false,
    update: false,
    clear: false,
  },
  error: null,
  loaded: false,
};

// Helper to update cart state from response with conflict resolution
const updateCartFromResponse = (
  state: CartState,
  response: CartResponseModel,
  optimisticTimestamp?: number
) => {
  // If we have an optimistic timestamp from the request, we can check for conflicts
  // If undefined (e.g. fetchCart), we treat it as 0 (older than any active optimistic update) or check differently
  const checkTimestamp = optimisticTimestamp || 0;

  // Create a map of existing items for preserving optimistic state
  const currentItemsMap = new Map(state.items.map((i) => [i.id, i]));
  // Also map by product+size for matching incoming items
  const currentItemsByKey = new Map(
    state.items.map((i) => [`${i.productId}_${i.productSizeId}`, i])
  );

  const newItems = response.items || [];
  const processedItems: CartItemModel[] = [];

  for (const newItem of newItems) {
    const key = `${newItem.productId}_${newItem.productSizeId}`;
    const localItem = currentItemsByKey.get(key);

    if (localItem && (localItem.lastOptimisticTimestamp || 0) > checkTimestamp) {
      // Local item is newer than this response/request.
      // Keep local quantity, but update pricing/metadata from server if desired.
      // For safety, let's keep the entire local item to avoid inconsistencies,
      // OR just preserve the quantity and recalculate totals.
      // Let's preserve the local item entirely to be safe, but maybe update price?
      // If we update price but keep quantity, we need to recalc totalPrice.

      // We'll trust the LOCAL state for this item entirely since it's newer.
      processedItems.push(localItem);
    } else {
      // Server is newer or equal, or no local conflict. Accept server item.
      processedItems.push(newItem);
    }
  }

  // Handle items that might be in local state but not in server response?
  // If server returns full cart, missing items means they were removed?
  // But if we optimistically added an item (T_new) and server (T_old) doesn't have it yet?
  // Then we should KEEP the local item if its timestamp is newer.

  // Find local items that are NOT in the newItems list
  const newItemKeys = new Set(
    newItems.map((i) => `${i.productId}_${i.productSizeId}`)
  );

  state.items.forEach(localItem => {
    const key = `${localItem.productId}_${localItem.productSizeId}`;
    if (!newItemKeys.has(key)) {
      // Item exists locally but not in response.
      // If local, is it a temp item? or a real item that was removed?
      // If it has a newer timestamp than the request, it might be a new add that hasn't synced yet.
      if ((localItem.lastOptimisticTimestamp || 0) > checkTimestamp) {
        processedItems.push(localItem);
      }
    }
  });

  state.items = processedItems;

  // We need to recalculate totals because we mixed local and server items
  recalculateTotals(state);

  // Update other global fields if we didn't override everything?
  // If we respected ANY local override, we must rely on recalculateTotals
  // If we purely took server response, we could typically trust server totals.
  // But recalculateTotals is safer mixed.
};

// Helper to recalculate local totals from items
const recalculateTotals = (state: CartState) => {
  state.totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  state.subtotal = state.items.reduce(
    (sum, i) => sum + i.currentPrice * i.quantity,
    0
  );
  state.finalTotal = state.items.reduce((sum, i) => sum + i.totalPrice, 0);
  state.totalDiscount = state.subtotal - state.finalTotal;
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
      state.totalDiscount = 0;
      state.finalTotal = 0;
      state.loaded = false;
      state.error = null;
    },
    // Optimistic add for instant UI feedback
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
        hasPromotion?: boolean;
        promotionType?: string | null;
        promotionValue?: number | null;
        promotionFromDate?: string | null;
        promotionToDate?: string | null;
        optimisticTimestamp?: number;
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
        optimisticTimestamp
      } = action.payload;

      // Check if item already exists
      const existingItem = state.items.find(
        (i) =>
          i.productId === productId &&
          i.productSizeId === (productSizeId || null)
      );

      if (existingItem) {
        // Update existing item quantity
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.finalPrice * existingItem.quantity;
        if (optimisticTimestamp) {
          existingItem.lastOptimisticTimestamp = optimisticTimestamp;
        }
      } else {
        // Add new item with temporary ID
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
          promotionEndDate: promotionToDate || null,
          totalBeforeDiscount,
          discountAmount,
          lastOptimisticTimestamp: optimisticTimestamp
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
      }>
    ) => {
      const item = state.items.find(
        (i) =>
          i.productId === action.payload.productId &&
          i.productSizeId === action.payload.productSizeId
      );
      if (item) {
        if (action.payload.quantity <= 0) {
          // Remove item
          state.items = state.items.filter((i) => i.id !== item.id);
        } else {
          item.quantity = action.payload.quantity;
          item.totalPrice = item.finalPrice * action.payload.quantity;
          if (action.payload.optimisticTimestamp) {
            item.lastOptimisticTimestamp = action.payload.optimisticTimestamp;
          }
        }
        recalculateTotals(state);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(
        fetchCart.fulfilled,
        (state, action: PayloadAction<CartResponseModel>) => {
          state.loading.fetch = false;
          updateCartFromResponse(state, action.payload);
          state.loaded = true;
          state.error = null;
        }
      )
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading.fetch = false;
        if (action.error.message === "canceled" || action.payload === "canceled") return;
        state.error = action.error.message || "Failed to fetch cart";
      })

      // Add to Cart
      .addCase(addToCart.pending, (state) => {
        state.loading.add = true;
        state.error = null;
      })
      .addCase(
        addToCart.fulfilled,
        (state, action) => {
          state.loading.add = false;
          updateCartFromResponse(state, action.payload, action.meta.arg.optimisticTimestamp);
          state.loaded = true;
          state.error = null;
        }
      )
      .addCase(addToCart.rejected, (state, action) => {
        state.loading.add = false;
        // Silently ignore aborted requests (superseded by newer debounced call)
        const payload = action.payload as any;
        if (payload?.aborted || payload === "canceled" || action.error.message === "canceled") return;
        state.error = action.error.message || "Failed to add item to cart";
      })

      // Update Cart Item
      .addCase(updateCartItem.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(
        updateCartItem.fulfilled,
        (state, action) => {
          state.loading.update = false;
          updateCartFromResponse(state, action.payload, action.meta.arg.optimisticTimestamp);
          state.error = null;
        }
      )
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading.update = false;
        // Silently ignore aborted requests (superseded by newer debounced call)
        const payload = action.payload as any;
        if (payload?.aborted || payload === "canceled" || action.error.message === "canceled") return;
        state.error = action.error.message || "Failed to update cart item";
      })

      // Clear Cart
      .addCase(clearCart.pending, (state) => {
        state.loading.clear = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading.clear = false;
        state.items = [];
        state.totalItems = 0;
        state.subtotal = 0;
        state.totalDiscount = 0;
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
