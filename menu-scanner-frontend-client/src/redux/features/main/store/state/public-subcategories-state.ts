import { useAppDispatch, useAppSelector } from "@/redux/store";
import { RootState } from "@/redux/store";
import { fetchPublicSubcategories, FetchPublicSubcategoriesParams } from "../thunks/public-subcategories-thunks";
import { resetSubcategories, setLoadedFilters } from "../slice/public-subcategories-slice";

export const usePublicSubcategoriesState = () => {
  const dispatch = useAppDispatch();

  const data = useAppSelector((state: RootState) => state.publicSubcategories.data);
  const pagination = useAppSelector((state: RootState) => state.publicSubcategories.pagination);
  const isLoading = useAppSelector((state: RootState) => state.publicSubcategories.isLoading);
  const error = useAppSelector((state: RootState) => state.publicSubcategories.error);
  const loadedFilters = useAppSelector((state: RootState) => state.publicSubcategories.loadedFilters);

  const fetchSubcategories = (params: FetchPublicSubcategoriesParams) => {
    return dispatch(fetchPublicSubcategories(params));
  };

  const resetState = () => {
    dispatch(resetSubcategories());
  };

  const updateLoadedFilters = (filters: string) => {
    dispatch(setLoadedFilters(filters));
  };

  return {
    data,
    pagination,
    isLoading,
    error,
    loadedFilters,
    fetchSubcategories,
    resetState,
    updateLoadedFilters,
    dispatch,
  };
};
