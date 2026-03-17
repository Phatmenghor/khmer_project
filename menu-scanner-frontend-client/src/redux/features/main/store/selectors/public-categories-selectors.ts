/**
 * Public Categories Selectors
 */

import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectPublicCategoriesState = (state: RootState) =>
  state.publicCategories;

export const selectCategories = createSelector(
  [selectPublicCategoriesState],
  (state) => state.categories
);

export const selectCategoriesPagination = createSelector(
  [selectPublicCategoriesState],
  (state) => state.pagination
);

export const selectCategoriesLoading = createSelector(
  [selectPublicCategoriesState],
  (state) => state.loading
);

export const selectCategoriesError = createSelector(
  [selectPublicCategoriesState],
  (state) => state.error
);

export const selectCategoriesLoaded = createSelector(
  [selectPublicCategoriesState],
  (state) => state.loaded
);
