import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchPublicSubcategories, fetchPublicSubcategoriesByCategory, CategoryWithSubcategories } from "../thunks/public-subcategories-thunks";

interface PublicSubcategoriesState {
  data: CategoryWithSubcategories[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PublicSubcategoriesState = {
  data: [],
  isLoading: false,
  error: null,
};

const publicSubcategoriesSlice = createSlice({
  name: "publicSubcategories",
  initialState,
  reducers: {
    resetSubcategories: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicSubcategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicSubcategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPublicSubcategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch subcategories";
        state.data = [];
      })
      .addCase(fetchPublicSubcategoriesByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicSubcategoriesByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchPublicSubcategoriesByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch subcategories";
        state.data = [];
      });
  },
});

export const { resetSubcategories } = publicSubcategoriesSlice.actions;
export default publicSubcategoriesSlice.reducer;
