import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";

export const useCartState = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cart = useSelector((state: RootState) => state.cart);

  return {
    dispatch,
    items: cart.items,
    totalItems: cart.totalItems,
    totalQuantity: cart.totalQuantity,
    subtotal: cart.subtotal,
    discountAmount: cart.discountAmount,
    finalTotal: cart.finalTotal,
    loading: cart.loading,
    error: cart.error,
    loaded: cart.loaded,
  };
};
