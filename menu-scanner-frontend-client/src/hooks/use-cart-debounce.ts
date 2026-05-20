"use client";

import { Messages } from "@/constants/messages";
import { useRef, useEffect, useCallback } from "react";
import { AppDispatch } from "@/store";
import {
  updateCartItem,
} from "@/features/main/store/thunks/cart-thunks";
import { showToast } from "@/components/shared/common/show-toast";

const DEBOUNCE_DELAY = 500;


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

      const { productId, productSizeId, quantity, optimisticTimestamp } = args;
      const apiCallTime = performance.now();


      const thunkAction = updateCartItem({
        productId,
        productSizeId,
        quantity,
        optimisticTimestamp,
      });

      const promise = dispatch(thunkAction);


      activePromisesRef.current.set(key, promise);

      promise
        .unwrap()
        .then(() => {
          if (quantity === 0) {
            showToast.success(Messages.cart.removed);
          }
        })
        .catch((error: unknown) => {

          if (isAbortError(error)) {
            return;
          }
          showToast.error((error as { message?: string })?.message || Messages.cart.updateFailed);
        })
        .finally(() => {

          activePromisesRef.current.delete(key);
          isProcessingRef.current.set(key, false);


          processQueue(key);
        });
    },
    [dispatch]
  );


  const debouncedUpdate = useCallback(
    (
      key: string,
      productId: string,
      productSizeId: string | null,
      quantity: number,
      optimisticTimestamp?: number
    ) => {

      if (!productId) {
        return;
      }


      pendingUpdatesRef.current.set(key, {
        productId,
        productSizeId,
        quantity,
        optimisticTimestamp,
      });


      const existingTimer = timersRef.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);


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


  const immediateUpdate = useCallback(
    (
      key: string,
      productId: string,
      productSizeId: string | null,
      quantity: number,
      optimisticTimestamp?: number
    ) => {

      const existingTimer = timersRef.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);
      timersRef.current.delete(key);


      pendingUpdatesRef.current.set(key, {
        productId,
        productSizeId,
        quantity,
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
    return (
      timersRef.current.has(key) ||
      isProcessingRef.current.get(key) === true
    );
  }, []);

  return { debouncedUpdate, immediateUpdate, cancelAll, isUpdating };
}


export function cartItemKey(
  productId: string,
  productSizeId: string | null | undefined
): string {
  return `${productId}_${productSizeId ?? "null"}`;
}
