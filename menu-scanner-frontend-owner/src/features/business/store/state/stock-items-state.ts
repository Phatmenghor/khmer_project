import { useAppDispatch, useAppSelector } from "@/store";
import { RootState } from "@/store";


export const useStockItemsState = () => {
  const dispatch = useAppDispatch();


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
