/**
 * Public Categories State Hook
 */

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectCategories,
  selectCategoriesPagination,
  selectCategoriesLoading,
  selectCategoriesError,
  selectCategoriesLoaded,
} from "../selectors/public-categories-selectors";
import {
  clearCategories,
  resetCategoriesState,
} from "../slice/public-categories-slice";
import {
  fetchPublicCategories,
  FetchPublicCategoriesParams,
} from "../thunks/public-categories-thunks";

export const usePublicCategoriesState = () => {
  const dispatch = useAppDispatch();

  const categories = useAppSelector(selectCategories);
  const pagination = useAppSelector(selectCategoriesPagination);
  const loading = useAppSelector(selectCategoriesLoading);
  const error = useAppSelector(selectCategoriesError);
  const loaded = useAppSelector(selectCategoriesLoaded);

  const fetchCategories = useCallback(
    (params: FetchPublicCategoriesParams) => dispatch(fetchPublicCategories(params)),
    [dispatch]
  );

  const handleClearCategories = useCallback(
    () => dispatch(clearCategories()),
    [dispatch]
  );

  const resetState = useCallback(
    () => dispatch(resetCategoriesState()),
    [dispatch]
  );

  return {
    // State
    categories,
    pagination,
    loading,
    error,
    loaded,

    // Actions
    fetchCategories,
    clearCategories: handleClearCategories,
    resetState,

    // Computed
    isInitialLoading: loading.initial,
    isLoadingMore: loading.loadMore,
    hasMore: pagination.hasMore,
    totalCategories: pagination.totalElements,

    // Dispatch for advanced usage
    dispatch,
  };
};
