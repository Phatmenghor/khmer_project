import { useAppDispatch, useAppSelector, RootState } from "@/store";

export const selectIsProductFavorited = (state: RootState, productId: string) =>
  state.favorites.items.some((item) => item.id === productId);

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
