/**
 * Public Brands State Hook
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectBrands,
  selectBrandsPagination,
  selectBrandsLoading,
  selectBrandsError,
  selectBrandsLoaded,
} from "../selectors/public-brands-selectors";
import { clearBrands, resetBrandsState } from "../slice/public-brands-slice";
import {
  fetchPublicBrands,
  FetchPublicBrandsParams,
} from "../thunks/public-brands-thunks";

export const usePublicBrandsState = () => {
  const dispatch = useAppDispatch();

  const brands = useAppSelector(selectBrands);
  const pagination = useAppSelector(selectBrandsPagination);
  const loading = useAppSelector(selectBrandsLoading);
  const error = useAppSelector(selectBrandsError);
  const loaded = useAppSelector(selectBrandsLoaded);

  const fetchBrands = useCallback(
    (params: FetchPublicBrandsParams) => dispatch(fetchPublicBrands(params)),
    [dispatch]
  );

  const handleClearBrands = useCallback(
    () => dispatch(clearBrands()),
    [dispatch]
  );

  const resetState = useCallback(
    () => dispatch(resetBrandsState()),
    [dispatch]
  );

  return {
    // State
    brands,
    pagination,
    loading,
    error,
    loaded,

    // Actions
    fetchBrands,
    clearBrands: handleClearBrands,
    resetState,

    // Computed
    isInitialLoading: loading.initial,
    isLoadingMore: loading.loadMore,
    hasMore: pagination.hasMore,
    totalBrands: pagination.totalElements,

    // Dispatch for advanced usage
    dispatch,
  };
};
