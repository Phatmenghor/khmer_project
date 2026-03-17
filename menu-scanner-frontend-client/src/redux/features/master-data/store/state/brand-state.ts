import { useAppDispatch, useAppSelector } from "@/redux/store";
import {
  selectBrand,
  selectBrandContent,
  selectBrandState,
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
} from "../selectors/brand-selector";

export const useBrandState = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const brandState = useAppSelector(selectBrandState);
  const brandData = useAppSelector(selectBrand);
  const brandContent = useAppSelector(selectBrandContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    brandState,
    brandData,
    brandContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
