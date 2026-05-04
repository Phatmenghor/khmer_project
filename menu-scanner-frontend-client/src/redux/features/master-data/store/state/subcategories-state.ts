import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectSubcategories,
  selectSubcategoriesContent,
  selectSubcategoriesState,
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
} from "../selectors/subcategories-selector";

export const useSubcategoriesState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const subcategoriesState = useAppSelector(selectSubcategoriesState);
  const subcategoriesData = useAppSelector(selectSubcategories);
  const subcategoriesContent = useAppSelector(selectSubcategoriesContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    subcategoriesState,
    subcategoriesData,
    subcategoriesContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
