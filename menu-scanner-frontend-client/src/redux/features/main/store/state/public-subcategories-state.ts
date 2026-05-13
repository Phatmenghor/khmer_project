import { useAppDispatch, useAppSelector } from "@/redux/store";
import { RootState } from "@/redux/store";
import { fetchPublicSubcategoriesByCategory } from "../thunks/public-subcategories-thunks";
import { resetSubcategories } from "../slice/public-subcategories-slice";

export const usePublicSubcategoriesState = () => {
  const dispatch = useAppDispatch();

  const data = useAppSelector((state: RootState) => state.publicSubcategories?.data || []);
  const isLoading = useAppSelector((state: RootState) => state.publicSubcategories?.isLoading || false);
  const error = useAppSelector((state: RootState) => state.publicSubcategories?.error || null);

  const fetchSubcategories = (params: { search?: string; status?: string }) => {
    return dispatch(fetchPublicSubcategoriesByCategory(params));
  };

  const resetState = () => {
    dispatch(resetSubcategories());
  };

  return {
    data,
    isLoading,
    error,
    fetchSubcategories,
    resetState,
    dispatch,
  };
};
