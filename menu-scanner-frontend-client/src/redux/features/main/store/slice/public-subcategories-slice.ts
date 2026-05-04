import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchPublicSubcategories, CategoryWithSubcategories, PaginationResponse } from "../thunks/public-subcategories-thunks";

interface PublicSubcategoriesState {
  data: CategoryWithSubcategories[];
  pagination: PaginationResponse;
  isLoading: boolean;
  error: string | null;
  loadedFilters: string;
}

const initialState: PublicSubcategoriesState = {
  data: [],
  pagination: {
    currentPage: 1,
    pageSize: 12,
    totalElements: 0,
    totalPages: 0,
    hasMore: false,
  },
  isLoading: false,
  error: null,
  loadedFilters: "",
};

const publicSubcategoriesSlice = createSlice({
  name: "publicSubcategories",
  initialState,
  reducers: {
    resetSubcategories: () => initialState,
    setLoadedFilters: (state, action: PayloadAction<string>) => {
      state.loadedFilters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSubcategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicSubcategories.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, pagination } = action.payload;
        state.data = action.meta.arg.append ? [...state.data, ...data] : data;
        state.pagination = pagination;
      })
      .addCase(fetchPublicSubcategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch subcategories";
        state.data = [];
      });
  },
});

export const { resetSubcategories, setLoadedFilters } = publicSubcategoriesSlice.actions;
export default publicSubcategoriesSlice.reducer;
