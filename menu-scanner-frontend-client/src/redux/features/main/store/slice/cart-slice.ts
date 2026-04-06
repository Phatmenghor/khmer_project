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
} from "../models/response/cart-response";

interface CartState {
  items: CartItemModel[];
  totalItems: number;              // Number of unique products
  totalQuantity: number;            // Total quantity across all items
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
  totalQuantity: 0,
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
  // If undefined, we treat it as 0 (older than any active optimistic update)
  const checkTimestamp = optimisticTimestamp || 0;

  // Create a map of existing items by product+size key for merging
  const currentItemsByKey = new Map(
    state.items.map((i) => [`${i.productId}_${i.productSizeId}`, i])
  );

  const newItems = response.items || [];
  const processedItems: CartItemModel[] = [];
  const processedKeys = new Set<string>();

  // Process all items from server response
  // Items that are IN the server response are authoritative and should always be kept
  for (const newItem of newItems) {
    const key = `${newItem.productId}_${newItem.productSizeId}`;
    processedKeys.add(key);
    const localItem = currentItemsByKey.get(key);

    // If we have a local optimistic item, preserve its quantity if it's newer
    // But ALWAYS keep the item from server response
    if (localItem && (localItem.lastOptimisticTimestamp || 0) > checkTimestamp) {
      // Local item is strictly newer - keep local quantity but merge server metadata
      processedItems.push({
        ...newItem, // Get the real ID and server data
        quantity: localItem.quantity, // But keep the local quantity
        totalPrice: newItem.finalPrice * localItem.quantity,
        lastOptimisticTimestamp: localItem.lastOptimisticTimestamp,
      });
    } else {
      // Server item is newer or equal - use it as-is (but it's in the response, so always keep)
      processedItems.push(newItem);
    }
  }

  // Handle local items that are NOT in the server response
  // This handles the case where we optimistically added an item before the API call
  // IMPORTANT: Only discard items that are missing from the response AND have old timestamps
  state.items.forEach((localItem) => {
    const key = `${localItem.productId}_${localItem.productSizeId}`;
    if (!processedKeys.has(key)) {
      // Item exists locally but not in response
      // Only keep it if it's a fresh optimistic add (strictly newer timestamp)
      // This ensures we don't discard items from previous requests
      if ((localItem.lastOptimisticTimestamp || 0) > checkTimestamp) {
        processedItems.push(localItem);
      }
      // Otherwise, trust the server and discard (it explicitly doesn't have this item)
    }
  });

  state.items = processedItems;

  // Recalculate totals from the merged items
  recalculateTotals(state);
};

// Helper to recalculate local totals from items
const recalculateTotals = (state: CartState) => {
  // totalItems = number of unique products
  state.totalItems = state.items.length;

  // totalQuantity = sum of all quantities
  state.totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);

  // Calculate subtotal before discount (at original prices)
  const subtotalBeforeDiscount = state.items.reduce(
    (sum, i) => sum + (i.currentPrice * i.quantity),
    0
  );

  // Calculate final total (at discounted prices)
  state.finalTotal = state.items.reduce((sum, i) => sum + i.totalPrice, 0);

  // Subtotal is the same as finalTotal (no shipping/fees at this stage)
  state.subtotal = state.finalTotal;

  // Discount is the difference between original price and final price
  state.totalDiscount = subtotalBeforeDiscount - state.finalTotal;
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
          lastOptimisticTimestamp: optimisticTimestamp || Date.now()
        });
      }

      recalculateTotals(state);

      // Reset pagination to page 1 when adding new item from product card
      // This ensures newly added items are visible immediately
      state.pagination = {
        currentPage: 1,
        pageSize: state.pagination.pageSize,
        hasMore: state.items.length > state.pagination.pageSize,
      };
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
      const { productId, productSizeId, quantity, optimisticTimestamp } = action.payload;

      // Find existing item - should always exist because caller ensures it
      const item = state.items.find(
        (i) => i.productId === productId && i.productSizeId === (productSizeId || null)
      );

      if (item) {
        if (quantity <= 0) {
          // Remove item from cart
          state.items = state.items.filter((i) => i.id !== item.id);
        } else {
          // Update quantity and recalculate derived fields
          item.quantity = quantity;
          item.totalPrice = item.finalPrice * quantity;
          if (optimisticTimestamp) {
            item.lastOptimisticTimestamp = optimisticTimestamp;
          }
        }
        // Always recalculate cart totals
        recalculateTotals(state);
      }
      // If item not found, this is a bug - silently ignore to avoid crashes
    },
  },
  extraReducers: (builder) => {
    builder
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

          // DEBUG: Log final cart state after API response
          console.log("%c## CART STATE AFTER API RESPONSE", "background:#28a745;color:white;padding:5px;border-radius:3px;font-weight:bold", {
            itemsCount: state.items.length,
            totalItems: state.totalItems,
            finalTotal: state.finalTotal,
            items: state.items.map(i => ({ id: i.id, productId: i.productId, qty: i.quantity, timestamp: i.lastOptimisticTimestamp })),
          });
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

      // Fetch All Cart Items (no pagination)
      .addCase(fetchCart.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(
        fetchCart.fulfilled,
        (state, action: PayloadAction<CartResponseModel>) => {
          state.loading.fetch = false;
          // Load all items at once - no pagination
          state.items = action.payload.items || [];

          recalculateTotals(state);
          state.loaded = true;
          state.error = null;
        }
      )
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.error.message || "Failed to fetch cart";
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
