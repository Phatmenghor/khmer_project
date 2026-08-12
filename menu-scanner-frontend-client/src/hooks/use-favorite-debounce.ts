"use client";

import { useRef, useEffect, useCallback } from "react";
import { AppDispatch } from "@/store";
import { toggleFavorite } from "@/features/main/store/thunks/favorite-thunks";
import { showToast } from "@/components/shared/common/show-toast";
import { Messages } from "@/constants/messages";
import { DEBOUNCE_CONSTANTS } from "@/constants/ui-constants";

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
    (productId: string, currentIsFavorited: boolean, onStateChange?: (newState: boolean) => void) => {
      if (!productId) return;

      const existing = pendingUpdatesRef.current.get(productId);
      const initialState = existing ? existing.initialState : currentIsFavorited;
      const nextState = !currentIsFavorited;

      // Update local state immediately for fast UI feedback
      pendingUpdatesRef.current.set(productId, {
        initialState,
        currentState: nextState,
      });

      onStateChange?.(nextState);

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
