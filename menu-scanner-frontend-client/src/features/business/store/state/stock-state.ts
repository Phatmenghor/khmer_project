import { useAppDispatch, useAppSelector } from "@/store";
import {
  selectError,
  selectFilters,
  selectIsLoading,
  selectOperations,
  selectPagination,
  selectStock,
  selectStockContent,
  selectStockState,
} from "../selectors/stock-selector";

export const useStockState = () => {
  const dispatch = useAppDispatch();


  const stockState = useAppSelector(selectStockState);
  const stockData = useAppSelector(selectStock);
  const stockContent = useAppSelector(selectStockContent);
  const filters = useAppSelector(selectFilters);
  const operations = useAppSelector(selectOperations);
  const pagination = useAppSelector(selectPagination);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  return {
    stockState,
    stockData,
    stockContent,
    isLoading,
    error,
    filters,
    operations,
    pagination,
    dispatch,
  };
};
