"use client";

import { useRef, useEffect, useCallback } from "react";
import { AppDispatch } from "@/store";
import { toggleFavorite } from "@/features/main/store/thunks/favorite-thunks";
import { toggleLocalFavorite } from "@/features/main/store/slice/favorite-slice";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";
import { DEBOUNCE_CONSTANTS } from "@/constants/ui-constants";
import { getToken } from "@/utils/local-storage/token";
import { ProductDetailResponseModel } from "@/features/business/store/models/response/product-response";

const DEBOUNCE_DELAY = DEBOUNCE_CONSTANTS.FAVORITE_DEBOUNCE_MS;

export function useFavoriteDebounce(dispatch: AppDispatch) {
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pendingUpdatesRef = useRef<Map<string, { initialState: boolean; currentState: boolean }>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const debouncedToggleFavorite = useCallback(
    (
      productOrId: ProductDetailResponseModel | { id: string; [key: string]: any } | string,
      currentIsFavorited: boolean,
      onStateChange?: (newState: boolean) => void
    ) => {
      const productId = typeof productOrId === "string" ? productOrId : productOrId?.id;
      if (!productId) return;

      const product = typeof productOrId === "string" ? ({ id: productId } as any) : productOrId;

      const existing = pendingUpdatesRef.current.get(productId);
      const initialState = existing ? existing.initialState : currentIsFavorited;
      const nextState = !currentIsFavorited;

      // Update Redux state and local storage immediately
      dispatch(toggleLocalFavorite(product as ProductDetailResponseModel));

      // Update local hook state immediately for fast UI feedback
      pendingUpdatesRef.current.set(productId, {
        initialState,
        currentState: nextState,
      });

      onStateChange?.(nextState);

      const hasAuth = !!getToken();

      if (!hasAuth) {
        return;
      }

      // Reset timer so rapidly clicking only triggers 1 final API request
      const existingTimer = timersRef.current.get(productId);
      if (existingTimer) clearTimeout(existingTimer);

      timersRef.current.set(
        productId,
        setTimeout(() => {
          timersRef.current.delete(productId);
          const update = pendingUpdatesRef.current.get(productId);
          pendingUpdatesRef.current.delete(productId);

          if (!update) return;
          const { initialState: initial, currentState: finalState } = update;

          // Only call API if the final state is different from the initial state
          if (initial !== finalState) {
            dispatch(toggleFavorite({ productId, isFavorited: initial }))
              .unwrap()
              .catch((error: unknown) => {
                // Revert state if backend rejected
                dispatch(toggleLocalFavorite(product as ProductDetailResponseModel));
                onStateChange?.(initial);
                showToast.error((error as { message?: string })?.message || Messages.favorites.updateFailed);
              });
          }
        }, DEBOUNCE_DELAY)
      );
    },
    [dispatch]
  );

  return { debouncedToggleFavorite };
}
