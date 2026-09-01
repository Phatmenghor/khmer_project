import { Messages } from "@/constants/messages";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";
import { AllFavoriteResponseModel } from "../models/response/favorite-response";
import {
  fetchFavoritePaginated,
  fetchFavoriteList,
  toggleFavorite,
  clearAllFavorites,
} from "../thunks/favorite-thunks";

import { getActiveTableSession } from "@/utils/table/table-session";

const GUEST_FAVORITES_STORAGE_KEY = "guest_favorites";

const getFavoriteStorageKey = () => {
  const activeTable = getActiveTableSession();
  return activeTable?.tableId ? `table_favorites_${activeTable.tableId}` : GUEST_FAVORITES_STORAGE_KEY;
};

const saveGuestFavorites = (items: ProductDetailResponseModel[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getFavoriteStorageKey(), JSON.stringify(items));
  } catch {
    // ignore localStorage errors
  }
};

const loadGuestFavorites = (): ProductDetailResponseModel[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getFavoriteStorageKey());
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

interface FavoriteState {
  items: ProductDetailResponseModel[];
  totalItems: number;
  pagination: {
    currentPage: number;
    pageSize: number;
    hasMore: boolean;
  };
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
  pagination: {
    currentPage: 1,
    pageSize: 20,
    hasMore: false,
  },
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

    loadFavoritesFromStorage: (state) => {
      const storedItems = loadGuestFavorites();
      state.items = storedItems;
      state.totalItems = storedItems.length;
      state.pagination = {
        currentPage: 1,
        pageSize: Math.max(storedItems.length, 20),
        hasMore: false,
      };
      state.loaded = true;
      state.error = null;
    },

    toggleLocalFavorite: (state, action: PayloadAction<ProductDetailResponseModel>) => {
      const product = action.payload;
      if (!product || !product.id) return;

      const existingIndex = state.items.findIndex((item) => item.id === product.id);
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.unshift(product);
      }

      state.totalItems = state.items.length;
      state.pagination.pageSize = Math.max(state.items.length, 20);
      state.loaded = true;
      saveGuestFavorites(state.items);
    },

    addLocalFavorite: (state, action: PayloadAction<ProductDetailResponseModel>) => {
      const product = action.payload;
      if (!product || !product.id) return;

      const exists = state.items.some((item) => item.id === product.id);
      if (!exists) {
        state.items.unshift(product);
        state.totalItems = state.items.length;
        saveGuestFavorites(state.items);
      }
      state.loaded = true;
    },

    removeLocalFavorite: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (!productId) return;

      state.items = state.items.filter((item) => item.id !== productId);
      state.totalItems = state.items.length;
      saveGuestFavorites(state.items);
      state.loaded = true;
    },

    clearLocalFavorites: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.pagination = {
        currentPage: 1,
        pageSize: 20,
        hasMore: false,
      };
      saveGuestFavorites([]);
      state.loaded = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Paginated Fetch ──
      .addCase(fetchFavoritePaginated.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchFavoritePaginated.fulfilled, (state, action) => {
        state.loading.fetch = false;
        const newItems = action.payload.content || [];
        const pageNo = action.meta.arg.pageNo;

        if (pageNo === 1) {
          state.items = newItems;
        } else {
          // Merge avoiding duplicate IDs
          const existingIds = new Set(state.items.map((i) => i.id));
          const toAdd = newItems.filter((i) => !existingIds.has(i.id));
          state.items.push(...toAdd);
        }

        state.totalItems = action.payload.totalElements || state.items.length;
        state.pagination.currentPage = pageNo;
        state.pagination.pageSize = action.meta.arg.pageSize;
        state.pagination.hasMore = state.items.length < state.totalItems;
        state.loaded = true;
        state.error = null;
      })
      .addCase(fetchFavoritePaginated.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = (action.payload as string) || "Failed to fetch favorites";
      })

      // ── Full List Fetch ──
      .addCase(fetchFavoriteList.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(
        fetchFavoriteList.fulfilled,
        (state, action: PayloadAction<AllFavoriteResponseModel>) => {
          state.loading.fetch = false;
          state.items = action.payload.content || [];
          state.totalItems = action.payload.totalElements || state.items.length;
          state.pagination.currentPage = 1;
          state.pagination.pageSize = Math.max(state.items.length, 20);
          state.pagination.hasMore = false;
          state.loaded = true;
          state.error = null;
        }
      )
      .addCase(fetchFavoriteList.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = (action.payload as string) || "Failed to fetch favorites";
      })

      // ── Server Toggle ──
      .addCase(toggleFavorite.pending, (state, action) => {
        const { productId, isFavorited } = action.meta.arg;
        if (isFavorited) {
          const idx = state.items.findIndex((item) => item.id === productId);
          if (idx >= 0) state.items.splice(idx, 1);
          state.totalItems = Math.max(0, state.totalItems - 1);
        } else {
          state.totalItems += 1;
        }
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.error = null;
        if (!action.meta.arg.isFavorited) {
          state.loaded = false;
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        const { isFavorited } = action.meta.arg;
        if (isFavorited) {
          state.totalItems += 1;
        } else {
          state.totalItems = Math.max(0, state.totalItems - 1);
        }
        state.error =
          (action.payload as string) || "Failed to toggle favorite";
      })

      // ── Server Clear All ──
      .addCase(clearAllFavorites.pending, (state) => {
        state.loading.clearAll = true;
        state.error = null;
      })
      .addCase(clearAllFavorites.fulfilled, (state) => {
        state.loading.clearAll = false;
        state.items = [];
        state.totalItems = 0;
        state.pagination = {
          currentPage: 1,
          pageSize: 20,
          hasMore: false,
        };
        saveGuestFavorites([]);
        state.error = null;
      })
      .addCase(clearAllFavorites.rejected, (state, action) => {
        state.loading.clearAll = false;
        state.error =
          (action.payload as string) || Messages.favorites.clearFailed;
      });
  },
});

export const {
  resetFavorites,
  loadFavoritesFromStorage,
  toggleLocalFavorite,
  addLocalFavorite,
  removeLocalFavorite,
  clearLocalFavorites,
} = favoriteSlice.actions;

export default favoriteSlice.reducer;
