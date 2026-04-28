import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  AllSubcategoriesResponseModel,
  SubcategoriesResponseModel,
} from "../models/response/subcategories-response";
import { SubcategoriesManagementState } from "../models/type/subcategories-type";
import {
  fetchAllSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  fetchSubcategoryDetail,
} from "../thunks/subcategories-thunks";

const initialState: SubcategoriesManagementState = {
  data: null,
  selectedSubcategories: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    pageNo: 1,
    status: "",
    categoryId: "",
  },
  operations: {
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    isFetchingDetail: false,
  },
};

const subcategoriesSlice = createSlice({
  name: "subcategories",
  initialState,
  reducers: {
    setSubcategoriesFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetSubcategoriesFilters: (state) => {
      state.filters = initialState.filters;
    },
    setSubcategoriesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSubcategoriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Subcategories
    builder.addCase(fetchAllSubcategories.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(
      fetchAllSubcategories.fulfilled,
      (state, action: PayloadAction<AllSubcategoriesResponseModel>) => {
        state.isLoading = false;
        state.data = action.payload;
      }
    );
    builder.addCase(fetchAllSubcategories.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Subcategory Detail
    builder.addCase(fetchSubcategoryDetail.pending, (state) => {
      state.operations.isFetchingDetail = true;
      state.error = null;
    });
    builder.addCase(
      fetchSubcategoryDetail.fulfilled,
      (state, action: PayloadAction<SubcategoriesResponseModel>) => {
        state.operations.isFetchingDetail = false;
        state.selectedSubcategories = action.payload;
      }
    );
    builder.addCase(fetchSubcategoryDetail.rejected, (state, action) => {
      state.operations.isFetchingDetail = false;
      state.error = action.payload as string;
    });

    // Create Subcategory
    builder.addCase(createSubcategory.pending, (state) => {
      state.operations.isCreating = true;
      state.error = null;
    });
    builder.addCase(createSubcategory.fulfilled, (state) => {
      state.operations.isCreating = false;
      state.error = null;
    });
    builder.addCase(createSubcategory.rejected, (state, action) => {
      state.operations.isCreating = false;
      state.error = action.payload as string;
    });

    // Update Subcategory
    builder.addCase(updateSubcategory.pending, (state) => {
      state.operations.isUpdating = true;
      state.error = null;
    });
    builder.addCase(updateSubcategory.fulfilled, (state) => {
      state.operations.isUpdating = false;
      state.error = null;
    });
    builder.addCase(updateSubcategory.rejected, (state, action) => {
      state.operations.isUpdating = false;
      state.error = action.payload as string;
    });

    // Delete Subcategory
    builder.addCase(deleteSubcategory.pending, (state) => {
      state.operations.isDeleting = true;
      state.error = null;
    });
    builder.addCase(deleteSubcategory.fulfilled, (state) => {
      state.operations.isDeleting = false;
      state.error = null;
    });
    builder.addCase(deleteSubcategory.rejected, (state, action) => {
      state.operations.isDeleting = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setSubcategoriesFilters,
  resetSubcategoriesFilters,
  setSubcategoriesError,
  clearSubcategoriesError,
} = subcategoriesSlice.actions;

export default subcategoriesSlice.reducer;
