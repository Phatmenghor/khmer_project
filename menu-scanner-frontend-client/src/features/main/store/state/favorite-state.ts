import { useAppDispatch, useAppSelector } from "@/store";

export const useFavoriteState = () => {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector((state) => state.favorites);

  return {
    dispatch,
    items: favorites.items,
    totalItems: favorites.totalItems,
    pagination: favorites.pagination,
    loading: favorites.loading,
    error: favorites.error,
    loaded: favorites.loaded,
  };
};
