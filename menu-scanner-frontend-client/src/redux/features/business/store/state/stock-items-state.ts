import { useAppDispatch, useAppSelector } from "@/redux/store";
import { RootState } from "@/redux/store";

/**
 * Custom hook for accessing stock items state and dispatch
 * Provides a convenient way to access commonly used selectors and dispatch functions
 */
export const useStockItemsState = () => {
  const dispatch = useAppDispatch();

  // Select individual parts of state
  const stockItemsState = useAppSelector((state: RootState) => state.stockItems);
  const stockItemsData = useAppSelector((state: RootState) => state.stockItems.data);
  const stockItemsContent = useAppSelector((state: RootState) => state.stockItems.items);
  const isLoading = useAppSelector((state: RootState) => state.stockItems.isLoading);
  const error = useAppSelector((state: RootState) => state.stockItems.error);
  const filters = useAppSelector((state: RootState) => state.stockItems.filters);
  const pagination = useAppSelector((state: RootState) => state.stockItems.pagination);

  return {
    stockItemsState,
    stockItemsData,
    stockItemsContent,
    isLoading,
    error,
    filters,
    pagination,
    dispatch,
  };
};
