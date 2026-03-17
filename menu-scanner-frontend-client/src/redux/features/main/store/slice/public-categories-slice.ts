/**
 * Public Categories Slice
 * Manages categories data for public-facing pages with caching and scroll restoration
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CategoriesResponseModel } from "@/redux/features/master-data/store/models/response/categories-response";
import { fetchPublicCategories } from "../thunks/public-categories-thunks";

export interface PublicCategoriesState {
  categories: CategoriesResponseModel[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalElements: number;
    hasMore: boolean;
  };
  loading: {
    initial: boolean;
    loadMore: boolean;
  };
  error: string | null;
  loaded: boolean;
}

const initialState: PublicCategoriesState = {
  categories: [],
  pagination: {
    currentPage: 1,
    pageSize: 12,
    totalPages: 0,
    totalElements: 0,
    hasMore: true,
  },
  loading: {
    initial: false,
    loadMore: false,
  },
  error: null,
  loaded: false,
};

const publicCategoriesSlice = createSlice({
  name: "publicCategories",
  initialState,
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
      state.pagination = initialState.pagination;
      state.loaded = false;
    },
    resetCategoriesState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchPublicCategories.pending, (state, action) => {
        const isLoadMore = action.meta.arg.append;
        if (isLoadMore) {
          state.loading.loadMore = true;
        } else {
          state.loading.initial = true;
        }
        state.error = null;
      })
      .addCase(fetchPublicCategories.fulfilled, (state, action) => {
        const { content, pageNo, pageSize, totalPages, totalElements } =
          action.payload;
        const isLoadMore = action.meta.arg.append;

        if (isLoadMore) {
          // Memory optimization: Keep only last 3 pages of data (like YouTube)
          const MAX_PAGES_IN_MEMORY = 3;
          const maxItems = MAX_PAGES_IN_MEMORY * pageSize;

          // Append new categories
          const updatedCategories = [...state.categories, ...content];

          // If we exceed the limit, remove oldest items
          if (updatedCategories.length > maxItems) {
            const itemsToRemove = updatedCategories.length - maxItems;
            state.categories = updatedCategories.slice(itemsToRemove);
          } else {
            state.categories = updatedCategories;
          }
        } else {
          state.categories = content;
        }

        state.pagination = {
          currentPage: pageNo,
          pageSize,
          totalPages,
          totalElements,
          hasMore: pageNo < totalPages,
        };

        state.loading.initial = false;
        state.loading.loadMore = false;
        state.loaded = true;
      })
      .addCase(fetchPublicCategories.rejected, (state, action) => {
        state.loading.initial = false;
        state.loading.loadMore = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategories, resetCategoriesState } =
  publicCategoriesSlice.actions;
export default publicCategoriesSlice.reducer;
