import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchCart } from "../thunks/cart-thunks";
import { showToast } from "@/components/shared/common/show-toast";

export const useCartState = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);

  // Auto-rollback: when a mutation fails, refetch to restore true server state
  useEffect(() => {
    if (cart.needsRefetch && cart.loaded) {
      showToast.error(cart.error || "Cart update failed — refreshing cart");
      dispatch(fetchCart());
    }
  }, [cart.needsRefetch, cart.loaded, cart.error, dispatch]);

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
    needsRefetch: cart.needsRefetch,
  };
};
