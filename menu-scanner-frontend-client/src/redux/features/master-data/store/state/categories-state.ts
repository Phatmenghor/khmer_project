import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectCategories,
  selectCategoriesContent,
  selectCategoriesState,
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
} from "../selectors/categories-selector";

export const useCategoriesState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const categoriesState = useAppSelector(selectCategoriesState);
  const categoriesData = useAppSelector(selectCategories);
  const categoriesContent = useAppSelector(selectCategoriesContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    categoriesState,
    categoriesData,
    categoriesContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
