"use client";

import { useRef, useEffect, useCallback } from "react";
import { AppDispatch } from "@/redux/store";
import {
  addToCart,
  updateCartItem,
} from "@/redux/features/main/store/thunks/cart-thunks";
import { showToast } from "@/components/shared/common/show-toast";

const DEBOUNCE_DELAY = 500;

/** Check if error is from an aborted/superseded request */
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

/**
 * Hook that manages debounced cart API calls per item key.
 *
 * REFACTOR v2: Serial Queue Approach
 * - Instead of aborting previous requests (which can cause server race conditions if not handled strictly),
 *   we now strictly serialize requests for the same item.
 * - If a request is active, the next update waits in a "pending" slot.
 * - When the active request finishes, we check if there's a pending update and fire it.
 * - This ensures 1 active request per item at a time, but still debounces rapid clicks.
 */
export function useCartDebounce(dispatch: AppDispatch) {
  // Debounce timers per item key (for the initial wait)
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Pending updates that are waiting to be sent (next in line).
  // We store the arguments so we always send the *latest* state.
  const pendingUpdatesRef = useRef<
    Map<
      string,
      {
        productId: string;
        productSizeId: string | null;
        quantity: number;
        optimisticTimestamp?: number;
      }
    >
  >(new Map());

  // Track if a request is currently in flight for a key
  const isProcessingRef = useRef<Map<string, boolean>>(new Map());

  // Keep track of active promises ONLY for unmount cleanup.
  // We do NOT abort them for sequential updates anymore.
  const activePromisesRef = useRef<Map<string, { abort: () => void }>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    const timers = timersRef.current;
    const activePromises = activePromisesRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
      // On unmount, it IS safe to abort because we don't care about the result anymore
      activePromises.forEach((promise) => promise.abort());
      activePromises.clear();
    };
  }, []);

  /**
   * Process the next pending update for a given key.
   * If a request is already active, this does nothing (the active request's 'finally' logic will loop back).
   */
  const processQueue = useCallback(
    (key: string) => {
      // If already processing, let it finish. The finally block of the active request will pick up the next item.
      if (isProcessingRef.current.get(key)) return;

      // Get the latest pending update
      const args = pendingUpdatesRef.current.get(key);
      if (!args) return; // Nothing to do

      // Consume the item (remove from pending)
      pendingUpdatesRef.current.delete(key);

      // Mark as processing
      isProcessingRef.current.set(key, true);

      const { productId, productSizeId, quantity, optimisticTimestamp } = args;

      // Dispatch the appropriate thunk
      const thunkAction =
        quantity > 0
          ? addToCart({
            productId,
            productSizeId,
            quantity,
            optimisticTimestamp,
          })
          : updateCartItem({
            productId,
            productSizeId,
            quantity: 0,
            optimisticTimestamp,
          });

      const promise = dispatch(thunkAction);

      // Store for unmount cleanup
      activePromisesRef.current.set(key, promise);

      promise
        .unwrap()
        .then(() => {
          if (quantity === 0) {
            showToast.success("Removed from cart");
          }
        })
        .catch((error: any) => {
          // Silently ignore aborted/superseded requests
          if (isAbortError(error)) return;
          showToast.error(error?.message || "Failed to update cart");
        })
        .finally(() => {
          // Clean up
          activePromisesRef.current.delete(key);
          isProcessingRef.current.set(key, false);

          // RECURSIVE STEP: Check if more updates came in while we were busy
          // If the user clicked 5 times while we were waiting, 'pendingUpdatesRef' will have the LATEST click args.
          // We immediately process it now.
          processQueue(key);
        });
    },
    [dispatch]
  );

  /**
   * Debounced API call. Call this on every +/- click.
   * Buffers the update and processes it after the debounce delay.
   * If a request is active, it queues up to run *after* the current one.
   */
  const debouncedUpdate = useCallback(
    (
      key: string,
      productId: string,
      productSizeId: string | null,
      quantity: number,
      optimisticTimestamp?: number
    ) => {
      // Validate inputs
      if (!productId) {
        console.warn("[Cart Debounce] Missing productId in debouncedUpdate");
        return;
      }

      // Update the pending state to the LATEST values
      pendingUpdatesRef.current.set(key, {
        productId,
        productSizeId,
        quantity,
        optimisticTimestamp,
      });

      // Clear existing timer for this key (reset debounce)
      const existingTimer = timersRef.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);

      // Start new timer
      timersRef.current.set(
        key,
        setTimeout(() => {
          timersRef.current.delete(key);
          processQueue(key);
        }, DEBOUNCE_DELAY)
      );
    },
    [processQueue]
  );

  /**
   * Immediate API call (no debounce). Use for explicit "Remove" / "Clear" actions.
   * Queues the update immediately.
   */
  const immediateUpdate = useCallback(
    (
      key: string,
      productId: string,
      productSizeId: string | null,
      quantity: number,
      optimisticTimestamp?: number
    ) => {
      // Cancel pending debounce
      const existingTimer = timersRef.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);
      timersRef.current.delete(key);

      // Update pending state
      pendingUpdatesRef.current.set(key, {
        productId,
        productSizeId,
        quantity,
        optimisticTimestamp,
      });

      // Trigger immediately
      processQueue(key);
    },
    [processQueue]
  );

  /**
   * Cancel all pending debounces and queue items.
   * Does NOT abort active requests (to ensure server consistency),
   * but effectively stops further processing.
   */
  const cancelAll = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    pendingUpdatesRef.current.clear();
    // Intentionally NOT aborting active requests to prevent partial server state.
    // Only unmount aborts.
  }, []);

  return { debouncedUpdate, immediateUpdate, cancelAll };
}

/** Helper to build a debounce key from productId + sizeId */
export function cartItemKey(
  productId: string,
  productSizeId: string | null | undefined
): string {
  return `${productId}_${productSizeId ?? "null"}`;
}
