import { useAppDispatch, useAppSelector } from "@/redux/store";

export const useMyOrdersState = () => {
  const dispatch = useAppDispatch();

  return {
    dispatch,
    orders: useAppSelector((state) => state.myOrders.orders),
    pagination: useAppSelector((state) => state.myOrders.pagination),
    loading: useAppSelector((state) => state.myOrders.loading),
    error: useAppSelector((state) => state.myOrders.error),
    statusTabs: useAppSelector((state) => state.myOrders.statusTabs),
    loadedFilters: useAppSelector((state) => state.myOrders.loadedFilters),
  };
};
