import { useAppDispatch, useAppSelector } from "@/redux/store";
import { RootState } from "@/redux/store";
import { fetchPublicSubcategories, FetchPublicSubcategoriesParams } from "../thunks/public-subcategories-thunks";
import { resetSubcategories } from "../slice/public-subcategories-slice";

export const usePublicSubcategoriesState = () => {
  const dispatch = useAppDispatch();

  const data = useAppSelector((state: RootState) => state.publicSubcategories.data);
  const isLoading = useAppSelector((state: RootState) => state.publicSubcategories.isLoading);
  const error = useAppSelector((state: RootState) => state.publicSubcategories.error);

  const fetchSubcategories = (params: FetchPublicSubcategoriesParams) => {
    return dispatch(fetchPublicSubcategories(params));
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
