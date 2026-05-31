"use client";

import { Messages } from "@/constants/messages";
import { useRef, useEffect, useCallback } from "react";
import { AppDispatch } from "@/store";
import { updateCartItem } from "@/features/main/store/thunks/cart-thunks";
import { showToast } from "@/components/shared/common/show-toast";

// How long to wait after the in-flight call finishes before firing the queued update.
// This batches any extra clicks that arrived while the API was busy.
const TRAILING_DELAY = 50;

function isAbortError(error: any): boolean {
  return (
    error?.aborted ||
    error?.name === "AbortError" ||
    error?.type === "aborted" ||
    error?.message === "Aborted" ||
    error?.message === "Request superseded" ||
    error?.message === "canceled" ||
    error === "canceled" ||
    error?.code === "ERR_CANCELED"
  );
}

export function useCartDebounce(dispatch: AppDispatch) {
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const pendingUpdatesRef = useRef<
    Map<
      string,
      {
        productId: string;
        productSizeId: string | null;
        quantity: number;
        customizationIds?: string[];
        optimisticTimestamp?: number;
      }
    >
  >(new Map());

  const isProcessingRef = useRef<Map<string, boolean>>(new Map());
  const activePromisesRef = useRef<Map<string, { abort: () => void }>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    const activePromises = activePromisesRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      activePromises.forEach((promise) => promise.abort());
      activePromises.clear();
    };
  }, []);

  const processQueue = useCallback(
    (key: string) => {
      if (isProcessingRef.current.get(key)) return;

      const args = pendingUpdatesRef.current.get(key);
      if (!args) return;

      pendingUpdatesRef.current.delete(key);
      isProcessingRef.current.set(key, true);

      const { productId, productSizeId, quantity, customizationIds, optimisticTimestamp } = args;

      const promise = dispatch(
        updateCartItem({ productId, productSizeId, quantity, customizationIds, optimisticTimestamp })
      );
      activePromisesRef.current.set(key, promise);

      promise
        .unwrap()
        .then(() => {
          if (quantity === 0) showToast.success(Messages.cart.removed);
        })
        .catch((error: unknown) => {
          if (isAbortError(error)) return;
          showToast.error((error as { message?: string })?.message || Messages.cart.updateFailed);
        })
        .finally(() => {
          activePromisesRef.current.delete(key);
          isProcessingRef.current.set(key, false);

          // If more clicks arrived while this call was in-flight, fire them now
          if (pendingUpdatesRef.current.has(key)) {
            const t = timersRef.current.get(key);
            if (t) clearTimeout(t);
            timersRef.current.set(key, setTimeout(() => {
              timersRef.current.delete(key);
              processQueue(key);
            }, TRAILING_DELAY));
          }
        });
    },
    [dispatch]
  );

  /**
   * Fire immediately if idle for this key (no API in-flight, no pending timer).
   * If an API call is already in-flight, queue the update — it will be sent as
   * a single trailing call once the current one finishes.
   * Result: first click → 0ms latency; rapid clicks → max 2 API calls total.
   */
  const debouncedUpdate = useCallback(
    (
      key: string,
      productId: string,
      productSizeId: string | null,
      quantity: number,
      optimisticTimestamp?: number,
      customizationIds?: string[]
    ) => {
      if (!productId) return;

      pendingUpdatesRef.current.set(key, {
        productId,
        productSizeId,
        quantity,
        customizationIds,
        optimisticTimestamp,
      });

      // Cancel any existing trailing timer (we have a fresher value now)
      const existingTimer = timersRef.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);

      if (!isProcessingRef.current.get(key)) {
        // Idle — fire immediately, no wait
        timersRef.current.delete(key);
        processQueue(key);
      }
      // else: API in-flight — pending map already updated, .finally() will pick it up
    },
    [processQueue]
  );

  /** Skip the debounce entirely — fire right now regardless of in-flight state. */
  const immediateUpdate = useCallback(
    (
      key: string,
      productId: string,
      productSizeId: string | null,
      quantity: number,
      optimisticTimestamp?: number,
      customizationIds?: string[]
    ) => {
      const existingTimer = timersRef.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);
      timersRef.current.delete(key);

      pendingUpdatesRef.current.set(key, {
        productId,
        productSizeId,
        quantity,
        customizationIds,
        optimisticTimestamp,
      });

      processQueue(key);
    },
    [processQueue]
  );

  const cancelAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    pendingUpdatesRef.current.clear();
    isProcessingRef.current.clear();
  }, []);

  const isUpdating = useCallback((key: string): boolean => {
    return timersRef.current.has(key) || isProcessingRef.current.get(key) === true;
  }, []);

  return { debouncedUpdate, immediateUpdate, cancelAll, isUpdating };
}

export function cartItemKey(
  productId: string,
  productSizeId: string | null | undefined,
  customizationIds?: string[]
): string {
  const sizeKey = productSizeId ?? "null";
  if (!customizationIds || customizationIds.length === 0) {
    return `${productId}_${sizeKey}`;
  }
  const customKey = [...customizationIds].sort().join(",");
  return `${productId}_${sizeKey}_${customKey}`;
}
