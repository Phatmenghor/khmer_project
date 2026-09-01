


import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
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

    brands,
    pagination,
    loading,
    error,
    loaded,


    fetchBrands,
    clearBrands: handleClearBrands,
    resetState,


    isInitialLoading: loading.initial,
    isLoadingMore: loading.loadMore,
    hasMore: pagination.hasMore,
    totalBrands: pagination.totalElements,


    dispatch,
  };
};
