import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductDetailResponseModel } from "@/redux/features/business/store/models/response/product-response";
import { AllFavoriteResponseModel } from "../models/response/favorite-response";
import {
  fetchFavoriteList,
  toggleFavorite,
  clearAllFavorites,
} from "../thunks/favorite-thunks";

interface FavoriteState {
  items: ProductDetailResponseModel[];
  totalItems: number;
  loading: {
    fetch: boolean;
    toggle: boolean;
    clearAll: boolean;
  };
  error: string | null;
  loaded: boolean;
}

const initialState: FavoriteState = {
  items: [],
  totalItems: 0,
  loading: {
    fetch: false,
    toggle: false,
    clearAll: false,
  },
  error: null,
  loaded: false,
};

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    resetFavorites: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Service 1: Fetch Favorites List
      .addCase(fetchFavoriteList.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(
        fetchFavoriteList.fulfilled,
        (state, action: PayloadAction<AllFavoriteResponseModel>) => {
          state.loading.fetch = false;
          state.items = action.payload.content || [];
          state.totalItems = action.payload.totalElements || 0;
          state.loaded = true;
          state.error = null;
        },
      )
      .addCase(fetchFavoriteList.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = (action.payload as string) || "Failed to fetch favorites";
      })

      // Service 2: Toggle Favorite (optimistic - update UI first, API in background)
      .addCase(toggleFavorite.pending, (state, action) => {
        const { productId, isFavorited } = action.meta.arg;
        if (isFavorited) {
          // Currently favorited → remove optimistically
          const idx = state.items.findIndex((item) => item.id === productId);
          if (idx >= 0) state.items.splice(idx, 1);
          state.totalItems = Math.max(0, state.totalItems - 1);
        } else {
          // Not favorited → add optimistically (count only; full item loaded on next fetch)
          state.totalItems += 1;
        }
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.error = null;
        // When adding a new favorite, mark stale so favorites page refetches
        // to get full product data (optimistic only increments count)
        if (!action.meta.arg.isFavorited) {
          state.loaded = false;
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        // Rollback based on what we tried to do
        const { isFavorited } = action.meta.arg;
        if (isFavorited) {
          // We tried to remove → add count back
          state.totalItems += 1;
        } else {
          // We tried to add → subtract count back
          state.totalItems = Math.max(0, state.totalItems - 1);
        }
        state.error =
          (action.payload as string) || "Failed to toggle favorite";
      })

      // Service 3: Clear all favorites
      .addCase(clearAllFavorites.pending, (state) => {
        state.loading.clearAll = true;
        state.error = null;
      })
      .addCase(clearAllFavorites.fulfilled, (state) => {
        state.loading.clearAll = false;
        state.items = [];
        state.totalItems = 0;
        state.error = null;
      })
      .addCase(clearAllFavorites.rejected, (state, action) => {
        state.loading.clearAll = false;
        state.error =
          (action.payload as string) || "Failed to clear favorites";
      });
  },
});

export const { resetFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
