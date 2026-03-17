/**
 * Public Brands Selectors
 */

import { RootState } from "@/redux/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectPublicBrandsState = (state: RootState) => state.publicBrands;

export const selectBrands = createSelector(
  [selectPublicBrandsState],
  (state) => state.brands
);

export const selectBrandsPagination = createSelector(
  [selectPublicBrandsState],
  (state) => state.pagination
);

export const selectBrandsLoading = createSelector(
  [selectPublicBrandsState],
  (state) => state.loading
);

export const selectBrandsError = createSelector(
  [selectPublicBrandsState],
  (state) => state.error
);

export const selectBrandsLoaded = createSelector(
  [selectPublicBrandsState],
  (state) => state.loaded
);
